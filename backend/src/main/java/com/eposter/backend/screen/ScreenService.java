package com.eposter.backend.screen;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;
import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScreenService {

    private final ScreenRepository repository;
    private final ScreenSectionRepository sectionRepository;
    private final EventRepository eventRepository;
    private final PublicationRepository publicationRepository;
    private final AuditService auditService;

    public ScreenService(
            ScreenRepository repository,
            ScreenSectionRepository sectionRepository,
            EventRepository eventRepository,
            PublicationRepository publicationRepository,
            AuditService auditService
    ) {
        this.repository = repository;
        this.sectionRepository = sectionRepository;
        this.eventRepository = eventRepository;
        this.publicationRepository = publicationRepository;
        this.auditService = auditService;
    }

    public List<Screen> list(Long eventId) {
        if (eventId != null) {
            return repository.findByEvent_IdAndIsActiveTrueAndDeletedAtIsNull(eventId);
        }
        return repository.findByDeletedAtIsNull();
    }

    public Screen getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Screen not found"));
    }

    public Screen create(Screen payload) {
        Instant now = Instant.now();
        payload.setId(null);
        if (payload.getEvent() == null || payload.getEvent().getId() == null) {
            throw new IllegalArgumentException("eventId is required");
        }
        payload.setEvent(resolveEvent(payload.getEvent().getId()));
        payload.setDeletedAt(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        Screen created = repository.save(payload);
        if (payload.getSections() != null && !payload.getSections().isEmpty()) {
            replaceLayout(created.getId(), payload.getSections());
        }
        Screen result = getById(created.getId());
        auditService.log("SCREEN", result.getId(), "CREATE", result.getName());
        return result;
    }

    public Screen update(Long id, Screen payload) {
        Screen existing = getById(id);
        existing.setName(payload.getName());
        existing.setLocation(payload.getLocation());
        existing.setMode(payload.getMode());
        existing.setResolution(payload.getResolution());
        existing.setIsActive(payload.getIsActive() != null ? payload.getIsActive() : true);
        if (payload.getEvent() != null && payload.getEvent().getId() != null) {
            existing.setEvent(resolveEvent(payload.getEvent().getId()));
        }
        existing.setUpdatedAt(Instant.now());
        Screen updated = repository.save(existing);
        if (payload.getSections() != null) {
            replaceLayout(updated.getId(), payload.getSections());
        }
        Screen result = getById(updated.getId());
        auditService.log("SCREEN", result.getId(), "UPDATE", result.getName());
        return result;
    }

    public void delete(Long id) {
        Screen existing = getById(id);
        repository.delete(existing);
        auditService.log("SCREEN", id, "DELETE", existing.getName());
    }

    public List<ScreenSection> getLayout(Long screenId) {
        getById(screenId);
        return sectionRepository.findByScreenIdOrderByPositionAsc(screenId);
    }

    public List<ScreenSection> replaceLayout(Long screenId, List<ScreenSection> sections) {
        Screen screen = getById(screenId);
        List<ScreenSection> existing = sectionRepository.findByScreenIdOrderByPositionAsc(screenId);
        if (!existing.isEmpty()) {
            sectionRepository.deleteAll(existing);
        }
        List<ScreenSection> toSave = new ArrayList<>();
        int index = 0;
        for (ScreenSection section : sections) {
            ScreenSection entity = new ScreenSection();
            entity.setScreen(screen);
            entity.setTitle(section.getTitle());
            entity.setPosition(section.getPosition() != null ? section.getPosition() : index);
            if (section.getPublication() != null && section.getPublication().getId() != null) {
                Publication publication = publicationRepository.findByIdAndDeletedAtIsNull(section.getPublication().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Publication not found"));
                entity.setPublication(publication);
            }
            toSave.add(entity);
            index++;
        }
        return sectionRepository.saveAll(toSave);
    }

    private Event resolveEvent(Long eventId) {
        return eventRepository.findByIdAndDeletedAtIsNull(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }
}

