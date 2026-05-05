package com.eposter.backend.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationCategoryRepository extends JpaRepository<PublicationCategory, Long> {
    List<PublicationCategory> findByPublicationId(Long publicationId);
    List<PublicationCategory> findByCategoryId(Long categoryId);
    void deleteByPublicationId(Long publicationId);
}
