package com.eposter.backend.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByEvent_IdAndDeletedAtIsNull(Long eventId);

    List<Category> findByEvent_IdAndTypeIgnoreCaseAndDeletedAtIsNull(Long eventId, String type);

    List<Category> findByDeletedAtIsNull();

    Optional<Category> findByIdAndDeletedAtIsNull(Long id);

    Optional<Category> findByNameIgnoreCaseAndDeletedAtIsNull(String name);
}

