package com.eposter.backend.platform;

import com.eposter.backend.common.ApiPageResponse;
import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationService;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventService;
import com.eposter.backend.screen.Screen;
import com.eposter.backend.screen.ScreenService;
import com.eposter.backend.category.Category;
import com.eposter.backend.category.CategoryService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Facade Pattern: Provides a simplified interface to the complex subsystem
 * Coordinates multiple services to provide unified platform operations
 */
@Service
public class PlatformFacade {
    private final PublicationService publicationService;
    private final EventService eventService;
    private final ScreenService screenService;
    private final CategoryService categoryService;

    public PlatformFacade(PublicationService publicationService,
                         EventService eventService,
                         ScreenService screenService,
                         CategoryService categoryService) {
        this.publicationService = publicationService;
        this.eventService = eventService;
        this.screenService = screenService;
        this.categoryService = categoryService;
    }

    // Publication operations
    public ApiPageResponse<Publication> getPublications(int page, int size, String sort) {
        String[] parts = sort.split(",");
        Sort s = Sort.by(parts[0]);
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
            s = s.descending();
        }
        Pageable pageable = PageRequest.of(page, size, s);
        return ApiPageResponse.from(publicationService.list(pageable));
    }

    public Publication getPublicationDetail(Long id) {
        return publicationService.getById(id);
    }

    // Event operations
    public List<Event> getAllEvents() {
        return eventService.list(Pageable.unpaged()).getContent();
    }

    public Event getEventDetail(Long id) {
        return eventService.getById(id);
    }

    // Screen operations
    public List<Screen> getScreensByEvent(Long eventId) {
        return screenService.list(eventId);
    }

    public Screen getScreenDetail(Long id) {
        return screenService.getById(id);
    }

    // Category operations
    public List<Category> getCategoriesByEvent(Long eventId) {
        return categoryService.list(eventId, null);
    }

    // Cross-entity operations
    public Event getEventWithScreens(Long eventId) {
        Event event = eventService.getById(eventId);
        event.setScreens(screenService.list(eventId));
        return event;
    }

    public java.util.Map<String, Object> getStatistics() {
        long totalEvents = eventService.list(org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long totalPublications = publicationService.list(org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long totalScreens = screenService.list(null).size();
        long totalCategories = categoryService.list(null, null).size();
        long totalViews = publicationService.getTotalViews();
        List<Publication> topPublications = publicationService.getTopViewed();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("totalPublications", totalPublications);
        stats.put("totalScreens", totalScreens);
        stats.put("totalCategories", totalCategories);
        stats.put("totalViews", totalViews);
        stats.put("topPublications", topPublications);

        return stats;
    }
}

