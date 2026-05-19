package com.eposter.backend.publication;

import com.eposter.backend.common.ApiPageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    private final PublicationService service;

    public PublicationController(PublicationService service) {
        this.service = service;
    }

    @GetMapping
    public ApiPageResponse<Publication> list(
            @RequestParam(required = false) String eventId,
            @RequestParam(required = false) String session,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String room,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = pageable(page, size, sort);
        boolean hasEventId = eventId != null && !eventId.isBlank();
        boolean hasSession = session != null && !session.isBlank();
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasRoom = room != null && !room.isBlank();

        if (!hasEventId && !hasSession && !hasCategory && !hasRoom) {
            return ApiPageResponse.from(service.list(pageable));
        }
        // Simple event-only filter uses the JPA derived query (no FULLTEXT needed)
        if (hasEventId && !hasSession && !hasCategory && !hasRoom) {
            return ApiPageResponse.from(service.listByEventId(eventId, pageable));
        }
        return ApiPageResponse.from(service.search(null, eventId, session, category, room, pageable));
    }

    @GetMapping("/{id}")
    public Publication getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/search")
    public ApiPageResponse<Publication> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String eventId,
            @RequestParam(required = false) String session,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String room,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = pageable(page, size, sort);
        return ApiPageResponse.from(service.search(q, eventId, session, category, room, pageable));
    }

    @PostMapping
    public Publication create(@Valid @RequestBody PublicationRequest request) {
        return service.create(request.toModel());
    }

    @PutMapping("/{id}")
    public Publication update(@PathVariable Long id, @Valid @RequestBody PublicationRequest request) {
        return service.update(id, request.toModel());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleBadRequest(IllegalArgumentException ex) {
        return ex.getMessage();
    }

    private Pageable pageable(int page, int size, String sortValue) {
        String[] parts = sortValue.split(",");
        Sort sort = Sort.by(parts[0]);
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
            sort = sort.descending();
        } else {
            sort = sort.ascending();
        }
        return PageRequest.of(page, size, sort);
    }

    public record PublicationRequest(
            String eventId,
            @NotBlank String title,
            String authors,
            String description,
            @NotBlank String status,
            String session,
            String category,
            String room,
            String posterUrl,
            Instant publishDate,
            List<Long> authorIds,
            List<Long> categoryIds
    ) {
        Publication toModel() {
            Publication model = new Publication();
            model.setEventId(eventId);
            model.setTitle(title);
            model.setAuthors(authors);
            model.setDescription(description);
            model.setStatus(status);
            model.setSession(session);
            model.setCategory(category);
            model.setRoom(room);
            model.setPosterUrl(posterUrl);
            model.setPublishDate(publishDate);
            model.setAuthorIds(authorIds);
            model.setCategoryIds(categoryIds);
            return model;
        }
    }
}
