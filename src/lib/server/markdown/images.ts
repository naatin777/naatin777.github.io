import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// The resolver may return just the rewritten URL or the URL plus the
// image's intrinsic dimensions (measurable only for bundled local files —
// external URLs would need a fetch). Dimensions land on width/height attrs
// so the browser reserves the layout box before the image loads.
export interface ResolvedImage {
  src: string;
  width?: number;
  height?: number;
}
export type ResolveImage = (src: string) => string | ResolvedImage;

// Relative image srcs resolve against the post's own directory via the
// bundled-asset map, so each post folder is self-contained. Runs after
// rehype-raw so raw-HTML <img> tags go through the same resolver as markdown
// images (![x](./a.png), reference style included — all become elements by
// then), and before sanitize so rewritten srcs still cross the trust
// boundary. Links are untouched: [id]: ./page definitions used by <a> keep
// their semantics. decoding/width/height are set before sanitize too —
// sanitize must allow them through (schema.ts does). `loading` is left to
// rehypeLazyImages: pre-filling "lazy" here would defeat its first-image
// and in-SVG exclusions.
export const rehypeResolveImages =
  (resolveImage: ResolveImage): Plugin<[], Root> =>
  () =>
  (tree) => {
    visit(tree, "element", (node: Element) => {
      const src = node.properties?.src;
      if (node.tagName === "img" && typeof src === "string") {
        const resolved = resolveImage(src);
        const image = typeof resolved === "string" ? { src: resolved } : resolved;
        node.properties.src = image.src;
        node.properties.decoding ??= "async";
        // ??= keeps author-set values — they cross sanitize alongside ours.
        node.properties.width ??= image.width;
        node.properties.height ??= image.height;
      }
    });
  };
