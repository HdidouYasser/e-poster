package com.eposter.backend.platform;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.eposter.backend.category.CategoryRepository;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;
import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationRepository;
import com.eposter.backend.screen.ScreenRepository;

@Service
public class DashboardService {

    private final PublicationRepository publicationRepository;
    private final ScreenRepository screenRepository;
    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final long startTime = System.currentTimeMillis();

    public DashboardService(PublicationRepository publicationRepository, 
                          ScreenRepository screenRepository,
                          EventRepository eventRepository,
                          CategoryRepository categoryRepository) {
        this.publicationRepository = publicationRepository;
        this.screenRepository = screenRepository;
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardDTO getDashboardStats() {
        long totalPublications = publicationRepository.count();
        long totalScreens = screenRepository.count();
        long totalEvents = eventRepository.count();
        long totalCategories = categoryRepository.count();
        
        // Active events (end date after now)
        Instant now = Instant.now();
        long activeEvents = eventRepository.countByEndDateAfter(now);
        
        // Total and recent views
        long totalViews = getTotalViews();
        long recentViews = getRecentViews(now);
        
        // Top publications by views
        List<DashboardDTO.PublicationStatsDTO> topPubs = getTopPublications();
        
        // Upcoming events
        List<DashboardDTO.EventStatsDTO> upcomingEvts = getUpcomingEvents(now);
        
        // Health status
        DashboardDTO.DashboardHealthDTO health = getHealthStatus();

        return new DashboardDTO(totalPublications, totalScreens, activeEvents, 
                               totalEvents, totalCategories,
                               totalViews, recentViews, topPubs, upcomingEvts, health);
    }

    private long getTotalViews() {
        return publicationRepository.sumViewCount();
    }

    private long getRecentViews(Instant since) {
        // Views from last 7 days
        Instant sevenDaysAgo = since.minusSeconds(7 * 24 * 60 * 60);
        List<Publication> recentPubs = publicationRepository.findTop5ByDeletedAtIsNullOrderByViewCountDesc();
        return recentPubs.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(sevenDaysAgo))
            .mapToLong(p -> p.getViewCount() != null ? p.getViewCount().longValue() : 0L)
            .sum();
    }

    private List<DashboardDTO.PublicationStatsDTO> getTopPublications() {
        List<Publication> topFive = publicationRepository.findTop5ByDeletedAtIsNullOrderByViewCountDesc();
        List<DashboardDTO.PublicationStatsDTO> dtos = new ArrayList<>();
        for (Publication pub : topFive) {
            dtos.add(new DashboardDTO.PublicationStatsDTO(
                pub.getId(),
                pub.getTitle(),
                pub.getAuthors(),
                pub.getPosterUrl(),
                pub.getViewCount() != null ? pub.getViewCount().longValue() : 0L,
                pub.getCreatedAt()
            ));
        }
        return dtos;
    }

    private List<DashboardDTO.EventStatsDTO> getUpcomingEvents(Instant now) {
        List<Event> upcoming = eventRepository.findByStartDateGreaterThanEqualOrderByStartDateAsc(now);
        List<DashboardDTO.EventStatsDTO> dtos = new ArrayList<>();
        
        // Limit to 5 upcoming events
        int limit = Math.min(upcoming.size(), 5);
        for (int i = 0; i < limit; i++) {
            Event event = upcoming.get(i);
            long pubCount = publicationRepository.countPublicationsByEvent(event.getId());
            dtos.add(new DashboardDTO.EventStatsDTO(
                event.getId(),
                event.getTitle(),
                event.getStartDate(),
                pubCount,
                event.getStatus()
            ));
        }
        return dtos;
    }

    private DashboardDTO.DashboardHealthDTO getHealthStatus() {
        String dbStatus = "OK";
        long uptime = System.currentTimeMillis() - startTime;
        Instant lastSync = Instant.now();
        
        try {
            publicationRepository.count();
        } catch (Exception e) {
            dbStatus = "ERROR";
        }
        
        return new DashboardDTO.DashboardHealthDTO(dbStatus, uptime, lastSync);
    }
}
