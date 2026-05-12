package com.eposter.backend.publication;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class PublicationService {

    private final PublicationRepository repository;
    private final EventRepository eventRepository;
    private final AuditService auditService;

    public PublicationService(PublicationRepository repository, EventRepository eventRepository, AuditService auditService) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.auditService = auditService;
    }

    public Page<Publication> list(Pageable pageable) {
        return repository.findByDeletedAtIsNull(pageable);
    }

    public Page<Publication> listByEventId(String eventId, Pageable pageable) {
        Long id = null;
        try { id = Long.parseLong(eventId); } catch (NumberFormatException e) {}
        return repository.findByEvent_IdAndDeletedAtIsNull(id, pageable);
    }

    public Page<Publication> search(String query, String eventId, String session, String category, String room, Pageable pageable) {
        return repository.searchFullText(query, eventId, session, room, category, pageable);
    }

    public Publication getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Publication not found"));
    }

    public Publication create(Publication payload) {
        Instant now = Instant.now();
        payload.setId(null);
        payload.setDeletedAt(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        if (payload.getEventId() != null && !payload.getEventId().isBlank()) {
            Long eventId = Long.parseLong(payload.getEventId());
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            payload.setEvent(event);
        }
        Publication saved = repository.save(payload);
        auditService.log("PUBLICATION", saved.getId(), "CREATE", saved.getTitle());
        return saved;
    }

    public Publication update(Long id, Publication payload) {
        Publication existing = getById(id);
        if (payload.getEventId() != null && !payload.getEventId().isBlank()) {
            Long eventId = Long.parseLong(payload.getEventId());
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            existing.setEvent(event);
        } else {
            existing.setEvent(null);
        }
        existing.setTitle(payload.getTitle());
        existing.setAbstractText(payload.getAbstractText());
        existing.setAuthors(payload.getAuthors());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        existing.setSession(payload.getSession());
        existing.setCategory(payload.getCategory());
        existing.setRoom(payload.getRoom());
        existing.setPosterUrl(payload.getPosterUrl());
        existing.setPublishDate(payload.getPublishDate());
        existing.setUpdatedAt(Instant.now());
        Publication saved = repository.save(existing);
        auditService.log("PUBLICATION", saved.getId(), "UPDATE", saved.getTitle());
        return saved;
    }

    public void delete(Long id) {
        Publication existing = getById(id);
        existing.setDeletedAt(Instant.now());
        existing.setUpdatedAt(Instant.now());
        repository.save(existing);
        auditService.log("PUBLICATION", id, "DELETE", existing.getTitle());
    }
}
