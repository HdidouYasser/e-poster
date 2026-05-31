package com.eposter.backend.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eposter.backend.audit.AuditService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @PersistenceContext
    private EntityManager entityManager;

    private final AuditService auditService;

    public AdminController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping("/sync-database")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> syncDatabase() {
        // Disabling foreign key checks to avoid deletion constraint violations during sync
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

        try {
            // 1. Clean up duplicate screens (keeping lowest ID)
            entityManager.createNativeQuery(
                "DELETE FROM screens WHERE id NOT IN (" +
                "  SELECT min_id FROM (" +
                "    SELECT MIN(id) as min_id FROM screens GROUP BY name, location" +
                "  ) as sub" +
                ")"
            ).executeUpdate();

            // 2. Clean up duplicate categories (keeping lowest ID)
            entityManager.createNativeQuery(
                "DELETE FROM categories WHERE id NOT IN (" +
                "  SELECT min_id FROM (" +
                "    SELECT MIN(id) as min_id FROM categories GROUP BY name" +
                "  ) as sub" +
                ")"
            ).executeUpdate();

            // 3. Clean up duplicate authors (keeping lowest ID)
            entityManager.createNativeQuery(
                "DELETE FROM authors WHERE id NOT IN (" +
                "  SELECT min_id FROM (" +
                "    SELECT MIN(id) as min_id FROM authors GROUP BY first_name, last_name, email" +
                "  ) as sub" +
                ")"
            ).executeUpdate();

            // 4. Clean up duplicate events (keeping lowest ID)
            entityManager.createNativeQuery(
                "DELETE FROM events WHERE id NOT IN (" +
                "  SELECT min_id FROM (" +
                "    SELECT MIN(id) as min_id FROM events GROUP BY title, start_date, end_date" +
                "  ) as sub" +
                ")"
            ).executeUpdate();

            // Log action in Audit log
            auditService.log("SYSTEM", 0L, "SYNC", "Synchronisation et nettoyage de la base de donnees (doublons supprimes)");

            return ResponseEntity.ok("Database sync and cleanup completed successfully");
        } finally {
            // Restore foreign key checks
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        }
    }
}
