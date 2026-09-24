import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// @shikijs/rehype replaces each <pre> with a hast *fragment root* containing
// the styled <pre>. Stringify inlines it harmlessly, but the stray root node
// breaks parent lookups for later plugins — splice its children back in.
export const rehypeFlattenRoots: Plugin<[], Root> = () => (tree) => {
  visit(tree, (node, index, parent) => {
    if (node.type === "root" && node !== tree && index !== undefined && parent) {
      parent.children.splice(index, 1, ...node.children);
      return index;
    }
    return undefined;
  });
};
