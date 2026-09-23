// Zenn frontmatter uses "YYYY-MM-DD" or "YYYY-MM-DD hh:mm" (JST), both of
// which lack an offset — without pinning, parsing is machine-TZ dependent.
const JST_DATE = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?$/;

// The site is ja-first — pin formatting to JST so CI (UTC) and local
// (JST) builds produce identical output for the same input.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

const toJstAware = (value: string): string => {
  const bare = JST_DATE.exec(value);
  return bare ? `${bare[1]}T${bare[2] ?? "00:00"}:00+09:00` : value;
};

export const parseDate = (value: string): number => Date.parse(toJstAware(value));

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  return Number.isNaN(timestamp) ? "" : formatter.format(timestamp);
};
