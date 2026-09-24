import type { Element, Root } from "hast";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { TocItem } from "$lib/types";

// Screen-reader-only headings (the footnotes section label) get ids but are
// not real content headings — exclude them from toc and permalink anchors.
const isContentHeading = (node: Element): boolean =>
  /^h[1-6]$/.test(node.tagName) && !(node.properties?.className as string[] | undefined)?.includes("sr-only");

// Collects headings after rehype-slug assigns ids. Must run before
// rehypeHeadingAnchors, which would add the "#" anchor to the text.
export const rehypeCollectToc: Plugin<[], Root> = () => (tree, file) => {
  const toc: TocItem[] = [];
  visit(tree, "element", (node) => {
    const id = node.properties?.id;
    if (isContentHeading(node) && typeof id === "string") {
      toc.push({ id, text: toText(node).trim(), depth: Number(node.tagName[1]) });
    }
  });
  file.data.toc = toc;
};

// Appends a keyboard-focusable "#" permalink to each content heading.
export const rehypeHeadingAnchors: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    const id = node.properties?.id;
    if (!isContentHeading(node) || typeof id !== "string" || node.tagName === "h1") return;
    node.children.push({
      type: "element",
      tagName: "a",
      properties: {
        className: ["heading-anchor"],
        href: `#${id}`,
        ariaLabel: `${toText(node).trim()} へのリンク`,
      },
      children: [{ type: "text", value: "#" }],
    });
  });
};
