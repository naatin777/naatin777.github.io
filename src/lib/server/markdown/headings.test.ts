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

  it("caps permalink anchors and toc at h4", async () => {
    const { html, toc } = await renderMarkdown("#### Four\n\n##### Five\n\n###### Six\n");
    expect(html).toContain('href="#four"');
    expect(html).not.toContain('href="#five"');
    expect(html).not.toContain('href="#six"');
    // h5/h6 still get ids — only anchors and toc entries are withheld
    expect(html).toContain('<h5 id="five">');
    expect(toc.map((t) => t.depth)).toEqual([4]);
  });

  it("keeps explicit code anchors and moves colliding headings without stealing another slug", async () => {
    const { html, toc } = await renderMarkdown(
      "## output\n\n## output-1\n\n```text#output\nhello\n```\n\n[Line](#output-L1)",
    );
    expect(toc.map((heading) => heading.id)).toEqual(["output-2", "output-1"]);
    expect(html).toContain('<div class="code-block" id="output">');
    expect(html).toContain('id="output-L1"');
    expect(html).toContain('href="#output-L1"');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserves footnote destinations when a heading has the same slug", async () => {
    const { html, toc } = await renderMarkdown("## user-content-fn-1\n\ntext[^1]\n\n[^1]: note");
    expect(toc[0]?.id).toBe("user-content-fn-1-1");
    expect(html).toContain('<li id="user-content-fn-1">');
    expect(html).toContain('href="#user-content-fn-1"');
  });
});
