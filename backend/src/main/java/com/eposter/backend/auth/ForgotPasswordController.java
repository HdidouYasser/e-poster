package com.eposter.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(UserRepository userRepository,
                                    PasswordResetTokenRepository tokenRepository,
                                    EmailService emailService,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "L'adresse email est requise."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Standard security practice: return a success message even if email is not found to prevent user enumeration
            return ResponseEntity.ok(Map.of("message", "Si cet email existe dans notre base de données, un lien de réinitialisation vous a été envoyé."));
        }

        // Clean up old tokens for this user (find + delete + flush to avoid unique constraint)
        tokenRepository.findByUser(user).ifPresent(existing -> {
            tokenRepository.delete(existing);
            tokenRepository.flush();
        });

        // Generate token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(Instant.now().plusSeconds(15 * 60)); // 15 minutes validity
        tokenRepository.save(resetToken);

        // Send email
        emailService.sendResetPasswordEmail(user.getEmail(), token);

        return ResponseEntity.ok(Map.of("message", "Si cet email existe dans notre base de données, un lien de réinitialisation vous a été envoyé."));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Les paramètres requis sont manquants."));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);
        if (resetToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Jeton de réinitialisation invalide."));
        }

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("message", "Le jeton de réinitialisation a expiré."));
        }

        // Update password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        // Delete token
        tokenRepository.delete(resetToken);

        // Send confirmation email
        emailService.sendPasswordChangedNotificationEmail(user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Votre mot de passe a été réinitialisé avec succès."));
    }
}
