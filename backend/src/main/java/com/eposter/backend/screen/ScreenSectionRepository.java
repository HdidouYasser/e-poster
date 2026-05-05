package com.eposter.backend.screen;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreenSectionRepository extends JpaRepository<ScreenSection, Long> {
    List<ScreenSection> findByScreenIdOrderByPositionAsc(Long screenId);
}

