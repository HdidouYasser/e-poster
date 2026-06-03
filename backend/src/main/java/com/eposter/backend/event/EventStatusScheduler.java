package com.eposter.backend.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Scheduled task that automatically archives events whose end date has passed.
 * Runs every hour. Admins can still manually archive an event at any time.
 */
@Component
public class EventStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(EventStatusScheduler.class);

    private final EventRepository eventRepository;

    public EventStatusScheduler(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    /**
     * Archive all ACTIVE events whose endDate is in the past.
     * Runs every hour at minute 0 (e.g. 01:00, 02:00, ...).
     * Also runs once at startup (initialDelay = 0).
     */
    @Scheduled(cron = "0 0 * * * *")
    public void archiveExpiredEvents() {
        Instant now = Instant.now();
        int count = eventRepository.archiveExpiredEvents(now);
        if (count > 0) {
            log.info("Auto-archived {} expired event(s) at {}", count, now);
        }
    }
}
