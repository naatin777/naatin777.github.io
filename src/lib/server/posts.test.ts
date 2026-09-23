import { describe, expect, it } from "vitest";
import { loadPostsFrom, renderMarkdown } from "./posts";

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
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('<a href="/about/">int</a>');
  });

  it("escapes raw HTML written in markdown", async () => {
    const { html } = await renderMarkdown('<script>alert(1)</script>\n\n<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src");
    expect(html).toMatch(/&#x3C;|&lt;/);
  });

  // hast-util-sanitize strips the unsafe href but keeps the element —
  // the same behavior GitHub applies to rendered markdown.
  it("drops links with unsafe URL schemes", async () => {
    const { html } = await renderMarkdown("[x](javascript:alert(1)) and [y](&#x6A;avascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("href");
    expect(html).toContain("x");
    expect(html).toContain("y");
  });

  it("drops images with unsafe URL schemes", async () => {
    const { html } = await renderMarkdown("![x](javascript:alert(1)) and ![y](data:text/html;base64,PHN2Zz4=)");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:");
    expect(html).not.toContain("src=");
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

  it("adds a copy button to code blocks", async () => {
    const { html } = await renderMarkdown("```js\nconst a = 1;\n```");
    expect(html).toContain('class="code-copy"');
    expect(html).toContain('aria-label="コードをコピー"');
    expect(html).toContain("icon-copy");
    expect(html).toContain("icon-check");
  });

  it("renders github-style alerts", async () => {
    const { html } = await renderMarkdown("> [!NOTE]\n> take care");
    expect(html).toContain("markdown-alert markdown-alert-note");
  });

  it("renders footnotes", async () => {
    const { html } = await renderMarkdown("text[^1]\n\n[^1]: note body");
    expect(html).toContain("footnotes");
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

  it("resolves relative image srcs via resolveImage", async () => {
    const { html } = await renderMarkdown("![x](./a.png) ![y](b.png) ![z](/static.png) ![w](https://e.com/i.png)", {
      resolveImage: (src) =>
        /^[a-z]+:/i.test(src) || src.startsWith("/") ? src : `/bundled/${src.replace(/^\.\//, "")}`,
    });
    expect(html).toContain('src="/bundled/a.png"');
    expect(html).toContain('src="/bundled/b.png"');
    expect(html).toContain('src="/static.png"');
    expect(html).toContain('src="https://e.com/i.png"');
  });

  it("collects reading text without code, math, links' hrefs, or permalinks", async () => {
    const { plainText } = await renderMarkdown(
      "## Hi\n\nsome [a link](https://e.com/long-url) text\n\n```js\ncode()\n```\n\n$x^2$",
    );
    expect(plainText).toContain("Hi");
    expect(plainText).toContain("a link");
    expect(plainText).toContain("text");
    expect(plainText).not.toContain("long-url");
    expect(plainText).not.toContain("code()");
    expect(plainText).not.toContain("x^2");
    expect(plainText).not.toContain("#");
  });
});

const entry = (frontmatter: string, body = "body") => `---\n${frontmatter}\n---\n${body}`;

describe("loadPostsFrom", () => {
  it("skips drafts, malformed frontmatter, and missing required fields", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/draft/index.md": entry("title: Draft\npublishedAt: 2026-03-01\ndraft: true"),
        "/content/posts/2026/broken/index.md": "---\n: bad yaml\n---\nx",
        "/content/posts/2026/notitle/index.md": entry("publishedAt: 2026-03-02"),
        "/content/posts/2026/good/index.md": entry("title: Good\npublishedAt: 2026-03-03"),
      },
      {},
    );
    expect(posts.map((p) => p.slug)).toEqual(["good"]);
  });

  it("skips duplicate slugs across year folders", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/dup/index.md": entry("title: A\npublishedAt: 2026-03-01"),
        "/content/posts/2027/dup/index.md": entry("title: B\npublishedAt: 2027-03-01"),
      },
      {},
    );
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe("dup");
  });

  it("pins bare frontmatter dates to JST regardless of machine timezone", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/date/index.md": entry("title: D\npublishedAt: 2026-03-08"),
        "/content/posts/2026/time/index.md": entry("title: T\npublishedAt: 2026-03-08 23:00"),
      },
      {},
    );
    const bySlug = new Map(posts.map((p) => [p.slug, p]));
    expect(bySlug.get("date")?.publishedAt.toISOString()).toBe("2026-03-07T15:00:00.000Z");
    expect(bySlug.get("time")?.publishedAt.toISOString()).toBe("2026-03-08T14:00:00.000Z");
  });
});
