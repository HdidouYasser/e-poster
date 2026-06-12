package com.eposter.backend.screen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

import java.util.List;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    private final ScreenService service;

    public ScreenController(ScreenService service) {
        this.service = service;
    }

    @GetMapping
    public List<Screen> list(@RequestParam(required = false) Long eventId) {
        return service.list(eventId);
    }

    @GetMapping("/{id}")
    public Screen getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Screen create(@Valid @RequestBody ScreenRequest request) {
        return service.create(request.toModel());
    }

    @PutMapping("/{id}")
    public Screen update(@PathVariable Long id, @Valid @RequestBody ScreenRequest request) {
        return service.update(id, request.toModel());
    }

    @GetMapping("/{id}/layout")
    public List<ScreenSection> getLayout(@PathVariable Long id) {
        return service.getLayout(id);
    }

    @PutMapping("/{id}/layout")
    public List<ScreenSection> replaceLayout(@PathVariable Long id, @Valid @RequestBody List<ScreenSectionRequest> sections) {
        return service.replaceLayout(id, sections.stream().map(ScreenSectionRequest::toModel).toList());
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

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleAllExceptions(Exception ex) {
        java.io.StringWriter sw = new java.io.StringWriter();
        ex.printStackTrace(new java.io.PrintWriter(sw));
        return sw.toString();
    }

    public record ScreenRequest(
            @NotBlank String name,
            String location,
            @NotBlank String mode,
            String resolution,
            Boolean isActive,
            @NotNull Long eventId,
            List<ScreenSectionRequest> sections
    ) {
        Screen toModel() {
            Screen s = new Screen();
            s.setName(name);
            s.setLocation(location);
            s.setMode(mode);
            s.setResolution(resolution);
            s.setIsActive(isActive != null ? isActive : true);
            com.eposter.backend.event.Event event = new com.eposter.backend.event.Event();
            event.setId(eventId);
            s.setEvent(event);
            if (sections != null) {
                s.setSections(sections.stream().map(ScreenSectionRequest::toModel).toList());
            }
            return s;
        }
    }

    public record ScreenSectionRequest(
            String title,
            Integer position,
            Long publicationId
    ) {
        ScreenSection toModel() {
            ScreenSection section = new ScreenSection();
            section.setTitle(title);
            section.setPosition(position);
            if (publicationId != null) {
                com.eposter.backend.publication.Publication publication = new com.eposter.backend.publication.Publication();
                publication.setId(publicationId);
                section.setPublication(publication);
            }
            return section;
        }
    }
}

