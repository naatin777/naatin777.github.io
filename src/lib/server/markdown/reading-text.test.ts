import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./index";

describe("reading text", () => {
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
