package com.eposter.backend.auth;

import com.eposter.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public AuthService(JwtService jwtService, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_ADMIN";
        String token = jwtService.generateToken(user.getEmail(), roleName);
        return new AuthDtos.LoginResponse(
                token, user.getEmail(), roleName,
                user.getFirstName(), user.getLastName(), user.getAvatarUrl()
        );
    }

    public AuthDtos.LoginResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("L'adresse email est déjà utilisée.");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCreatedAt(java.time.Instant.now());
        user.setUpdatedAt(java.time.Instant.now());

        Role role = findOrCreateManagerRole();
        user.setRole(role);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail(), role.getName());
        return new AuthDtos.LoginResponse(
                token, savedUser.getEmail(), role.getName(),
                savedUser.getFirstName(), savedUser.getLastName(), savedUser.getAvatarUrl()
        );
    }

    /**
     * Verifies a Google ID token via Google's tokeninfo endpoint,
     * then creates or loads the user and returns an application JWT.
     */
    @SuppressWarnings("unchecked")
    public AuthDtos.LoginResponse loginWithGoogle(String idToken) {
        // Verify token with Google
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        Map<String, Object> tokenInfo;
        try {
            tokenInfo = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token Google invalide ou expiré.");
        }

        if (tokenInfo == null || tokenInfo.containsKey("error")) {
            throw new IllegalArgumentException("Token Google invalide.");
        }

        String email = (String) tokenInfo.get("email");
        String firstName = (String) tokenInfo.getOrDefault("given_name", "");
        String lastName = (String) tokenInfo.getOrDefault("family_name", "");
        String picture = (String) tokenInfo.getOrDefault("picture", null);

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Impossible de récupérer l'email depuis Google.");
        }

        // Load or create user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setAvatarUrl(picture);
            // Non-usable password for Google-only accounts
            newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setIsGoogleAccount(true);
            newUser.setCreatedAt(java.time.Instant.now());
            newUser.setUpdatedAt(java.time.Instant.now());
            newUser.setRole(findOrCreateManagerRole());
            return userRepository.save(newUser);
        });

        // Ensure isGoogleAccount is updated/set to true and update avatar if needed
        boolean needsUpdate = false;
        if (Boolean.FALSE.equals(user.getIsGoogleAccount())) {
            user.setIsGoogleAccount(true);
            needsUpdate = true;
        }
        if (picture != null && user.getAvatarUrl() == null) {
            user.setAvatarUrl(picture);
            needsUpdate = true;
        }
        if (needsUpdate) {
            user.setUpdatedAt(java.time.Instant.now());
            userRepository.save(user);
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_EVENT_MANAGER";
        String token = jwtService.generateToken(user.getEmail(), roleName);
        return new AuthDtos.LoginResponse(
                token, user.getEmail(), roleName,
                user.getFirstName(), user.getLastName(), user.getAvatarUrl()
        );
    }

    private Role findOrCreateManagerRole() {
        return roleRepository.findByName("ROLE_EVENT_MANAGER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_EVENT_MANAGER");
                    newRole.setDescription("Responsable d'événement");
                    newRole.setCreatedAt(java.time.Instant.now());
                    return roleRepository.save(newRole);
                });
    }
}
