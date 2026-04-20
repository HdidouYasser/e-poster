package com.eposter.backend.common;

import org.springframework.data.domain.Page;

import java.util.List;

public record ApiPageResponse<T>(List<T> items, int page, int size, long totalItems, int totalPages) {

    public static <T> ApiPageResponse<T> from(Page<T> page) {
        return new ApiPageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
