import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

// Pipeline-level integration for plugins that have no dedicated local module
// (external links, KaTeX, alerts, footnotes).
describe("renderMarkdown", () => {
  it("adds target and rel to external links only", async () => {
    const { html } = await renderMarkdown("[ext](https://example.com) and [int](/about/)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('<a href="/about/">int</a>');
  });

  it("renders katex math", async () => {
    const { html } = await renderMarkdown("$x^2$");
    expect(html).toContain("katex");
  });

  it("renders github-style alerts", async () => {
    const { html } = await renderMarkdown("> [!NOTE]\n> take care");
    expect(html).toContain("markdown-alert markdown-alert-note");
  });

  it("renders footnotes", async () => {
    const { html } = await renderMarkdown("text[^1]\n\n[^1]: note body");
    expect(html).toContain("footnotes");
  });

  it("wraps tables in a scroll container", async () => {
    const { html } = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain('class="table-wrap"');
    expect(html).toMatch(/<div class="table-wrap">\s*<table>/);
  });
});
