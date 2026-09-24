import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultLang, langs } from "$lib/config/i18n";
import { themeColors } from "$lib/config/theme";

// The pre-paint init script in app.html duplicates these constants by
// hand — this test fails loudly when the two sides drift apart.
const html = readFileSync(new URL("./app.html", import.meta.url), "utf8");

describe("app.html init script", () => {
  it("embeds the shared theme colors", () => {
    expect(html).toContain(`content="${themeColors.light}"`);
    expect(html).toContain(`"${themeColors.light}"`);
    expect(html).toContain(`"${themeColors.dark}"`);
  });

  it("embeds the shared languages and default", () => {
    // whitespace-insensitive: the literal may be written ["ja", "en"]
    expect(html.replace(/\s/g, "")).toContain(JSON.stringify(langs));
    expect(html).toContain(`<html lang="${defaultLang}">`);
    expect(html).toContain(`"${defaultLang}"`);
  });
});
