import { describe, expect, it } from "vitest";
import { absolutizeUrls } from "./absolutize-urls";

const POST = "https://site.test/posts/slug/";

describe("absolutizeUrls", () => {
  it("resolves root-relative, dot-relative, and fragment URLs against the post URL", () => {
    const html = '<img src="/_app/x.png"><a href="./rel/">r</a><a href="../up">u</a><a href="#part">f</a>';
    const out = absolutizeUrls(html, POST);
    expect(out).toContain('src="https://site.test/_app/x.png"');
    expect(out).toContain('href="https://site.test/posts/slug/rel/"');
    expect(out).toContain('href="https://site.test/posts/up"');
    expect(out).toContain('href="https://site.test/posts/slug/#part"');
  });

  it("keeps external and protocol-relative URLs untouched", () => {
    const html = '<a href="https://e.com/a">a</a><img src="//cdn.e.com/i.png"><a href="javascript:alert(1)">j</a>';
    const out = absolutizeUrls(html, POST);
    expect(out).toContain('href="https://e.com/a"');
    expect(out).toContain('src="https://cdn.e.com/i.png"');
    expect(out).toContain('href="javascript:alert(1)"');
    expect(out).not.toContain("site.test//");
  });
});
