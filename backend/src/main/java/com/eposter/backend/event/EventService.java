package com.eposter.backend.event;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.auth.User;
import com.eposter.backend.auth.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EventService {

    private final EventRepository repository;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public EventService(EventRepository repository, AuditService auditService, UserRepository userRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    private boolean isEventManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_EVENT_MANAGER".equals(a.getAuthority()));
        }
        return false;
    }

    public Page<Event> list(Pageable pageable) {
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null) {
                return repository.findByManagerEmailAndDeletedAtIsNull(email, pageable);
            }
        }
        return repository.findByDeletedAtIsNull(pageable);
    }

    public Page<Event> search(String query, Pageable pageable) {
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null) {
                return repository.searchFullTextByManager(query, email, pageable);
            }
        }
        return repository.searchFullText(query, pageable);
    }

    public Event getById(Long id) {
        Event event = repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        // Check ownership if event manager
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null && (event.getManager() == null || !email.equals(event.getManager().getEmail()))) {
                throw new IllegalArgumentException("Access Denied: You do not manage this event");
            }
        }
        return event;
    }

    public Event getActiveEvent() {
        return repository.findFirstByStatusIgnoreCaseAndDeletedAtIsNullOrderByUpdatedAtDesc("ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("No active event found"));
    }

    public Event create(Event payload, String managerEmail) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to create events");
        }
        Instant now = Instant.now();
        payload.setId(null);
        payload.setDeletedAt(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        if (managerEmail != null && !managerEmail.isBlank()) {
            User manager = userRepository.findByEmail(managerEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Event Manager not found: " + managerEmail));
            payload.setManager(manager);
        }
        Event saved = repository.save(payload);
        auditService.log("EVENT", saved.getId(), "CREATE", saved.getTitle());
        return saved;
    }

    public Event update(Long id, Event payload, String managerEmail) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to edit events");
        }
        Event existing = getById(id); // Already performs ownership check
        existing.setTitle(payload.getTitle());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        existing.setStartDate(payload.getStartDate());
        existing.setEndDate(payload.getEndDate());
        existing.setLogoUrl(payload.getLogoUrl());
        existing.setColorPrimary(payload.getColorPrimary());
        existing.setColorSecondary(payload.getColorSecondary());
        existing.setBannerUrl(payload.getBannerUrl());
        existing.setProgramUrl(payload.getProgramUrl());
        existing.setRevueUrl(payload.getRevueUrl());
        existing.setUpdatedAt(Instant.now());

        // Admins can change the manager, managers cannot reassign
        if (!isEventManager()) {
            if (managerEmail != null && !managerEmail.isBlank()) {
                User manager = userRepository.findByEmail(managerEmail)
                        .orElseThrow(() -> new IllegalArgumentException("Event Manager not found: " + managerEmail));
                existing.setManager(manager);
            } else {
                existing.setManager(null);
            }
        }

        Event saved = repository.save(existing);
        auditService.log("EVENT", saved.getId(), "UPDATE", saved.getTitle());
        return saved;
    }

    public void delete(Long id) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to delete events");
        }
        Event existing = getById(id); // Performs ownership check
        repository.delete(existing);
        auditService.log("EVENT", id, "DELETE", existing.getTitle());
    }

}
