package com.eposter.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/managers")
    public List<User> listManagers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ROLE_EVENT_MANAGER".equals(u.getRole().getName()))
                .toList();
    }

    @PostMapping("/managers")
    @ResponseStatus(HttpStatus.CREATED)
    public User createManager(@RequestBody User manager) {
        if (userRepository.findByEmail(manager.getEmail()).isPresent()) {
            throw new IllegalArgumentException("L'adresse email est déjà utilisée.");
        }
        manager.setId(null);
        if (manager.getPasswordHash() != null && !manager.getPasswordHash().isBlank()) {
            manager.setPasswordHash(passwordEncoder.encode(manager.getPasswordHash()));
        } else {
            manager.setPasswordHash(passwordEncoder.encode("manager123"));
        }
        manager.setCreatedAt(java.time.Instant.now());
        manager.setUpdatedAt(java.time.Instant.now());

        Role role = roleRepository.findByName("ROLE_EVENT_MANAGER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_EVENT_MANAGER");
                    newRole.setDescription("Responsable d'événement");
                    newRole.setCreatedAt(java.time.Instant.now());
                    return roleRepository.save(newRole);
                });
        manager.setRole(role);

        return userRepository.save(manager);
    }

    @PutMapping("/managers/{id}")
    public User updateManager(@PathVariable Long id, @RequestBody User managerData) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Responsable introuvable"));

        if (!existing.getEmail().equalsIgnoreCase(managerData.getEmail()) &&
                userRepository.findByEmail(managerData.getEmail()).isPresent()) {
            throw new IllegalArgumentException("L'adresse email est déjà utilisée.");
        }

        existing.setEmail(managerData.getEmail());
        existing.setFirstName(managerData.getFirstName());
        existing.setLastName(managerData.getLastName());
        if (managerData.getPasswordHash() != null && !managerData.getPasswordHash().isBlank()) {
            existing.setPasswordHash(passwordEncoder.encode(managerData.getPasswordHash()));
        }
        existing.setUpdatedAt(java.time.Instant.now());

        return userRepository.save(existing);
    }

    @DeleteMapping("/managers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteManager(@PathVariable Long id) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Responsable introuvable"));
        userRepository.delete(existing);
    }
}
