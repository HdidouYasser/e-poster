package com.eposter.backend.publication;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.category.Category;
import com.eposter.backend.category.CategoryRepository;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class PublicationService {

    private final PublicationRepository repository;
    private final EventRepository eventRepository;
    private final AuditService auditService;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;

    public PublicationService(PublicationRepository repository, EventRepository eventRepository, AuditService auditService, AuthorRepository authorRepository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.auditService = auditService;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
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
        Long eventIdLong = null;
        if (eventId != null && !eventId.isBlank()) {
            try { eventIdLong = Long.parseLong(eventId); } catch (NumberFormatException ignored) {}
        }
        return repository.searchFullText(query, eventIdLong, session, room, category, pageable);
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
        
        processRelations(payload);
        
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
        
        existing.setAuthorIds(payload.getAuthorIds());
        existing.setCategoryIds(payload.getCategoryIds());
        processRelations(existing);
        
        Publication saved = repository.save(existing);
        auditService.log("PUBLICATION", saved.getId(), "UPDATE", saved.getTitle());
        return saved;
    }
    
    private void processRelations(Publication publication) {
        if (publication.getAuthorIds() != null) {
            publication.getPublicationAuthors().clear();
            List<String> authorNames = new ArrayList<>();
            int order = 0;
            for (Long authorId : publication.getAuthorIds()) {
                Author author = authorRepository.findById(authorId).orElse(null);
                if (author != null) {
                    PublicationAuthor pa = new PublicationAuthor();
                    pa.setPublication(publication);
                    pa.setAuthor(author);
                    pa.setAuthorOrder(order++);
                    publication.getPublicationAuthors().add(pa);
                    authorNames.add(author.getFirstName() + " " + author.getLastName());
                }
            }
            if (!authorNames.isEmpty() && (publication.getAuthors() == null || publication.getAuthors().isBlank())) {
                publication.setAuthors(String.join(", ", authorNames));
            }
        }
        
        if (publication.getCategoryIds() != null) {
            publication.getPublicationCategories().clear();
            List<String> categoryNames = new ArrayList<>();
            for (Long categoryId : publication.getCategoryIds()) {
                Category category = categoryRepository.findByIdAndDeletedAtIsNull(categoryId).orElse(null);
                if (category != null) {
                    PublicationCategory pc = new PublicationCategory();
                    pc.setPublication(publication);
                    pc.setCategory(category);
                    publication.getPublicationCategories().add(pc);
                    categoryNames.add(category.getName());
                }
            }
            if (!categoryNames.isEmpty() && (publication.getCategory() == null || publication.getCategory().isBlank())) {
                publication.setCategory(String.join(", ", categoryNames));
            }
        }
    }

    public void delete(Long id) {
        Publication existing = getById(id);
        repository.delete(existing);
        auditService.log("PUBLICATION", id, "DELETE", existing.getTitle());
    }
}
