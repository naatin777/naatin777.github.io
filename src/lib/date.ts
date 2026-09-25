// Bare dates like "YYYY-MM-DD" or "YYYY-MM-DD hh:mm[:ss]" (used in
// frontmatter and hardcoded data) lack an offset — without pinning,
// parsing is machine-TZ dependent. Treat them as JST.
const JST_DATE = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/;

// The site is ja-first — pin formatting to JST so CI (UTC) and local
// (JST) builds produce identical output for the same input.
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

// Date.parse resolves offsetless non-bare forms (fractional seconds,
// unpadded, non-ISO) in the machine's timezone — reject them so output
// stays identical on CI (UTC) and local (JST) builds.
const EXPLICIT_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/;

export const parseDate = (value: string): number => {
  const bare = JST_DATE.exec(value);
  if (bare) {
    const time = bare[2] ?? "00:00:00";
    return Date.parse(`${bare[1]}T${time.length === 5 ? `${time}:00` : time}+09:00`);
  }
  if (!EXPLICIT_OFFSET.test(value)) return NaN;
  return Date.parse(value);
};

export const formatDate = (date: Date | string): string => {
  const timestamp = typeof date === "string" ? parseDate(date) : date.getTime();
  return Number.isNaN(timestamp) ? "" : formatter.format(timestamp);
};
