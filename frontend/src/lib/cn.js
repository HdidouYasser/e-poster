/**
 * Combine les classes CSS de manière sûre
 */
export function cn(...classes) {
  return classes
    .filter((c) => typeof c === "string")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formate une date en français
 */
export function formatDateFR(date, format = "full") {
  if (!date) return "";
  const d = new Date(date);
  
  const formats = {
    full: { day: "numeric", month: "long", year: "numeric" },
    short: { day: "numeric", month: "short", year: "numeric" },
    date: { day: "2-digit", month: "2-digit", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
  };
  
  return d.toLocaleDateString("fr-FR", formats[format] || formats.full);
}

/**
 * Génère un ID unique
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
