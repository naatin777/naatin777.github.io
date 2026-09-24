import type { Element, Root } from "hast";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { TocItem } from "$lib/types";

// Screen-reader-only headings (the footnotes section label) get ids but are
// not real content headings — exclude them from toc and permalink anchors.
const isContentHeading = (node: Element): boolean => {
  if (!/^h[1-6]$/.test(node.tagName)) return false;
  const classes = node.properties?.className;
  return !Array.isArray(classes) || !classes.includes("sr-only");
};

// Ids owned by the page chrome outside article markup — rehype-slug can't
// see them, so a `## main` heading would otherwise duplicate the skip-link
// target <main id="main">.
const PAGE_IDS = new Set(["main"]);

// Renames heading ids that collide with page-level ids. Runs after
// rehype-slug and before toc collection, so toc entries and permalink hrefs
// pick up the corrected id automatically.
export const rehypeAvoidPageIds: Plugin<[], Root> = () => (tree) => {
  const used = new Set<string>();
  visit(tree, "element", (node) => {
    if (typeof node.properties?.id === "string") used.add(node.properties.id);
  });
  visit(tree, "element", (node) => {
    if (!/^h[1-6]$/.test(node.tagName)) return;
    const id = node.properties?.id;
    if (typeof id !== "string" || !PAGE_IDS.has(id)) return;
    let candidate = `${id}-1`;
    for (let n = 2; used.has(candidate); n += 1) candidate = `${id}-${n}`;
    used.add(candidate);
    node.properties.id = candidate;
  });
};

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
