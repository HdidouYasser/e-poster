package com.eposter.backend.screen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<Screen> list() {
        return service.list();
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

    public record ScreenRequest(
            @NotBlank String name,
            String location,
            @NotBlank String mode
    ) {
        Screen toModel() {
            Screen s = new Screen();
            s.setName(name);
            s.setLocation(location);
            s.setMode(mode);
            return s;
        }
    }
}

