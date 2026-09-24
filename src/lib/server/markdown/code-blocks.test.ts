import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("code blocks", () => {
  it("renders code blocks with shiki", async () => {
    const { html } = await renderMarkdown("```js\nconst a = 1;\n```");
    expect(html).toContain("shiki");
    expect(html).toContain("light-dark(");
  });

  it("renders a filename bar for lang:file fences and keeps the language", async () => {
    const { html } = await renderMarkdown("```ts:src/app.ts\nconst a = 1;\n```");
    expect(html).toContain('class="code-block-title"');
    expect(html).toContain("src/app.ts");
    // shiki rewrites the code class entirely — "shiki" proves highlighting ran
    // on the corrected language (not on "ts:src/app.ts").
    expect(html).toContain("shiki");
    expect(html).not.toContain("language-ts:src");
  });

  it("adds a copy button to code blocks", async () => {
    const { html } = await renderMarkdown("```js\nconst a = 1;\n```");
    expect(html).toContain('class="code-copy"');
    expect(html).toContain('aria-label="コードをコピー"');
    expect(html).toContain("icon-copy");
    expect(html).toContain("icon-check");
  });

  it("runs bare fences through shiki as plaintext so line numbers appear", async () => {
    const { html } = await renderMarkdown("```\nplain text\nlog line\n```");
    // language-plaintext is injected so shiki emits .line spans — the CSS
    // counter gutter (and its sticky pinning) depends on them.
    expect(html).toContain("shiki");
    expect(html).toContain('class="line"');
  });
});
