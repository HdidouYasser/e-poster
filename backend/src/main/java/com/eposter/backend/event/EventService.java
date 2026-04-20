package com.eposter.backend.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EventService {

    private final EventRepository repository;

    public EventService(EventRepository repository) {
        this.repository = repository;
    }

    public Page<Event> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<Event> search(String query, Pageable pageable) {
        return repository.searchFullText(query, pageable);
    }

    public Event getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    public Event create(Event payload) {
        Instant now = Instant.now();
        payload.setId(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        return repository.save(payload);
    }

    public Event update(Long id, Event payload) {
        Event existing = getById(id);
        existing.setTitle(payload.getTitle());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        existing.setStartDate(payload.getStartDate());
        existing.setEndDate(payload.getEndDate());
        existing.setUpdatedAt(Instant.now());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
