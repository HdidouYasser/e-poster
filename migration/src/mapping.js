/**
 * Adapt these to your legacy schema.
 * Provide:
 * - table names
 * - how to map rows to Mongo docs
 * - how to locate legacy files for a publication row
 */

export const legacy = {
  tables: {
    events: "events",
    publications: "publications"
  },

  /**
   * Map MySQL event row -> Mongo event document
   */
  mapEvent(row) {
    return {
      legacyId: String(row.id),
      title: clean(row.title),
      description: clean(row.description),
      startDate: toInstant(row.start_date),
      endDate: toInstant(row.end_date),
      createdAt: toInstant(row.created_at) ?? new Date(),
      updatedAt: toInstant(row.updated_at) ?? new Date()
    };
  },

  /**
   * Map MySQL publication row -> Mongo publication document.
   * `eventId` will be resolved later from legacyId -> new _id.
   */
  mapPublication(row) {
    return {
      legacyId: String(row.id),
      legacyEventId: row.event_id != null ? String(row.event_id) : null,
      title: clean(row.title),
      description: clean(row.description),
      status: clean(row.status) || "DRAFT",
      session: clean(row.session),
      category: clean(row.category),
      room: clean(row.room),
      publishDate: toInstant(row.publish_date),
      // posterUrl will be filled after uploading to GridFS
      posterUrl: null,
      createdAt: toInstant(row.created_at) ?? new Date(),
      updatedAt: toInstant(row.updated_at) ?? new Date(),
      // legacy file info (adapt)
      legacyFilePath: clean(row.file_path) // ex: "posters/abc.pdf"
    };
  }
};

export function clean(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export function toInstant(v) {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

