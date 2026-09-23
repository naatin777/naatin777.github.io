const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The site is ja-first — pin formatting to JST so CI (UTC) and local
// (JST) builds produce identical output for the same input.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

// Bare "YYYY-MM-DD" is ambiguous (UTC vs local); pin it to JST midnight.
const toJstAware = (value: string): string => (BARE_DATE.test(value) ? `${value}T00:00:00+09:00` : value);

export const parseDate = (value: string): number => Date.parse(toJstAware(value));

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  return Number.isNaN(timestamp) ? "" : formatter.format(timestamp);
};
