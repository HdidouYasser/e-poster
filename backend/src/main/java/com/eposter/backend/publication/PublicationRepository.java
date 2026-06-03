package com.eposter.backend.publication;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
    Page<Publication> findByDeletedAtIsNull(Pageable pageable);

    Page<Publication> findByEvent_IdAndDeletedAtIsNull(Long eventId, Pageable pageable);

    Page<Publication> findByEvent_Manager_EmailAndDeletedAtIsNull(String email, Pageable pageable);

    Page<Publication> findByEvent_Manager_EmailAndEvent_IdAndDeletedAtIsNull(String email, Long eventId, Pageable pageable);

    Optional<Publication> findByIdAndDeletedAtIsNull(Long id);

    @Query(value = """
            SELECT DISTINCT p.* FROM publications p
            LEFT JOIN publication_categories pc ON p.id = pc.publication_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.deleted_at IS NULL
              AND (:q IS NULL OR :q = '' 
                   OR MATCH(p.title, p.description, p.abstract_text, p.authors_str) AGAINST(:q IN BOOLEAN MODE)
                   OR p.title LIKE CONCAT('%', :rawQ, '%')
                   OR p.authors_str LIKE CONCAT('%', :rawQ, '%'))
              AND (:eventId IS NULL OR p.event_ref_id = :eventId)
              AND (:session IS NULL OR :session = '' OR p.session = :session)
              AND (:room IS NULL OR :room = '' OR p.room = :room)
              AND (:category IS NULL OR :category = '' OR p.category_str LIKE CONCAT('%', :category, '%') OR c.name = :category)
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM publications p
            LEFT JOIN publication_categories pc ON p.id = pc.publication_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.deleted_at IS NULL
              AND (:q IS NULL OR :q = '' 
                   OR MATCH(p.title, p.description, p.abstract_text, p.authors_str) AGAINST(:q IN BOOLEAN MODE)
                   OR p.title LIKE CONCAT('%', :rawQ, '%')
                   OR p.authors_str LIKE CONCAT('%', :rawQ, '%'))
              AND (:eventId IS NULL OR p.event_ref_id = :eventId)
              AND (:session IS NULL OR :session = '' OR p.session = :session)
              AND (:room IS NULL OR :room = '' OR p.room = :room)
              AND (:category IS NULL OR :category = '' OR p.category_str LIKE CONCAT('%', :category, '%') OR c.name = :category)
            """,
            nativeQuery = true)
    Page<Publication> searchFullText(
            @Param("q") String q,
            @Param("rawQ") String rawQ,
            @Param("eventId") Long eventId,
            @Param("session") String session,
            @Param("room") String room,
            @Param("category") String category,
            Pageable pageable
    );

    @Query(value = """
            SELECT DISTINCT p.* FROM publications p
            LEFT JOIN publication_categories pc ON p.id = pc.publication_id
            LEFT JOIN categories c ON pc.category_id = c.id
            INNER JOIN events e ON p.event_ref_id = e.id
            INNER JOIN users u ON e.manager_id = u.id
            WHERE p.deleted_at IS NULL
              AND u.email = :managerEmail
              AND (:q IS NULL OR :q = '' 
                   OR MATCH(p.title, p.description, p.abstract_text, p.authors_str) AGAINST(:q IN BOOLEAN MODE)
                   OR p.title LIKE CONCAT('%', :rawQ, '%')
                   OR p.authors_str LIKE CONCAT('%', :rawQ, '%'))
              AND (:eventId IS NULL OR p.event_ref_id = :eventId)
              AND (:session IS NULL OR :session = '' OR p.session = :session)
              AND (:room IS NULL OR :room = '' OR p.room = :room)
              AND (:category IS NULL OR :category = '' OR p.category_str LIKE CONCAT('%', :category, '%') OR c.name = :category)
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM publications p
            LEFT JOIN publication_categories pc ON p.id = pc.publication_id
            LEFT JOIN categories c ON pc.category_id = c.id
            INNER JOIN events e ON p.event_ref_id = e.id
            INNER JOIN users u ON e.manager_id = u.id
            WHERE p.deleted_at IS NULL
              AND u.email = :managerEmail
              AND (:q IS NULL OR :q = '' 
                   OR MATCH(p.title, p.description, p.abstract_text, p.authors_str) AGAINST(:q IN BOOLEAN MODE)
                   OR p.title LIKE CONCAT('%', :rawQ, '%')
                   OR p.authors_str LIKE CONCAT('%', :rawQ, '%'))
              AND (:eventId IS NULL OR p.event_ref_id = :eventId)
              AND (:session IS NULL OR :session = '' OR p.session = :session)
              AND (:room IS NULL OR :room = '' OR p.room = :room)
              AND (:category IS NULL OR :category = '' OR p.category_str LIKE CONCAT('%', :category, '%') OR c.name = :category)
            """,
            nativeQuery = true)
    Page<Publication> searchFullTextByManager(
            @Param("q") String q,
            @Param("rawQ") String rawQ,
            @Param("eventId") Long eventId,
            @Param("session") String session,
            @Param("room") String room,
            @Param("category") String category,
            @Param("managerEmail") String managerEmail,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.viewCount), 0) FROM Publication p WHERE p.deletedAt IS NULL")
    long sumViewCount();

    java.util.List<Publication> findTop5ByDeletedAtIsNullOrderByViewCountDesc();

    // Dashboard methods
    java.util.List<Publication> findTop5ByOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(p) FROM Publication p WHERE p.event.id = :eventId AND p.deletedAt IS NULL")
    long countPublicationsByEvent(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(p) FROM Publication p WHERE p.event.manager.email = :email AND p.deletedAt IS NULL")
    long countByEventManagerEmail(@Param("email") String email);

    @Query("SELECT COALESCE(SUM(p.viewCount), 0) FROM Publication p WHERE p.event.manager.email = :email AND p.deletedAt IS NULL")
    long sumViewCountByEventManagerEmail(@Param("email") String email);

    @Query("SELECT p FROM Publication p WHERE p.event.manager.email = :email AND p.deletedAt IS NULL ORDER BY p.viewCount DESC")
    java.util.List<Publication> findTop5ByEventManagerEmailOrderByViewCountDesc(@Param("email") String email, org.springframework.data.domain.Pageable pageable);
}
