// Bare "YYYY-MM-DD" dates (frontmatter, hardcoded data) carry no offset —
// treat them as JST. The site is ja-first, so formatting is pinned to JST
// too, keeping CI (UTC) and local builds identical.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

// Bare "YYYY-MM-DD" is JST; anything else must carry an explicit offset.
export const parseDate = (value: string): number => {
  if (value.length === 10) return Date.parse(`${value}T00:00:00+09:00`);
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
};

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  if (Number.isNaN(timestamp)) throw new Error(`invalid date "${String(date)}"`);
  return formatter.format(timestamp);
};
