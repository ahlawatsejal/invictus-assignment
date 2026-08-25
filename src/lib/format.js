function parseDate(date) {
  if (!date) return null;
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const monthIndex = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, monthIndex, day);
    }
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof date === "number") {
    return new Date(date);
  }
  return null;
}

export function formatDate(date) {
  const d = parseDate(date);
  if (!d) return typeof date === "string" ? date : "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateValue(date) {
  const d = parseDate(date);
  return d ? d.getTime() : 0;
}

