package com.eposter.backend.audit;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(String entityType, Long entityId, String action, String details) {
        AuditLog row = new AuditLog();
        row.setUsername(currentUsername());
        row.setEntityType(entityType);
        row.setEntityId(entityId);
        row.setAction(action);
        row.setDetails(details != null && details.length() > 4000 ? details.substring(0, 4000) : details);
        row.setCreatedAt(Instant.now());
        repository.save(row);
    }

    private static String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            return "system";
        }
        return auth.getName();
    }
}
