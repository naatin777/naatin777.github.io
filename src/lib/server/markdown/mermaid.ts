import type { Element, ElementContent, Parent, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { renderMermaid } from "../mermaid-renderer";
import { copyButton } from "./code-blocks";

// APG tabs with automatic activation: arrow keys move focus and select
// (handled by the delegated keydown on the post page), the selected tab is
// the group's single tab stop.
const mermaidTab = (blockId: string, label: string, pane: string, selected: boolean): Element => ({
  type: "element",
  tagName: "button",
  properties: {
    type: "button",
    role: "tab",
    id: `${blockId}-tab-${pane}`,
    className: ["mermaid-tab"],
    dataTab: pane,
    ariaSelected: selected ? "true" : "false",
    ariaControls: [`${blockId}-pane-${pane}`],
    tabIndex: selected ? 0 : -1,
  },
  children: [{ type: "text", value: label }],
});

const mermaidPane = (blockId: string, name: string, hidden: boolean, children: ElementContent[]): Element => ({
  type: "element",
  tagName: "div",
  properties: {
    role: "tabpanel",
    id: `${blockId}-pane-${name}`,
    ariaLabelledBy: [`${blockId}-tab-${name}`],
    className: ["mermaid-pane"],
    dataPane: name,
    hidden,
  },
  children,
});

// ```mermaid blocks -> a .mermaid-block with プレビュー/ソース tabs. The
// preview pane holds light/dark SVGs; the source pane keeps the original
// <pre> so shiki highlighting, line numbers, and the copy button all still
// apply. Runs before shiki so the source pane is highlighted normally.
export const rehypeMermaid: Plugin<[], Root> = () => async (tree) => {
  let blockSeq = 0;
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
    // tab/tabpanel ids must be unique within the document — the counter is
    // per-tree, so ids stay stable across rebuilds of the same post.
    const blockId = `mermaid-${blockSeq++}`;
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
              properties: { className: ["mermaid-tabs"], role: "tablist", ariaLabel: "プレビューとソースの切り替え" },
              children: [
                mermaidTab(blockId, "プレビュー", "preview", true),
                mermaidTab(blockId, "ソース", "source", false),
              ],
            },
            copyButton(),
          ],
        },
        mermaidPane(
          blockId,
          "preview",
          false,
          svgs.children.filter((child): child is ElementContent => child.type !== "doctype"),
        ),
        mermaidPane(blockId, "source", true, [block.node]),
      ],
    };
  }
  /* oxlint-enable no-await-in-loop */
};
