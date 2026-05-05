package com.eposter.backend.publication;

import com.eposter.backend.event.Event;
import com.eposter.backend.media.Media;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PublicationBuilder {
    private final Publication publication = new Publication();
    private List<Author> authors = new ArrayList<>();
    private List<Media> mediaList = new ArrayList<>();

    public PublicationBuilder event(Event event) {
        publication.setEvent(event);
        return this;
    }

    public PublicationBuilder eventId(String eventId) {
        publication.setEventId(eventId);
        return this;
    }

    public PublicationBuilder authors(String authors) {
        publication.setAuthors(authors);
        return this;
    }

    public PublicationBuilder category(String category) {
        publication.setCategory(category);
        return this;
    }

    public PublicationBuilder title(String title) {
        publication.setTitle(title);
        return this;
    }

    public PublicationBuilder abstractText(String abstractText) {
        publication.setAbstractText(abstractText);
        return this;
    }

    public PublicationBuilder description(String description) {
        publication.setDescription(description);
        return this;
    }

    public PublicationBuilder status(String status) {
        publication.setStatus(status);
        return this;
    }

    public PublicationBuilder session(String session) {
        publication.setSession(session);
        return this;
    }

    public PublicationBuilder room(String room) {
        publication.setRoom(room);
        return this;
    }

    public PublicationBuilder posterUrl(String posterUrl) {
        publication.setPosterUrl(posterUrl);
        return this;
    }

    public PublicationBuilder publishDate(Instant publishDate) {
        publication.setPublishDate(publishDate);
        return this;
    }

    public PublicationBuilder addAuthor(Author author, Integer order) {
        authors.add(author);
        // Will create PublicationAuthor junction entities during build
        return this;
    }

    public PublicationBuilder addMedia(Media media) {
        mediaList.add(media);
        return this;
    }

    public Publication build() {
        publication.setMediaList(mediaList);
        // PublicationAuthors will be created via service layer
        return publication;
    }
    
    public Publication getPublication() {
        return publication;
    }
}

