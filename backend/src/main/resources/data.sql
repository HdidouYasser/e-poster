ALTER TABLE publications DROP INDEX idx_publications_fulltext;
ALTER TABLE publications ADD FULLTEXT INDEX idx_publications_fulltext (title, description, abstract_text, authors_str);
ALTER TABLE events DROP INDEX idx_events_fulltext;
ALTER TABLE events ADD FULLTEXT INDEX idx_events_fulltext (title, description);
