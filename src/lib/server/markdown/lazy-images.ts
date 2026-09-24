import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const rehypeLazyImages: Plugin<[], Root> = () => (tree) => {
  // imgs inside inline SVG (mermaid labels) are excluded: lazy-loading in
  // foreignObject is unreliable — the browser may never fetch them.
  const inSvg = new Set<Element>();
  visit(tree, "element", (node) => {
    if (node.tagName !== "svg") return;
    visit(node, "element", (descendant) => {
      if (descendant.tagName === "img") inSvg.add(descendant);
    });
  });
  // The first image in document order is a plausible LCP candidate — keep it
  // eager so lazy-loading doesn't delay the largest paint.
  let first = true;
  visit(tree, "element", (node) => {
    if (node.tagName !== "img" || inSvg.has(node)) return;
    if (first) {
      first = false;
      return;
    }
    node.properties.loading = "lazy";
  });
};
