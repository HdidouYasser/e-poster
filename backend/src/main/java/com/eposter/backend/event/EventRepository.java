package com.eposter.backend.event;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Event e SET e.status = 'ARCHIVED', e.updatedAt = :now WHERE e.endDate < :now AND e.status = 'ACTIVE' AND e.deletedAt IS NULL")
    int archiveExpiredEvents(@Param("now") java.time.Instant now);

    Page<Event> findByDeletedAtIsNull(Pageable pageable);

    Page<Event> findByManagerEmailAndDeletedAtIsNull(String email, Pageable pageable);

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

    @Query(
            value = """
                    SELECT * FROM events e
                    INNER JOIN users u ON e.manager_id = u.id
                    WHERE e.deleted_at IS NULL
                      AND u.email = :email
                      AND MATCH(e.title, e.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                    """,
            countQuery = """
                    SELECT COUNT(*) FROM events e
                    INNER JOIN users u ON e.manager_id = u.id
                    WHERE e.deleted_at IS NULL
                      AND u.email = :email
                      AND MATCH(e.title, e.description) AGAINST (:q IN NATURAL LANGUAGE MODE)
                    """,
            nativeQuery = true
    )
    Page<Event> searchFullTextByManager(@Param("q") String q, @Param("email") String email, Pageable pageable);

    Optional<Event> findFirstByStatusIgnoreCaseAndDeletedAtIsNullOrderByUpdatedAtDesc(String status);

    // Dashboard methods
    long countByEndDateAfter(java.time.Instant date);
    
    java.util.List<Event> findByStartDateGreaterThanEqualOrderByStartDateAsc(java.time.Instant date);

    long countByManagerEmailAndDeletedAtIsNull(String email);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.manager.email = :email AND e.endDate > :date AND e.deletedAt IS NULL")
    long countByManagerEmailAndEndDateAfterAndDeletedAtIsNull(@Param("email") String email, @Param("date") java.time.Instant date);

    @Query("SELECT e FROM Event e WHERE e.manager.email = :email AND e.startDate >= :date AND e.deletedAt IS NULL ORDER BY e.startDate ASC")
    java.util.List<Event> findByManagerEmailAndStartDateGreaterThanEqualAndDeletedAtIsNullOrderByStartDateAsc(@Param("email") String email, @Param("date") java.time.Instant date);
}
