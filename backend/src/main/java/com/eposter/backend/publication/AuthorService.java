package com.eposter.backend.publication;

import com.eposter.backend.audit.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthorService {

    private final AuthorRepository repository;
    private final AuditService auditService;

    public AuthorService(AuthorRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    public Page<Author> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Author getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Author not found"));
    }

    public Author create(Author payload) {
        payload.setId(null);
        payload.setCreatedAt(Instant.now());
        Author saved = repository.save(payload);
        auditService.log("AUTHOR", saved.getId(), "CREATE", saved.getFirstName() + " " + saved.getLastName());
        return saved;
    }

    public Author update(Long id, Author payload) {
        Author existing = getById(id);
        existing.setFirstName(payload.getFirstName());
        existing.setLastName(payload.getLastName());
        existing.setEmail(payload.getEmail());
        existing.setAffiliation(payload.getAffiliation());
        existing.setIsCorresponding(payload.getIsCorresponding());
        Author saved = repository.save(existing);
        auditService.log("AUTHOR", saved.getId(), "UPDATE", saved.getFirstName() + " " + saved.getLastName());
        return saved;
    }

    public void delete(Long id) {
        Author existing = getById(id);
        repository.delete(existing);
        auditService.log("AUTHOR", id, "DELETE", existing.getFirstName() + " " + existing.getLastName());
    }
}
