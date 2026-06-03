package com.eposter.backend.event;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.eposter.backend.publication.Publication;
import com.eposter.backend.screen.Screen;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String status;
    private Instant startDate;
    private Instant endDate;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    @Column(columnDefinition = "TEXT")
    private String logoUrl;
    @Column(length = 7)
    private String colorPrimary;
    @Column(length = 7)
    private String colorSecondary;
    @Column(columnDefinition = "TEXT")
    private String bannerUrl;
    @Column(columnDefinition = "TEXT")
    private String programUrl;
    @Column(columnDefinition = "TEXT")
    private String revueUrl;
    @OneToMany(mappedBy = "event")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Publication> publications = new ArrayList<>();
    @OneToMany(mappedBy = "event")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Screen> screens = new ArrayList<>();
    @jakarta.persistence.ManyToOne
    @jakarta.persistence.JoinColumn(name = "manager_id")
    private com.eposter.backend.auth.User manager;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getColorPrimary() { return colorPrimary; }
    public void setColorPrimary(String colorPrimary) { this.colorPrimary = colorPrimary; }
    public String getColorSecondary() { return colorSecondary; }
    public void setColorSecondary(String colorSecondary) { this.colorSecondary = colorSecondary; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public String getProgramUrl() { return programUrl; }
    public void setProgramUrl(String programUrl) { this.programUrl = programUrl; }
    public String getRevueUrl() { return revueUrl; }
    public void setRevueUrl(String revueUrl) { this.revueUrl = revueUrl; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<Publication> getPublications() { return publications; }
    public void setPublications(List<Publication> publications) { this.publications = publications; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<Screen> getScreens() { return screens; }
    public void setScreens(List<Screen> screens) { this.screens = screens; }
    public com.eposter.backend.auth.User getManager() { return manager; }
    public void setManager(com.eposter.backend.auth.User manager) { this.manager = manager; }
}
