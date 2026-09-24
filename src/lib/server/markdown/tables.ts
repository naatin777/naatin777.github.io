import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Tables wider than the prose column would overflow the page — wrapping in
// a scroll container lets the frame scroll instead. Done as an AST wrap
// (rather than display:block on <table>) so table semantics survive.
// Post-sanitize: the wrapper div is generated markup.
export const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "table" || index === undefined || parent === undefined) return;
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: { className: ["table-wrap"] },
      children: [node],
    };
  });
};
