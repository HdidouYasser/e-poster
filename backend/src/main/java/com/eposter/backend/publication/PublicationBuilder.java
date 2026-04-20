package com.eposter.backend.publication;

import java.time.Instant;

public class PublicationBuilder {
    private final Publication publication = new Publication();

    public PublicationBuilder eventId(String eventId) {
        publication.setEventId(eventId);
        return this;
    }

    public PublicationBuilder title(String title) {
        publication.setTitle(title);
        return this;
    }

    public PublicationBuilder authors(String authors) {
        publication.setAuthors(authors);
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

    public PublicationBuilder posterUrl(String posterUrl) {
        publication.setPosterUrl(posterUrl);
        return this;
    }

    public PublicationBuilder publishDate(Instant publishDate) {
        publication.setPublishDate(publishDate);
        return this;
    }

    public Publication build() {
        return publication;
    }
}

