import type { Element, ElementContent, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const iconSvg = (inner: string, cls: string): ElementContent[] =>
  fromHtml(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${inner}</svg>`,
    { fragment: true },
  ).children.filter((child): child is ElementContent => child.type !== "doctype");

// Generated markup is post-sanitize and icon-only so nothing leaks into
// RSS/search text; the click handler is one delegated listener on the
// post page.
export const copyButton = (): Element => ({
  type: "element",
  tagName: "button",
  properties: {
    type: "button",
    className: ["code-copy"],
    ariaLabel: "コードをコピー",
  },
  children: [
    ...iconSvg(
      '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
      "icon-copy",
    ),
    ...iconSvg('<path d="M20 6 9 17l-5-5"/>', "icon-check"),
  ],
});

// Every fenced block gets a .code-block frame + title bar (Zenn-style)
// with a copy button at its right end. ```ts:src/app.ts splits the
// language: the bar shows the filename, plain ```ts shows the language
// name, and no language (or a raw-HTML <pre> without <code>) leaves the
// bar empty. Must run before rehypeShiki so it sees the raw language-
// class.
export const rehypeCodeBlocks: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "pre" || index === undefined || parent === undefined) return;
    let title = "";
    const code = node.children[0];
    if (code?.type === "element" && code.tagName === "code") {
      const classes = code.properties?.className;
      // remark-math emits math nodes as pre>code.language-math — rehype-katex
      // renders those (both $$ and ```math), so don't frame them as code.
      if (Array.isArray(classes) && classes.includes("language-math")) return;
      const langClass = Array.isArray(classes)
        ? classes.find((c): c is string => typeof c === "string" && c.startsWith("language-"))
        : undefined;
      if (langClass) {
        const body = langClass.slice("language-".length);
        const colon = body.indexOf(":");
        if (colon === -1) {
          title = body;
        } else {
          title = body.slice(colon + 1);
          code.properties.className = [`language-${body.slice(0, colon)}`];
        }
      }
    }
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: { className: ["code-block"] },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block-title"] },
          children: [{ type: "text", value: title }, copyButton()],
        },
        node,
      ],
    };
  });
};
