import "dotenv/config";
import mysql from "mysql2/promise";
import { legacy } from "./mapping.js";

const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function main() {
  const source = await mysql.createConnection({
    host: required("LEGACY_MYSQL_HOST"),
    port: Number(process.env.LEGACY_MYSQL_PORT || 3306),
    user: required("LEGACY_MYSQL_USER"),
    password: process.env.LEGACY_MYSQL_PASSWORD || "",
    database: required("LEGACY_MYSQL_DATABASE")
  });

  const target = await mysql.createConnection({
    host: required("TARGET_MYSQL_HOST"),
    port: Number(process.env.TARGET_MYSQL_PORT || 3306),
    user: required("TARGET_MYSQL_USER"),
    password: process.env.TARGET_MYSQL_PASSWORD || "",
    database: required("TARGET_MYSQL_DATABASE")
  });

  try {
    console.log(`DRY_RUN=${DRY_RUN}`);
    console.log("Reading legacy events…");
    const [eventRows] = await source.execute(`SELECT * FROM \`${legacy.tables.events}\``);
    console.log(`Events rows: ${eventRows.length}`);

    const legacyEventIdToTargetId = new Map();

    for (const row of eventRows) {
      const event = legacy.mapEvent(row);
      if (DRY_RUN) continue;
      const [result] = await target.execute(
        `INSERT INTO events (title, description, status, start_date, end_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          event.title,
          event.description,
          event.status,
          event.startDate,
          event.endDate,
          event.createdAt,
          event.updatedAt
        ]
      );
      legacyEventIdToTargetId.set(event.legacyId, result.insertId);
    }

    console.log("Reading legacy publications…");
    const [pubRows] = await source.execute(`SELECT * FROM \`${legacy.tables.publications}\``);
    console.log(`Publications rows: ${pubRows.length}`);

    let created = 0;

    for (const row of pubRows) {
      const publication = legacy.mapPublication(row);

      if (publication.legacyEventId && legacyEventIdToTargetId.has(publication.legacyEventId)) {
        publication.eventId = String(legacyEventIdToTargetId.get(publication.legacyEventId));
      } else {
        publication.eventId = null;
      }
      if (!publication.title) publication.title = "(Sans titre)";

      if (!DRY_RUN) {
        await target.execute(
          `INSERT INTO publications
             (event_id, title, authors, description, status, session, category, room, poster_url, publish_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            publication.eventId,
            publication.title,
            publication.authors,
            publication.description,
            publication.status,
            publication.session,
            publication.category,
            publication.room,
            publication.posterUrl,
            publication.publishDate,
            publication.createdAt,
            publication.updatedAt
          ]
        );
      }
      created++;
    }

    console.log("Done.");
    console.log({ created });
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

