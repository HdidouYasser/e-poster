package com.eposter.backend.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findByDeletedAtIsNull(Pageable pageable);

    Optional<Event> findByIdAndDeletedAtIsNull(Long id);

    @Query(
            value = """
                    SELECT * FROM events e
                    WHERE e.deleted_at IS NULL
                      AND MATCH(e.title, e.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                    """,
            countQuery = """
                    SELECT COUNT(*) FROM events e
                    WHERE e.deleted_at IS NULL
                      AND MATCH(e.title, e.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                    """,
            nativeQuery = true
    )
    Page<Event> searchFullText(@Param("q") String q, Pageable pageable);

    Optional<Event> findFirstByStatusIgnoreCaseAndDeletedAtIsNullOrderByUpdatedAtDesc(String status);
}
