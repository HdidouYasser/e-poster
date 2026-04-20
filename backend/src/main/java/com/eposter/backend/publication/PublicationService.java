package com.eposter.backend.publication;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class PublicationService {

    private final PublicationRepository repository;

    public PublicationService(PublicationRepository repository) {
        this.repository = repository;
    }

    public Page<Publication> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<Publication> listByEventId(String eventId, Pageable pageable) {
        return repository.findByEventId(eventId, pageable);
    }

    public Page<Publication> search(String query, String eventId, String session, String category, String room, Pageable pageable) {
        return repository.searchFullText(query, eventId, session, category, room, pageable);
    }

    public Publication getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Publication not found"));
    }

    public Publication create(Publication payload) {
        Instant now = Instant.now();
        payload.setId(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        return repository.save(payload);
    }

    public Publication update(Long id, Publication payload) {
        Publication existing = getById(id);
        existing.setEventId(payload.getEventId());
        existing.setTitle(payload.getTitle());
        existing.setAuthors(payload.getAuthors());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        existing.setSession(payload.getSession());
        existing.setCategory(payload.getCategory());
        existing.setRoom(payload.getRoom());
        existing.setPosterUrl(payload.getPosterUrl());
        existing.setPublishDate(payload.getPublishDate());
        existing.setUpdatedAt(Instant.now());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
