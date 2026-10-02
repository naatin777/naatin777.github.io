import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// :::details[タイトル] / ::: uses remark-directive's bracketed label.
// Mapping it to <summary> keeps its inline markup; <details>/<summary>
// then cross the author-markup sanitize boundary with the rest of the tree.
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
