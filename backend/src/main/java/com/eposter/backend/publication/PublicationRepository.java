package com.eposter.backend.publication;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
    Page<Publication> findByDeletedAtIsNull(Pageable pageable);

    Page<Publication> findByEvent_IdAndDeletedAtIsNull(Long eventId, Pageable pageable);

    Optional<Publication> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
            SELECT DISTINCT p FROM Publication p
            LEFT JOIN p.publicationCategories pc
            LEFT JOIN pc.category c
            WHERE p.deletedAt IS NULL
              AND (:q IS NULL OR :q = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.authors) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:eventId IS NULL OR p.event.id = :eventId)
              AND (:session IS NULL OR :session = '' OR p.session = :session)
              AND (:room IS NULL OR :room = '' OR p.room = :room)
              AND (:category IS NULL OR :category = '' OR p.category LIKE CONCAT('%', :category, '%') OR c.name = :category)
            """)
    Page<Publication> searchFullText(
            @Param("q") String q,
            @Param("eventId") Long eventId,
            @Param("session") String session,
            @Param("room") String room,
            @Param("category") String category,
            Pageable pageable
    );
}
