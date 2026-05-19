package com.eposter.backend.category;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;
    private final EventRepository eventRepository;
    private final AuditService auditService;

    public CategoryService(CategoryRepository repository, EventRepository eventRepository, AuditService auditService) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.auditService = auditService;
    }

    public List<Category> list(Long eventId, String type) {
        if (eventId != null && type != null && !type.isBlank()) {
            return repository.findByEvent_IdAndTypeIgnoreCaseAndDeletedAtIsNull(eventId, type);
        }
        if (eventId != null) {
            return repository.findByEvent_IdAndDeletedAtIsNull(eventId);
        }
        return repository.findByDeletedAtIsNull();
    }

    public Category getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Category not found"));
    }

    public Category create(Category payload) {
        payload.setId(null);
        payload.setDeletedAt(null);
        if (payload.getEvent() != null && payload.getEvent().getId() != null) {
            payload.setEvent(resolveEvent(payload.getEvent().getId()));
        }
        Category saved = repository.save(payload);
        auditService.log("CATEGORY", saved.getId(), "CREATE", saved.getName());
        return saved;
    }

    public Category update(Long id, Category payload) {
        Category existing = getById(id);
        existing.setName(payload.getName());
        existing.setType(payload.getType());
        if (payload.getEvent() != null && payload.getEvent().getId() != null) {
            existing.setEvent(resolveEvent(payload.getEvent().getId()));
        }
        Category saved = repository.save(existing);
        auditService.log("CATEGORY", saved.getId(), "UPDATE", saved.getName());
        return saved;
    }

    public void delete(Long id) {
        Category existing = getById(id);
        repository.delete(existing);
        auditService.log("CATEGORY", id, "DELETE", existing.getName());
    }

    private Event resolveEvent(Long eventId) {
        return eventRepository.findByIdAndDeletedAtIsNull(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }
}
