import type { Element, Root } from "hast";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { TocItem } from "#lib/types.js";

// Screen-reader-only headings (the footnotes section label) get ids but are
// not real content headings — exclude them from toc and permalink anchors.
// Heading support tops out at h4: h5/h6 keep their ids (rehype-slug still
// runs) but render as plain styled headings with no anchor or toc entry.
const isContentHeading = (node: Element): boolean => {
  if (!/^h[1-4]$/.test(node.tagName)) return false;
  const classes = node.properties?.className;
  return !Array.isArray(classes) || !classes.includes("sr-only");
};

// Ids owned by the page chrome outside article markup — rehype-slug can't
// see them, so a `## main` heading would otherwise duplicate the skip-link
// target <main id="main">.
const PAGE_IDS = new Set(["main"]);

// Generated block/line and footnote ids take priority over heading slugs.
// Run after code rendering and rehype-slug, before collecting the toc.
export const rehypeUniqueHeadingIds: Plugin<[], Root> = () => (tree) => {
  const used = new Set(PAGE_IDS);
  const allIds = new Set(PAGE_IDS);
  const headings: Element[] = [];
  visit(tree, "element", (node) => {
    if (node.tagName === "svg") {
      visit(node, "element", (child) => {
        if (typeof child.properties.id === "string") {
          used.add(child.properties.id);
          allIds.add(child.properties.id);
        }
      });
      return "skip";
    }
    const id = node.properties.id;
    if (typeof id !== "string") return undefined;
    allIds.add(id);
    const classes = node.properties.className;
    if (/^h[1-6]$/.test(node.tagName) && !(Array.isArray(classes) && classes.includes("sr-only"))) {
      headings.push(node);
    } else used.add(id);
    return undefined;
  });
  for (const node of headings) {
    const id = node.properties.id;
    if (typeof id !== "string") continue;
    let candidate = id;
    if (used.has(id)) {
      candidate = `${id}-1`;
      for (let n = 2; allIds.has(candidate); n += 1) candidate = `${id}-${n}`;
    }
    used.add(candidate);
    allIds.add(candidate);
    node.properties.id = candidate;
  }
};

// Collects headings after rehype-slug assigns ids. Must run before
// rehypeHeadingAnchors, which would add the "#" anchor to the text.
export const rehypeCollectToc: Plugin<[], Root> = () => (tree, file) => {
  const toc: TocItem[] = [];
  visit(tree, "element", (node) => {
    if (node.tagName === "svg") return "skip";
    const id = node.properties?.id;
    if (isContentHeading(node) && typeof id === "string") {
      toc.push({ id, text: toText(node).trim(), depth: Number(node.tagName[1]) });
    }
    return undefined;
  });
  file.data.toc = toc;
};

// Appends a keyboard-focusable "#" permalink to each content heading.
export const rehypeHeadingAnchors: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    if (node.tagName === "svg") return "skip";
    const id = node.properties?.id;
    if (!isContentHeading(node) || typeof id !== "string" || node.tagName === "h1") return undefined;
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
    return undefined;
  });
};
