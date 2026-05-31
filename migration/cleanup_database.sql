-- Script de nettoyage de la base de données e-poster
-- Suppression des doublons tout en préservant une seule instance de chaque ressource

-- 1. Nettoyer les doublons de screens (garder l'ID le plus bas)
DELETE FROM screens 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM (
    SELECT MIN(id) as id 
    FROM screens 
    GROUP BY name, location, screen_type
  ) as subquery
);

-- 2. Nettoyer les doublons de categories (garder l'ID le plus bas)
DELETE FROM categories 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM (
    SELECT MIN(id) as id 
    FROM categories 
    GROUP BY name
  ) as subquery
);

-- 3. Nettoyer les doublons d'auteurs (garder l'ID le plus bas)
DELETE FROM authors 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM (
    SELECT MIN(id) as id 
    FROM authors 
    GROUP BY first_name, last_name, email
  ) as subquery
);

-- 4. Nettoyer les doublons d'événements (garder l'ID le plus bas)
DELETE FROM events 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM (
    SELECT MIN(id) as id 
    FROM events 
    GROUP BY title, start_date, end_date
  ) as subquery
);

-- 5. Nettoyer les orphelins de publication_authors (publications n'existant plus)
DELETE FROM publication_authors 
WHERE publication_id NOT IN (
  SELECT id FROM publications
);

-- 6. Nettoyer les orphelins de publication_authors (auteurs n'existant plus)
DELETE FROM publication_authors 
WHERE author_id NOT IN (
  SELECT id FROM authors
);

-- 7. Vérifier l'intégrité des données
SELECT 
  (SELECT COUNT(*) FROM publications) as total_publications,
  (SELECT COUNT(*) FROM screens) as total_screens,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM authors) as total_authors,
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(*) FROM publication_authors) as total_associations;
