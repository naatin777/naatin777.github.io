import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("details directive", () => {
  it("renders :::details[label] as <details><summary>", async () => {
    const { html } = await renderMarkdown(":::details[折りたたみ]\n\nbody text\n\n:::");
    expect(html).toContain("<details>");
    expect(html).toContain("<summary>折りたたみ</summary>");
    expect(html).toContain("body text");
  });

  it("renders :::details without a bracketed label as a plain <details>", async () => {
    const { html } = await renderMarkdown(":::details\n\nbody text\n\n:::");
    expect(html).toContain("<details>");
    expect(html).not.toContain("<summary>");
  });
});
