package com.eposter.backend.auth;

import com.eposter.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public AuthService(JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
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
        return new AuthDtos.LoginResponse(token, user.getEmail(), roleName);
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

        Role role = roleRepository.findByName("ROLE_EVENT_MANAGER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_EVENT_MANAGER");
                    newRole.setDescription("Responsable d'événement");
                    newRole.setCreatedAt(java.time.Instant.now());
                    return roleRepository.save(newRole);
                });
        user.setRole(role);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail(), role.getName());
        return new AuthDtos.LoginResponse(token, savedUser.getEmail(), role.getName());
    }
}
