import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { z } from "zod";

const CARDS_FILE = "content/generated/linkcards.json";

// Exported for scripts/sync-linkcards.ts — the shape this validates is the
// shape that script writes.
export const cardSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  image: z.string().optional(),
  siteName: z.string().optional(),
});

export type Linkcard = z.infer<typeof cardSchema>;

const cardsSchema = z.record(z.string(), cardSchema);

// Card metadata is synced by `pnpm sync:linkcards` into linkcards.json and
// committed — builds never touch the network. Read per render (no module
// cache) so a re-sync is picked up without restarting the dev server.
const cards = (): Record<string, Linkcard> => cardsSchema.parse(JSON.parse(readFileSync(CARDS_FILE, "utf8")));

// Render-cache salt — a re-synced linkcards.json re-renders posts even
// when their Markdown is untouched.
export const linkcardsDigest = (): string => createHash("sha256").update(readFileSync(CARDS_FILE)).digest("hex");

const textOf = (node: Element): string =>
  node.children.map((c) => (c.type === "text" ? c.value : c.type === "element" ? textOf(c) : "")).join("");

// A paragraph that is only a bare URL (remark-gfm autolinks it, so the
// link text equals the href) becomes a link card when sync:linkcards has
// metadata for it. Unsynced URLs stay plain links.
export const rehypeLinkcards: Plugin<[], Root> = () => (tree) => {
  const map = cards();
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "p" || index === undefined || parent === undefined) return;
    const [only] = node.children;
    if (node.children.length !== 1 || only?.type !== "element" || only.tagName !== "a") return;
    const href = only.properties?.href;
    if (typeof href !== "string" || textOf(only) !== href) return;
    const card = map[href];
    if (!card) return;
    const host = new URL(href).hostname;
    const children: Element[] = [
      {
        type: "element",
        tagName: "span",
        properties: { className: ["linkcard-body"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["linkcard-title"] },
            children: [{ type: "text", value: card.title }],
          },
          {
            type: "element",
            tagName: "span",
            properties: { className: ["linkcard-description"] },
            children: [{ type: "text", value: card.description }],
          },
          {
            type: "element",
            tagName: "span",
            properties: { className: ["linkcard-domain"] },
            children: [{ type: "text", value: card.siteName ?? host }],
          },
        ],
      },
    ];
    // card.image lands post-sanitize as <img src> — a hand-edited
    // linkcards.json could carry data:/javascript: junk, so http(s) only.
    if (card.image && /^https?:\/\//.test(card.image)) {
      children.push({
        type: "element",
        tagName: "img",
        properties: { className: ["linkcard-thumbnail"], src: card.image, alt: "", loading: "lazy" },
        children: [],
      });
    }
    // Generated post-sanitize markup, so add the external-link affordances
    // rehype-external-links would have added itself.
    parent.children[index] = {
      type: "element",
      tagName: "a",
      properties: {
        // not-prose opts the card out of the typography plugin's link
        // styles entirely (underline/color) — it renders as a component.
        className: ["linkcard", "not-prose"],
        href,
        target: "_blank",
        rel: ["noopener", "noreferrer"],
      },
      children,
    };
  });
};
