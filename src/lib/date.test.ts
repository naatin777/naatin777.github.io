import { describe, expect, it } from "vitest";
import { formatDate, parseDate } from "./date";

describe("parseDate", () => {
  it("treats bare YYYY-MM-DD as JST", () => {
    expect(parseDate("2026-01-01")).toBe(Date.parse("2026-01-01T00:00:00+09:00"));
  });

  it("parses timestamps with an explicit offset", () => {
    expect(Number.isNaN(parseDate("2026-01-01T10:00:00+09:00"))).toBe(false);
    expect(Number.isNaN(parseDate("2026-01-01T10:00:00Z"))).toBe(false);
    expect(parseDate("2026-01-01T10:00:00Z")).toBe(parseDate("2026-01-01T19:00:00+09:00"));
  });

  it("rejects timestamps without an offset", () => {
    expect(parseDate("2026-01-01 10:00")).toBeNaN();
    expect(parseDate("2026-01-01T10:00:00")).toBeNaN();
  });
});

describe("formatDate", () => {
  it("throws on an unparseable date", () => {
    expect(() => formatDate("nope")).toThrow('invalid date "nope"');
  });
});
