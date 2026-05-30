import "dotenv/config";
import mysql from "mysql2/promise";
import { legacy } from "./mapping.js";

async function main() {
  const source = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'congres_ampic'
  });

  const target = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'eposter'
  });

  try {
    console.log("Connected to both legacy and target databases!");

    // 0. Clean target tables first (safely with foreign key checks disabled)
    console.log("Cleaning target tables in eposter database...");
    await target.execute("SET FOREIGN_KEY_CHECKS = 0");
    await target.execute("ALTER TABLE publications MODIFY COLUMN authors_str TEXT");
    await target.execute("ALTER TABLE publications MODIFY COLUMN poster_url TEXT");
    await target.execute("TRUNCATE TABLE publication_authors");
    await target.execute("TRUNCATE TABLE publication_categories");
    await target.execute("TRUNCATE TABLE publications");
    await target.execute("TRUNCATE TABLE authors");
    await target.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Target tables cleaned and columns adjusted.");

    // Create FULLTEXT index
    try {
      console.log("Creating FULLTEXT index on publications...");
      await target.execute("ALTER TABLE publications ADD FULLTEXT INDEX idx_pub_fulltext (title, description, abstract_text, authors_str)");
      console.log("FULLTEXT index created successfully.");
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log("FULLTEXT index already exists.");
      } else {
        console.warn("Could not create FULLTEXT index:", err.message);
      }
    }

    // 1. Create or fetch a default event
    const eventTitle = "18ème Congrès National AMPIIC";
    console.log(`Checking if default event "${eventTitle}" exists in eposter...`);
    
    const [existingEvents] = await target.execute(
      "SELECT id FROM events WHERE title = ? AND deleted_at IS NULL",
      [eventTitle]
    );

    let eventId;
    if (existingEvents.length > 0) {
      eventId = existingEvents[0].id;
      console.log(`Event already exists with ID: ${eventId}`);
    } else {
      console.log("Creating default event with AMPIIC branding...");
      const [result] = await target.execute(
        `INSERT INTO events (title, description, status, color_primary, color_secondary, start_date, end_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventTitle,
          "L'Association Marocaine de Pathologie Infectieuse et d’Immunologie Clinique",
          "ACTIVE",
          "#4298a5", // Primary Teal color from legacy site
          "#f1785b", // Secondary Orange/Coral color from legacy site
          new Date(),
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days event
          new Date(),
          new Date()
        ]
      );
      eventId = result.insertId;
      console.log(`Created default event with ID: ${eventId}`);
    }

    // 2. Read publications from legacy publicationspartone table
    console.log(`Reading publications from legacy table: ${legacy.tables.publications}...`);
    const [pubRows] = await source.execute(`SELECT * FROM \`${legacy.tables.publications}\` ORDER BY id ASC LIMIT 4`);
    console.log(`Found ${pubRows.length} publications in legacy table.`);

    let migratedCount = 0;

    for (const row of pubRows) {
      const pub = legacy.mapPublication(row);
      pub.eventId = eventId;

      // 3. Insert publication
      const [pubResult] = await target.execute(
        `INSERT INTO publications 
           (event_ref_id, title, authors_str, description, status, session, room, poster_url, publish_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pub.eventId,
          pub.title,
          pub.authors,
          pub.description,
          pub.status,
          pub.session,
          pub.room,
          pub.posterUrl,
          pub.publishDate,
          pub.createdAt,
          pub.updatedAt
        ]
      );
      
      const newPubId = pubResult.insertId;

      // 4. Parse authors and insert them normalized
      if (pub.authors) {
        // Authors are like "M. Ameur, L. Barakat, K. Echchilali"
        const authorNames = pub.authors.split(',').map(name => name.trim()).filter(Boolean);
        
        let order = 0;
        const seenAuthorsInPub = new Set();
        for (const fullName of authorNames) {
          // Parse first name and last name
          const parts = fullName.split(' ').filter(Boolean);
          let firstName = "";
          let lastName = "";
          
          if (parts.length > 1) {
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          } else if (parts.length === 1) {
            lastName = parts[0];
          } else {
            continue;
          }

          // Check if author exists in authors table
          const [existingAuthors] = await target.execute(
            "SELECT id FROM authors WHERE first_name = ? AND last_name = ?",
            [firstName, lastName]
          );

          let authorId;
          if (existingAuthors.length > 0) {
            authorId = existingAuthors[0].id;
          } else {
            // Insert new author
            const [authorResult] = await target.execute(
              `INSERT INTO authors (first_name, last_name, is_corresponding, created_at)
               VALUES (?, ?, ?, ?)`,
              [firstName, lastName, false, new Date()]
            );
            authorId = authorResult.insertId;
          }

          // Avoid duplicate author insertion for the same publication
          if (seenAuthorsInPub.has(authorId)) {
            console.log(`Skipping duplicate author association for publication ID ${newPubId}: Author ID ${authorId} (${fullName})`);
            continue;
          }
          seenAuthorsInPub.add(authorId);

          // Insert into publication_authors junction table
          await target.execute(
            `INSERT INTO publication_authors (publication_id, author_id, author_order)
             VALUES (?, ?, ?)`,
            [newPubId, authorId, order++]
          );
        }
      }

      migratedCount++;
    }

    console.log(`Migration finished! Successfully migrated ${migratedCount} publications and populated normalized authors tables.`);
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
