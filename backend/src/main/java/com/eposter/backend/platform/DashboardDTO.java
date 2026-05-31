package com.eposter.backend.platform;

import java.time.Instant;
import java.util.List;

public class DashboardDTO {
    private long totalPublications;
    private long totalScreens;
    private long activeEvents;
    private long totalEvents;
    private long totalCategories;
    private long totalViews;
    private long recentViews;
    private List<PublicationStatsDTO> topPublications;
    private List<EventStatsDTO> upcomingEvents;
    private DashboardHealthDTO health;

    public DashboardDTO() {}

    public DashboardDTO(long totalPublications, long totalScreens, long activeEvents, 
                        long totalEvents, long totalCategories,
                        long totalViews, long recentViews,
                        List<PublicationStatsDTO> topPublications, List<EventStatsDTO> upcomingEvents,
                        DashboardHealthDTO health) {
        this.totalPublications = totalPublications;
        this.totalScreens = totalScreens;
        this.activeEvents = activeEvents;
        this.totalEvents = totalEvents;
        this.totalCategories = totalCategories;
        this.totalViews = totalViews;
        this.recentViews = recentViews;
        this.topPublications = topPublications;
        this.upcomingEvents = upcomingEvents;
        this.health = health;
    }

    public long getTotalPublications() { return totalPublications; }
    public void setTotalPublications(long totalPublications) { this.totalPublications = totalPublications; }

    public long getTotalScreens() { return totalScreens; }
    public void setTotalScreens(long totalScreens) { this.totalScreens = totalScreens; }

    public long getActiveEvents() { return activeEvents; }
    public void setActiveEvents(long activeEvents) { this.activeEvents = activeEvents; }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public long getRecentViews() { return recentViews; }
    public void setRecentViews(long recentViews) { this.recentViews = recentViews; }

    public List<PublicationStatsDTO> getTopPublications() { return topPublications; }
    public void setTopPublications(List<PublicationStatsDTO> topPublications) { this.topPublications = topPublications; }

    public List<EventStatsDTO> getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(List<EventStatsDTO> upcomingEvents) { this.upcomingEvents = upcomingEvents; }

    public DashboardHealthDTO getHealth() { return health; }
    public void setHealth(DashboardHealthDTO health) { this.health = health; }

    public static class PublicationStatsDTO {
        private Long id;
        private String title;
        private String authors;
        private String posterUrl;
        private Long viewCount;
        private Instant createdAt;

        public PublicationStatsDTO() {}
        
        public PublicationStatsDTO(Long id, String title, String authors, String posterUrl, Long viewCount, Instant createdAt) {
            this.id = id;
            this.title = title;
            this.authors = authors;
            this.posterUrl = posterUrl;
            this.viewCount = viewCount;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getAuthors() { return authors; }
        public void setAuthors(String authors) { this.authors = authors; }
        
        public String getPosterUrl() { return posterUrl; }
        public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

        public Long getViewCount() { return viewCount; }
        public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
        
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class EventStatsDTO {
        private Long id;
        private String name;
        private Instant startDate;
        private Long publicationCount;
        private String status;

        public EventStatsDTO() {}
        public EventStatsDTO(Long id, String name, Instant startDate, Long publicationCount, String status) {
            this.id = id;
            this.name = name;
            this.startDate = startDate;
            this.publicationCount = publicationCount;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Instant getStartDate() { return startDate; }
        public void setStartDate(Instant startDate) { this.startDate = startDate; }
        public Long getPublicationCount() { return publicationCount; }
        public void setPublicationCount(Long publicationCount) { this.publicationCount = publicationCount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DashboardHealthDTO {
        private String dbStatus;
        private long uptime;
        private Instant lastSync;

        public DashboardHealthDTO() {}
        public DashboardHealthDTO(String dbStatus, long uptime, Instant lastSync) {
            this.dbStatus = dbStatus;
            this.uptime = uptime;
            this.lastSync = lastSync;
        }

        public String getDbStatus() { return dbStatus; }
        public void setDbStatus(String dbStatus) { this.dbStatus = dbStatus; }
        public long getUptime() { return uptime; }
        public void setUptime(long uptime) { this.uptime = uptime; }
        public Instant getLastSync() { return lastSync; }
        public void setLastSync(Instant lastSync) { this.lastSync = lastSync; }
    }
}
