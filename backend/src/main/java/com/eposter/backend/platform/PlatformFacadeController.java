package com.eposter.backend.platform;

import com.eposter.backend.common.ApiPageResponse;
import com.eposter.backend.publication.Publication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform")
public class PlatformFacadeController {
    private final PlatformFacade facade;

    public PlatformFacadeController(PlatformFacade facade) {
        this.facade = facade;
    }

    @GetMapping("/publications")
    public ApiPageResponse<Publication> getPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        return facade.getPublications(page, size, sort);
    }

    @GetMapping("/publications/{id}")
    public Publication getPublicationDetail(@PathVariable Long id) {
        return facade.getPublicationDetail(id);
    }
}

