import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("images", () => {
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

  it("resolves reference-style image definitions but not link definitions", async () => {
    const { html } = await renderMarkdown("![x][img] and [a link][pg]\n\n[img]: ./i.png\n[pg]: ./p", {
      resolveImage: (src) => `/bundled/${src.replace(/^\.\//, "")}`,
    });
    expect(html).toContain('src="/bundled/i.png"');
    // link definitions keep their raw relative target
    expect(html).toContain('href="./p"');
  });

  it("resolves raw-HTML img srcs like markdown images", async () => {
    const { html } = await renderMarkdown('<img src="./raw.png" alt="x" />', {
      resolveImage: (src) => `/bundled/${src.replace(/^\.\//, "")}`,
    });
    expect(html).toContain('src="/bundled/raw.png"');
  });
});
