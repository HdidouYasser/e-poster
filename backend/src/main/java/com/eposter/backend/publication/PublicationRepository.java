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

    @Query(
            value = """
                    SELECT * FROM publications p
                    WHERE p.deleted_at IS NULL
                      AND MATCH(p.title, p.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                      AND (:eventId IS NULL OR :eventId = '' OR p.event_ref_id = :eventId)
                      AND (:session IS NULL OR :session = '' OR p.session = :session)
                      AND (:room IS NULL OR :room = '' OR p.room = :room)
                    """,
            countQuery = """
                    SELECT COUNT(*) FROM publications p
                    WHERE p.deleted_at IS NULL
                      AND MATCH(p.title, p.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                      AND (:eventId IS NULL OR :eventId = '' OR p.event_ref_id = :eventId)
                      AND (:session IS NULL OR :session = '' OR p.session = :session)
                      AND (:room IS NULL OR :room = '' OR p.room = :room)
                    """,
            nativeQuery = true
    )
    Page<Publication> searchFullText(
            @Param("q") String q,
            @Param("eventId") String eventId,
            @Param("session") String session,
            @Param("room") String room,
            Pageable pageable
    );
}
