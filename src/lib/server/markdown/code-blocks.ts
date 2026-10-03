import type { Element, ElementContent, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import type { ShikiTransformer } from "shiki";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const iconSvg = (inner: string, cls: string): ElementContent[] =>
  fromHtml(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${inner}</svg>`,
    { fragment: true },
  ).children.filter((child): child is ElementContent => child.type !== "doctype");

// Title-bar buttons. Generated markup is post-sanitize and icon-only so
// nothing leaks into RSS/search text; clicks are one delegated listener
// on the post page.
//
// Dismisses the .line:target tint — the delegated article click navigates
// the hash to the block's own id (browsers only re-evaluate :target on
// real fragment navigation, not shallow goto history writes).
const unfocusButton = (): Element => ({
  type: "element",
  tagName: "button",
  properties: {
    type: "button",
    className: ["code-unfocus"],
    ariaLabel: "ハイライトを解除",
  },
  children: iconSvg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', "icon-unfocus"),
});

const wrapButton = (): Element => ({
  type: "element",
  tagName: "button",
  properties: {
    type: "button",
    className: ["code-wrap"],
    ariaLabel: "行を折り返す",
    ariaPressed: "false",
  },
  children: iconSvg(
    '<path d="m16 16-3 3 3 3"/><path d="M3 12h14.5a1 1 0 0 1 0 7H13"/><path d="M3 19h6"/><path d="M3 5h18"/>',
    "icon-wrap",
  ),
});

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

// Per-line anchors: the `#name` spec that rehypeCodeBlocks restores into
// `metastring` turns each rendered .line into id="name-L<n>", so excerpt
// labels like [**L9-10**](#cmd16-cont-L9) can deep-link to the exact row.
export const lineAnchorIds = (): ShikiTransformer => ({
  name: "line-anchor-ids",
  line(node, lineNumber) {
    const id = /#([\w-]+)/.exec(this.options.meta?.["__raw"] ?? "")?.[1];
    if (id) node.properties = { ...node.properties, id: `${id}-L${lineNumber}` };
    return node;
  },
});

const nodeText = (n: ElementContent): string =>
  n.type === "text" ? n.value : n.type === "element" ? n.children.map(nodeText).join("") : "";

// ```console / shellsession: lines starting with `$ ` are commands, the
// rest are output — classes let CSS dim output so the prompt stands out.
export const consoleLines = (): ShikiTransformer => ({
  name: "console-lines",
  line(node) {
    if (this.options.lang !== "console" && this.options.lang !== "shellsession") return node;
    const cls = nodeText(node).startsWith("$ ") ? "command" : "output";
    const className = node.properties?.className;
    node.properties = {
      ...node.properties,
      className: [...(Array.isArray(className) ? className : []), cls],
    };
    return node;
  },
});

// ```filetree renders an indented listing as a nested list with folder/
// file icons — for layout-tour sections where a raw tree dump in
// monospace is all-gray. Trailing "/" marks directories.
const fileTree = (text: string): Element => {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  let lineIndex = 0;
  const build = (depth: number): Element => {
    const ul: Element = { type: "element", tagName: "ul", properties: {}, children: [] };
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (line === undefined) break;
      const indent = (line.match(/^[ \t]*/)?.[0] ?? "").replace(/\t/g, "  ").length;
      const indentDepth = Math.floor(indent / 2);
      if (indentDepth < depth) break;
      lineIndex++;
      const name = line.trim();
      const isDir = name.endsWith("/");
      const li: Element = {
        type: "element",
        tagName: "li",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["filetree-name"] },
            children: [
              ...iconSvg(
                isDir
                  ? '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'
                  : '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
                isDir ? "icon-folder" : "icon-file",
              ),
              { type: "text", value: isDir ? name.slice(0, -1) : name },
            ],
          },
        ],
      };
      if (isDir) li.children.push(build(depth + 1));
      ul.children.push(li);
    }
    return ul;
  };
  return {
    type: "element",
    tagName: "div",
    // not-prose: the tree lives in .prose where the typography plugin's
    // utilities-layer list styles beat @layer components overrides.
    properties: { className: ["filetree", "not-prose"] },
    children: [build(0)],
  };
};

// Every fenced block gets a .code-block frame + title bar (Zenn-style)
// with a copy button at its right end. ```ts:src/app.ts splits the
// language: the bar shows the filename, plain ```ts shows the language
// name, and no language (or a raw-HTML <pre> without <code>) leaves the
// bar empty. Must run before rehypeShiki so it sees the raw language-
// class.
export const rehypeCodeBlocks: Plugin<[], Root> = () => (tree) => {
  const usedIds = new Set(["main"]);
  visit(tree, "element", (node) => {
    if (typeof node.properties.id === "string") usedIds.add(node.properties.id);
  });
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "pre" || index === undefined || parent === undefined) return;
    let title = "";
    let blockId: string | undefined;
    let treeBody: Element | undefined;
    const code = node.children[0];
    const hasCode = code?.type === "element" && code.tagName === "code";
    if (hasCode) {
      const classes = code.properties?.className;
      // remark-math emits math nodes as pre>code.language-math — rehype-katex
      // renders those (both $$ and ```math), so don't frame them as code.
      if (Array.isArray(classes) && classes.includes("language-math")) return;
      const langClass = Array.isArray(classes)
        ? classes.find((c): c is string => typeof c === "string" && c.startsWith("language-"))
        : undefined;
      if (langClass) {
        let body = langClass.slice("language-".length);
        // ```lang:title{2,4-6}#name — {..} is a shiki meta line-highlight
        // spec and #name anchors the block (each rendered line also gets
        // id="name-L<n>" via lineAnchorIds, so excerpts can deep-link).
        // Real fence meta never reaches shiki because rehype-raw rebuilds
        // the tree and drops data.meta, so both ride inside the language
        // token and are restored into metastring here. Both specs match
        // at the END of the token — a title ending in #word or {..} would
        // be eaten as meta, so don't do that.
        const anchor = /#[\w-]+$/.exec(body);
        if (anchor) body = body.slice(0, -anchor[0].length);
        const highlight = /\{[\d,-]+\}$/.exec(body);
        if (highlight) body = body.slice(0, -highlight[0].length);
        if (anchor) {
          const requested = anchor[0].slice(1);
          const lineCount = nodeText(code).replace(/\n$/, "").split("\n").length;
          const idsFor = (id: string): string[] => [
            id,
            ...Array.from({ length: lineCount }, (_, i) => `${id}-L${i + 1}`),
          ];
          if (idsFor(requested).some((id) => usedIds.has(id)))
            throw new Error(`code anchor "#${requested}" collides with an existing id`);
          blockId = requested;
          idsFor(blockId).forEach((id) => usedIds.add(id));
        }
        const meta = [highlight?.[0], blockId ? `#${blockId}` : undefined].filter(Boolean).join("");
        if (meta) code.properties.metastring = meta;
        const colon = body.indexOf(":");
        const lang = colon === -1 ? body : body.slice(0, colon);
        title = colon === -1 ? body : body.slice(colon + 1);
        if (lang === "filetree" && code.type === "element") {
          // Swallow the pre entirely — the tree markup replaces it, so
          // shiki never sees this block and action buttons stay off.
          treeBody = fileTree(code.children.map(nodeText).join(""));
        } else {
          code.properties.className = [`language-${lang}`];
        }
      } else {
        // No language: tag as plaintext so shiki still emits .line spans
        // (line numbers, theme background) instead of skipping the block.
        code.properties.className = [...(Array.isArray(classes) ? classes : []), "language-plaintext"];
      }
    }
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: { className: ["code-block"], ...(blockId ? { id: blockId } : {}) },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block-title"] },
          // A raw-HTML <pre> without <code> has nothing to copy — the click
          // handler would no-op, so don't render dead buttons.
          children: [
            { type: "text", value: title },
            ...(hasCode && !treeBody
              ? [
                  {
                    type: "element" as const,
                    tagName: "div",
                    properties: { className: ["code-block-actions"] },
                    children: [...(blockId ? [unfocusButton()] : []), wrapButton(), copyButton()],
                  },
                ]
              : []),
          ],
        },
        treeBody ?? node,
      ],
    };
  });
};
