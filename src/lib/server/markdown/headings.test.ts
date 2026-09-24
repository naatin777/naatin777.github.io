import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("headings", () => {
  it("assigns heading ids and returns them as toc entries", async () => {
    const { html, toc } = await renderMarkdown("# Title\n\n## Section One\n\nText\n\n### Sub\n");
    expect(html).toContain('<h1 id="title">');
    expect(html).toContain('<h2 id="section-one">');
    expect(toc).toEqual([
      { id: "title", text: "Title", depth: 1 },
      { id: "section-one", text: "Section One", depth: 2 },
      { id: "sub", text: "Sub", depth: 3 },
    ]);
  });

  it("escapes quotes inside heading permalink aria-labels", async () => {
    const { html } = await renderMarkdown('## He said "hi"');
    expect(html).not.toContain('aria-label="He said "hi""');
    expect(html).toMatch(/aria-label="He said (&#x22;|&quot;)hi\1 へのリンク"/);
  });

  it("deduplicates ids when headings repeat", async () => {
    const { html, toc } = await renderMarkdown("## Dup\n\n## Dup");
    expect(html).toContain('id="dup"');
    expect(html).toContain('id="dup-1"');
    expect(toc.map((t) => t.id)).toEqual(["dup", "dup-1"]);
  });

  it("renames heading ids that collide with page chrome", async () => {
    const { html, toc } = await renderMarkdown("## main");
    expect(html).toContain('<h2 id="main-1">');
    expect(html).toContain('href="#main-1"');
    expect(toc).toEqual([{ id: "main-1", text: "main", depth: 2 }]);
  });
});
