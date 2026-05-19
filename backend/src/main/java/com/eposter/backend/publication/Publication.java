package com.eposter.backend.publication;

import com.eposter.backend.event.Event;
import com.eposter.backend.media.Media;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "publications",
        indexes = {
                @Index(name = "idx_publications_event_id", columnList = "event_ref_id"),
                @Index(name = "idx_publications_status", columnList = "status")
        }
)
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "event_ref_id")
    private Event event;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String abstractText;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String status;
    private String session;
    private String room;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @JsonIgnore
    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> mediaList = new ArrayList<>();
    
    @JsonIgnore
    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PublicationAuthor> publicationAuthors = new ArrayList<>();
    
    @JsonIgnore
    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PublicationCategory> publicationCategories = new ArrayList<>();
    
    @Column(name = "publish_date")
    private Instant publishDate;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Transient
    private String eventId;
    
    @Column(name = "authors_str")
    private String authors;
    
    @Column(name = "category_str")
    private String category;

    @Transient
    private List<Long> authorIds;
    
    @Transient
    private List<Long> categoryIds;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public List<Media> getMediaList() { return mediaList; }
    public void setMediaList(List<Media> mediaList) { this.mediaList = mediaList; }
    public List<PublicationAuthor> getPublicationAuthors() { return publicationAuthors; }
    public void setPublicationAuthors(List<PublicationAuthor> publicationAuthors) { this.publicationAuthors = publicationAuthors; }
    public List<PublicationCategory> getPublicationCategories() { return publicationCategories; }
    public void setPublicationCategories(List<PublicationCategory> publicationCategories) { this.publicationCategories = publicationCategories; }
    public Instant getPublishDate() { return publishDate; }
    public void setPublishDate(Instant publishDate) { this.publishDate = publishDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<Long> getAuthorIds() { return authorIds; }
    public void setAuthorIds(List<Long> authorIds) { this.authorIds = authorIds; }
    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }
}
