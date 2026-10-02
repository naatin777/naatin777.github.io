// The site is ja-first, so formatting is pinned to JST, keeping CI (UTC)
// and local builds identical.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

// Dates must carry an explicit offset (e.g. 2026-09-23T10:00:00+09:00), like Qiita/Zenn timestamps.
export const parseDate = (value: string): number => (/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN);

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  if (Number.isNaN(timestamp)) throw new Error(`invalid date "${String(date)}"`);
  return formatter.format(timestamp);
};
