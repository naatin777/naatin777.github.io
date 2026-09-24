import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("sanitize schema", () => {
  it("sanitizes raw HTML: keeps safe tags, strips dangerous markup", async () => {
    const { html } = await renderMarkdown(
      '<details><summary>詳細</summary>中身</details>\n\n<img src="x.png" onerror="alert(1)">\n\n<script>alert(1)</script>',
    );
    expect(html).toContain("<details>");
    expect(html).toContain("<summary>");
    expect(html).toContain('<img src="x.png"');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script>");
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

  it("strips author-supplied ids but keeps user-content-* footnote ids", async () => {
    const { html } = await renderMarkdown('<div id="main">clobber</div>\n\ntext[^1]\n\n[^1]: note');
    expect(html).not.toContain('id="main"');
    expect(html).toContain("user-content-fn-1");
  });
});
