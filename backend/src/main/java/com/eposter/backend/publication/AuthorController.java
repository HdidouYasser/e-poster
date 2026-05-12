package com.eposter.backend.publication;

import com.eposter.backend.common.ApiPageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService service;

    public AuthorController(AuthorService service) {
        this.service = service;
    }

    @GetMapping
    public ApiPageResponse<Author> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] parts = sort.split(",");
        Sort sortObj = Sort.by(parts[0]);
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
            sortObj = sortObj.descending();
        } else {
            sortObj = sortObj.ascending();
        }
        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ApiPageResponse.from(service.list(pageable));
    }

    @GetMapping("/{id}")
    public Author getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Author create(@Valid @RequestBody AuthorRequest request) {
        return service.create(request.toModel());
    }

    @PutMapping("/{id}")
    public Author update(@PathVariable Long id, @Valid @RequestBody AuthorRequest request) {
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

    public record AuthorRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            String email,
            String affiliation,
            Boolean isCorresponding
    ) {
        Author toModel() {
            Author model = new Author();
            model.setFirstName(firstName);
            model.setLastName(lastName);
            model.setEmail(email);
            model.setAffiliation(affiliation);
            model.setIsCorresponding(isCorresponding != null ? isCorresponding : false);
            return model;
        }
    }
}
