package com.eposter.backend.event;

import com.eposter.backend.audit.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EventService {

    private final EventRepository repository;
    private final AuditService auditService;

    public EventService(EventRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    public Page<Event> list(Pageable pageable) {
        return repository.findByDeletedAtIsNull(pageable);
    }

    public Page<Event> search(String query, Pageable pageable) {
        return repository.searchFullText(query, pageable);
    }

    public Event getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    public Event getActiveEvent() {
        return repository.findFirstByStatusIgnoreCaseAndDeletedAtIsNullOrderByUpdatedAtDesc("ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("No active event found"));
    }

    public Event create(Event payload) {
        Instant now = Instant.now();
        payload.setId(null);
        payload.setDeletedAt(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        Event saved = repository.save(payload);
        auditService.log("EVENT", saved.getId(), "CREATE", saved.getTitle());
        return saved;
    }

    public Event update(Long id, Event payload) {
        Event existing = getById(id);
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
        Event saved = repository.save(existing);
        auditService.log("EVENT", saved.getId(), "UPDATE", saved.getTitle());
        return saved;
    }

    public void delete(Long id) {
        Event existing = getById(id);
        repository.delete(existing);
        auditService.log("EVENT", id, "DELETE", existing.getTitle());
    }
}
