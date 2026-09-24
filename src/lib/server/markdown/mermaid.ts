import type { Element, ElementContent, Parent, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { renderMermaid } from "../mermaid-renderer";
import { copyButton } from "./code-blocks";

const mermaidTab = (label: string, pane: string, pressed: boolean): Element => ({
  type: "element",
  tagName: "button",
  properties: {
    type: "button",
    className: ["mermaid-tab"],
    dataTab: pane,
    ariaPressed: pressed ? "true" : "false",
  },
  children: [{ type: "text", value: label }],
});

const mermaidPane = (name: string, hidden: boolean, children: ElementContent[]): Element => ({
  type: "element",
  tagName: "div",
  properties: { className: ["mermaid-pane"], dataPane: name, hidden },
  children,
});

// ```mermaid blocks -> a .mermaid-block with プレビュー/ソース tabs. The
// preview pane holds light/dark SVGs; the source pane keeps the original
// <pre> so shiki highlighting, line numbers, and the copy button all still
// apply. Runs before shiki so the source pane is highlighted normally.
export const rehypeMermaid: Plugin<[], Root> = () => async (tree) => {
  const blocks: { parent: Parent; index: number; node: Element; source: string }[] = [];
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "pre" || index === undefined || parent === undefined) return;
    const code = node.children[0];
    if (code?.type !== "element" || code.tagName !== "code") return;
    const classes = code.properties?.className;
    if (!Array.isArray(classes) || !classes.includes("language-mermaid")) return;
    // whitespace:"pre" keeps newlines — the default "normal" collapses them
    // like CSS, handing mermaid a single-line source that fails to parse.
    blocks.push({ parent, index, node, source: toText(code, { whitespace: "pre" }) });
  });
  /* oxlint-disable no-await-in-loop -- renderMermaid serializes work internally; one queue, sequential calls */
  for (const block of blocks) {
    const rendered = await renderMermaid(block.source);
    if (!rendered) continue; // stays a code block — shiki renders it as a fallback
    const svgs = fromHtml(
      `<div class="mermaid-diagram mermaid-light">${rendered.light}</div><div class="mermaid-diagram mermaid-dark">${rendered.dark}</div>`,
      { fragment: true },
    );
    block.parent.children[block.index] = {
      type: "element",
      tagName: "div",
      properties: { className: ["mermaid-block"] },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block-title", "mermaid-bar"] },
          children: [
            { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: "mermaid" }] },
            {
              type: "element",
              tagName: "div",
              properties: { className: ["mermaid-tabs"] },
              children: [mermaidTab("プレビュー", "preview", true), mermaidTab("ソース", "source", false)],
            },
            copyButton(),
          ],
        },
        mermaidPane(
          "preview",
          false,
          svgs.children.filter((child): child is ElementContent => child.type !== "doctype"),
        ),
        mermaidPane("source", true, [block.node]),
      ],
    };
  }
  /* oxlint-enable no-await-in-loop */
};
