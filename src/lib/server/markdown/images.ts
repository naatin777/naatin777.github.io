import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Relative image srcs resolve against the post's own directory via the
// bundled-asset map, so each post folder is self-contained. Runs after
// rehype-raw so raw-HTML <img> tags go through the same resolver as markdown
// images (![x](./a.png), reference style included — all become elements by
// then), and before sanitize so rewritten srcs still cross the trust
// boundary. Links are untouched: [id]: ./page definitions used by <a> keep
// their semantics.
export const rehypeResolveImages =
  (resolveImage: (src: string) => string): Plugin<[], Root> =>
  () =>
  (tree) => {
    visit(tree, "element", (node: Element) => {
      const src = node.properties?.src;
      if (node.tagName === "img" && typeof src === "string") {
        node.properties.src = resolveImage(src);
      }
    });
  };
