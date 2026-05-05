package com.eposter.backend.screen;

import com.eposter.backend.event.Event;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "screens")
public class Screen implements ScreenComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    private String location;
    
    @Column(nullable = false)
    private String mode; // TOTEM, DISPLAY, VIDEO_WALL, etc
    
    private String resolution; // e.g., "1920x1080"
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToOne
    private Event event;
    
    @OneToMany(mappedBy = "screen", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScreenSection> sections = new ArrayList<>();

    @Column(name = "created_at")
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public List<ScreenSection> getSections() { return sections; }
    public void setSections(List<ScreenSection> sections) { this.sections = sections; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

    @Override
    public String display() {
        return "Screen " + name + " (" + mode + " - " + location + ")";
    }
}

