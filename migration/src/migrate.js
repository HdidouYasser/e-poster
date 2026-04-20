import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { MongoClient, ObjectId, GridFSBucket } from "mongodb";
import mysql from "mysql2/promise";
import { legacy } from "./mapping.js";

const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: required("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT || 3306),
    user: required("MYSQL_USER"),
    password: process.env.MYSQL_PASSWORD || "",
    database: required("MYSQL_DATABASE")
  });

  const mongo = new MongoClient(required("MONGODB_URI"));
  await mongo.connect();
  const db = mongo.db(); // db name from URI
  const bucket = new GridFSBucket(db);
  const filesRoot = process.env.LEGACY_FILES_ROOT || "";

  try {
    console.log(`DRY_RUN=${DRY_RUN}`);
    console.log("Reading legacy events…");
    const [eventRows] = await mysqlConn.execute(`SELECT * FROM \`${legacy.tables.events}\``);
    console.log(`Events rows: ${eventRows.length}`);

    const eventsCol = db.collection("events");
    const pubsCol = db.collection("publications");

    const legacyEventIdToMongoId = new Map();

    for (const row of eventRows) {
      const doc = legacy.mapEvent(row);
      if (DRY_RUN) continue;
      const { insertedId } = await eventsCol.insertOne(doc);
      legacyEventIdToMongoId.set(doc.legacyId, insertedId);
    }

    console.log("Reading legacy publications…");
    const [pubRows] = await mysqlConn.execute(`SELECT * FROM \`${legacy.tables.publications}\``);
    console.log(`Publications rows: ${pubRows.length}`);

    let created = 0;
    let uploaded = 0;
    let skippedFiles = 0;

    for (const row of pubRows) {
      const doc = legacy.mapPublication(row);

      // resolve eventId
      if (doc.legacyEventId && legacyEventIdToMongoId.has(doc.legacyEventId)) {
        doc.eventId = String(legacyEventIdToMongoId.get(doc.legacyEventId));
      } else {
        doc.eventId = null;
      }
      delete doc.legacyEventId;

      // upload legacy file to GridFS if present
      if (doc.legacyFilePath && filesRoot) {
        const abs = path.resolve(filesRoot, doc.legacyFilePath);
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
          if (!DRY_RUN) {
            const fileId = await uploadToGridFs(bucket, abs, path.basename(abs));
            doc.posterUrl = `/api/files/${fileId}`;
            uploaded++;
          }
        } else {
          skippedFiles++;
        }
      }
      delete doc.legacyFilePath;

      if (!doc.title) doc.title = "(Sans titre)";

      if (!DRY_RUN) {
        await pubsCol.insertOne(doc);
      }
      created++;
    }

    console.log("Done.");
    console.log({ created, uploaded, skippedFiles });
  } finally {
    await mongo.close();
    await mysqlConn.end();
  }
}

function uploadToGridFs(bucket, absPath, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename);
    fs.createReadStream(absPath)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id.toString()));
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

