package com.eposter.backend.screen;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findByEvent_IdAndDeletedAtIsNull(Long eventId);
    List<Screen> findByEvent_IdAndIsActiveTrueAndDeletedAtIsNull(Long eventId);

    List<Screen> findByDeletedAtIsNull();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(s) FROM Screen s WHERE s.event.manager.email = :email AND s.deletedAt IS NULL")
    long countByEventManagerEmail(@org.springframework.data.repository.query.Param("email") String email);

    Optional<Screen> findByIdAndDeletedAtIsNull(Long id);
}

