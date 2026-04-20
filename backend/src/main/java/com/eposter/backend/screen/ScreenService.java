package com.eposter.backend.screen;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ScreenService {

    private final ScreenRepository repository;

    public ScreenService(ScreenRepository repository) {
        this.repository = repository;
    }

    public List<Screen> list() {
        return repository.findAll();
    }

    public Screen getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Screen not found"));
    }

    public Screen create(Screen payload) {
        Instant now = Instant.now();
        payload.setId(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        return repository.save(payload);
    }

    public Screen update(Long id, Screen payload) {
        Screen existing = getById(id);
        existing.setName(payload.getName());
        existing.setLocation(payload.getLocation());
        existing.setMode(payload.getMode());
        existing.setUpdatedAt(Instant.now());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}

