import type { Root } from "hast";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// GFM emits disabled checkboxes followed by text, without a <label>.
// Use only this item's text so a nested task list doesn't enter its name.
export const rehypeTaskLabels: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    if (node.tagName !== "li") return;
    const classes = node.properties.className;
    if (!Array.isArray(classes) || !classes.includes("task-list-item")) return;
    const label = toText({
      ...node,
      children: node.children.filter((child) => child.type !== "element" || !["ul", "ol"].includes(child.tagName)),
    }).trim();
    visit(node, "element", (child) => {
      if (child !== node && ["ul", "ol"].includes(child.tagName)) return "skip";
      if (child.tagName === "input" && child.properties.type === "checkbox") {
        child.properties.ariaLabel ??= label || "タスク";
      }
      return undefined;
    });
  });
};
