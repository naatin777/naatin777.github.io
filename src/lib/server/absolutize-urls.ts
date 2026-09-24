import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";

// Relative URLs in article HTML break inside RSS readers — resolve every
// src/href against the post's canonical URL. Protocol-relative URLs keep
// their host (//cdn.example/x -> https://cdn.example/x), and fragment links
// (#heading) become post-URL fragments pointing at the article on the site.
export const absolutizeUrls = (html: string, postUrl: string): string => {
  const tree = fromHtml(html, { fragment: true });
  visit(tree, "element", (node) => {
    for (const attr of ["src", "href"] as const) {
      const value = node.properties?.[attr];
      if (typeof value !== "string") continue;
      try {
        node.properties[attr] = new URL(value, postUrl).href;
      } catch {
        // leave malformed values untouched
      }
    }
  });
  return toHtml(tree);
};
