package com.eposter.backend.common;

import com.eposter.backend.auth.Role;
import com.eposter.backend.auth.RoleRepository;
import com.eposter.backend.auth.User;
import com.eposter.backend.auth.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DbInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DbInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialize admin role if it doesn't exist
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ROLE_ADMIN");
            role.setDescription("Administrator Role");
            role.setCreatedAt(Instant.now());
            return roleRepository.save(role);
        });

        // 2. Initialize default admin user if it doesn't exist
        if (userRepository.findByEmail("admin").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setRole(adminRole);
            admin.setCreatedAt(Instant.now());
            admin.setUpdatedAt(Instant.now());
            userRepository.save(admin);
            System.out.println("Default admin user created with password 'admin123'");
        }
    }
}
