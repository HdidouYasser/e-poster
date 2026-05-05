/**
 * Adapt these to your legacy schema.
 * Provide:
 * - table names
 * - how to map legacy rows to target MySQL rows
 */

export const legacy = {
  tables: {
    events: "events",
    publications: "publications"
  },

  // Map legacy event row -> target event row
  mapEvent(row) {
    return {
      legacyId: String(row.id),
      title: clean(row.title),
      description: clean(row.description),
      status: clean(row.status) || "DRAFT",
      startDate: toInstant(row.start_date),
      endDate: toInstant(row.end_date),
      createdAt: toInstant(row.created_at) ?? new Date(),
      updatedAt: toInstant(row.updated_at) ?? new Date()
    };
  },

  // Map legacy publication row -> target publication row.
  // `eventId` is resolved later from legacy event id -> inserted event id.
  mapPublication(row) {
    return {
      legacyId: String(row.id),
      legacyEventId: row.event_id != null ? String(row.event_id) : null,
      eventId: null,
      title: clean(row.title),
      authors: clean(row.authors),
      description: clean(row.description),
      status: clean(row.status) || "DRAFT",
      session: clean(row.session),
      category: clean(row.category),
      room: clean(row.room),
      publishDate: toInstant(row.publish_date),
      posterUrl: clean(row.poster_url) || clean(row.file_path),
      createdAt: toInstant(row.created_at) ?? new Date(),
      updatedAt: toInstant(row.updated_at) ?? new Date()
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

