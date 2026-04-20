package com.eposter.backend.platform;

import com.eposter.backend.common.ApiPageResponse;
import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PlatformFacade {
    private final PublicationService publicationService;

    public PlatformFacade(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    public ApiPageResponse<Publication> getPublications(int page, int size, String sort) {
        String[] parts = sort.split(",");
        Sort s = Sort.by(parts[0]);
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
            s = s.descending();
        }
        Pageable pageable = PageRequest.of(page, size, s);
        return ApiPageResponse.from(publicationService.list(pageable));
    }

    public Publication getPublicationDetail(Long id) {
        return publicationService.getById(id);
    }
}

