import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./posts";

describe("renderMarkdown", () => {
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

  it("adds target and rel to external links only", async () => {
    const { html } = await renderMarkdown("[ext](https://example.com) and [int](/about/)");
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">ext</a>');
    expect(html).toContain('<a href="/about/">int</a>');
  });

  it("escapes raw HTML written in markdown", async () => {
    const { html } = await renderMarkdown('<script>alert(1)</script>\n\n<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });

  it("drops links with unsafe URL schemes", async () => {
    const { html } = await renderMarkdown("[x](javascript:alert(1)) and [y](&#x6A;avascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a");
    expect(html).toContain("x");
    expect(html).toContain("y");
  });

  it("drops images with unsafe URL schemes", async () => {
    const { html } = await renderMarkdown("![x](javascript:alert(1)) and ![y](data:text/html;base64,PHN2Zz4=)");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:");
    expect(html).not.toContain("<img");
  });

  it("renders katex math", async () => {
    const { html } = await renderMarkdown("$x^2$");
    expect(html).toContain("katex");
  });

  it("renders code blocks with shiki", async () => {
    const { html } = await renderMarkdown("```js\nconst a = 1;\n```");
    expect(html).toContain("shiki");
    expect(html).toContain("light-dark(");
  });

  it("renders github-style alerts", async () => {
    const { html } = await renderMarkdown("> [!NOTE]\n> take care");
    expect(html).toContain("markdown-alert markdown-alert-note");
  });

  it("renders footnotes", async () => {
    const { html } = await renderMarkdown("text[^1]\n\n[^1]: note body");
    expect(html).toContain("footnotes");
  });
});
