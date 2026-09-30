import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// :::details タイトル / ::: — a terser spelling of raw <details> blocks.
// remark-directive yields containerDirective; the label (inline text after
// the name) arrives as a first-child paragraph flagged directiveLabel,
// so hName-mapped to <summary>, and the directive itself to <details>.
// Both tags are in the sanitize schema's allowlist already.
export const remarkDetails: Plugin<[], Root> = () => (tree) => {
  visit(tree, "containerDirective", (node) => {
    if (node.name !== "details") return;
    node.data = { ...node.data, hName: "details" };
    const label = node.children[0];
    if (label?.type === "paragraph" && label.data?.directiveLabel) {
      label.data = { ...label.data, hName: "summary" };
    }
  });
};
