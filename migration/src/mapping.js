export const legacy = {
  tables: {
    publications: "publicationspartone" // Use the actual table from devstter_congres_ampic.sql
  },

  // Map legacy publication row -> target publication row.
  mapPublication(row) {
    return {
      legacyId: String(row.id),
      title: clean(row.titre) || "(Sans titre)",
      authors: clean(row.createurs), // Commma-separated authors string
      description: clean(row.departement), // Legacy department as description / info
      status: "PUBLISHED", // Set as published so they are visible on the totem
      session: null,
      category: null,
      room: null,
      publishDate: new Date(),
      posterUrl: clean(row.img), // img column has the image url
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

export function clean(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
