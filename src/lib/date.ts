// Bare "YYYY-MM-DD" dates (frontmatter, hardcoded data) carry no offset —
// treat them as JST. The site is ja-first, so formatting is pinned to JST
// too, keeping CI (UTC) and local builds identical.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

export const parseDate = (value: string): number => Date.parse(value.length === 10 ? `${value}T00:00:00+09:00` : value);

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  return Number.isNaN(timestamp) ? "" : formatter.format(timestamp);
};
