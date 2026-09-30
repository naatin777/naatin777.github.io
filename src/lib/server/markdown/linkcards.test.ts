import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

// The synced-URL cases read the committed content/generated/linkcards.json —
// https://naatin777.dev is a stable entry in it (the site's own card).
describe("link cards", () => {
  it("turns a bare-URL paragraph into a card when sync:linkcards has metadata", async () => {
    const { html } = await renderMarkdown("https://naatin777.dev");
    expect(html).toContain('class="linkcard');
    expect(html).toContain('href="https://naatin777.dev"');
    expect(html).toContain("Naatin");
  });

  it("accepts the [url](url) spelling too", async () => {
    const { html } = await renderMarkdown("[https://naatin777.dev](https://naatin777.dev)");
    expect(html).toContain('class="linkcard');
  });

  it("leaves unsynced bare URLs as plain links", async () => {
    const { html } = await renderMarkdown("https://example.com/");
    expect(html).not.toContain("linkcard");
    expect(html).toContain('<a href="https://example.com/"');
  });

  it("leaves a URL with surrounding text as a plain link", async () => {
    const { html } = await renderMarkdown("see https://naatin777.dev for details");
    expect(html).not.toContain("linkcard");
  });
});
