package com.eposter.backend.screen;

import com.eposter.backend.publication.Publication;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "screen_sections")
public class ScreenSection implements ScreenComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private Integer position;
    @ManyToOne
    private Screen screen;
    @ManyToOne
    private Publication publication;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Screen getScreen() { return screen; }
    public void setScreen(Screen screen) { this.screen = screen; }
    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }

    @Override
    public String display() {
        return "Section " + title;
    }
}

