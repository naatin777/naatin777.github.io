import type { Root } from "hast";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";

// Collects the text a reader actually reads, for reading-time estimation.
// Runs on the final tree so generated noise is excluded: code blocks,
// rendered math, heading permalinks, and diagram SVGs. This replaces the
// old approach of stripping the same constructs from raw markdown by regex
// (which also miscounted image/link URLs as text).
export const rehypeCollectReadingText: Plugin<[], Root> = () => (tree, file) => {
  const parts: string[] = [];
  visit(tree, (node) => {
    if (node.type === "element") {
      const classes = node.properties?.className;
      const skipClass =
        Array.isArray(classes) &&
        (classes.includes("katex") ||
          classes.includes("heading-anchor") ||
          classes.includes("footnotes") ||
          classes.includes("code-block-title"));
      if (node.tagName === "pre" || node.tagName === "svg" || node.tagName === "button" || skipClass) return SKIP;
    }
    if (node.type === "text") parts.push(node.value);
  });
  file.data.readingText = parts.join(" ");
};
