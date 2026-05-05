ALTER TABLE publications ADD FULLTEXT INDEX idx_publications_fulltext (title, description);
ALTER TABLE events ADD FULLTEXT INDEX idx_events_fulltext (title, description);
