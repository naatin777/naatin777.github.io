// Syncs link-card metadata into content/generated/linkcards.json.
// Run via `pnpm sync:linkcards`.
//
// A paragraph that is only a bare URL becomes a link card at render time,
// so this script walks content/posts/**/*.md with the real parser (code
// fences can't yield false positives), collects those URLs, fetches each
// page once, and writes og:/<title>/description metadata. The file is
// committed — builds never touch the network.
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// Single source of truth for the card shape — the runtime import resolves
// without the $lib alias (the module only pulls node/unist deps).
import { cardSchema, type Linkcard } from "../src/lib/server/markdown/linkcards.ts";

const OUT_FILE = "content/generated/linkcards.json";
const POSTS_DIR = "content/posts";

const markdownFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f));

const collectUrls = (files: string[]): Set<string> => {
  const urls = new Set<string>();
  const processor = unified().use(remarkParse).use(remarkGfm);
  for (const file of files) {
    const tree = processor.parse(readFileSync(file, "utf8"));
    visit(tree, "paragraph", (node) => {
      const [only] = node.children;
      if (
        node.children.length === 1 &&
        only?.type === "link" &&
        only.children.length === 1 &&
        only.children[0]?.type === "text" &&
        only.children[0].value === only.url &&
        /^https?:\/\//.test(only.url)
      ) {
        urls.add(only.url);
      }
    });
  }
  return urls;
};

// <meta> attrs can appear in either order — match content= both ways.
const pickMeta = (html: string, key: string): string | undefined => {
  const attr = `["']([^"']+)["']`;
  const forward = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=${attr}`, "i");
  const backward = new RegExp(`<meta[^>]+content=${attr}[^>]+(?:property|name)=["']${key}["']`, "i");
  const value = forward.exec(html)?.[1] ?? backward.exec(html)?.[1];
  // &amp; decodes last so &amp;lt; becomes "&lt;" (literal), not "<".
  return value
    ?.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
};

const fetchCard = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      // Some hosts 403 on undecorated fetch() (undici default UA).
      "user-agent": "Mozilla/5.0 (compatible; linkcards-bot/1.0)",
      accept: "text/html",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const rawImage = pickMeta(html, "og:image");
  // og:image is remote-fetched data that lands post-sanitize as <img src> —
  // only http(s) may pass; anything else (data:, javascript:, junk) is dropped.
  const image = rawImage ? new URL(rawImage, url) : undefined;
  return cardSchema.parse({
    title:
      pickMeta(html, "og:title") ??
      pickMeta(html, "twitter:title") ??
      /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ??
      url,
    description: pickMeta(html, "og:description") ?? pickMeta(html, "description") ?? "",
    image: image && (image.protocol === "http:" || image.protocol === "https:") ? image.href : undefined,
    siteName: pickMeta(html, "og:site_name"),
  });
};

const urls = collectUrls(markdownFiles(POSTS_DIR));
if (urls.size === 0) {
  console.log("[linkcards] no bare-URL paragraphs found");
  mkdirSync(join(OUT_FILE, ".."), { recursive: true });
  writeFileSync(OUT_FILE, "{}\n");
  process.exit(0);
}

const cards: Record<string, Linkcard> = {};
const sorted = [...urls].toSorted();
const results = await Promise.allSettled(
  sorted.map(async (url) => {
    const card = await fetchCard(url);
    cards[url] = card;
    console.log(`[linkcards] ${url} → ${card.title}`);
  }),
);
results.forEach((result, i) => {
  if (result.status === "rejected") console.warn(`[linkcards] ${sorted[i]!}:`, result.reason);
});

mkdirSync(join(OUT_FILE, ".."), { recursive: true });
// Rename-over keeps readers from ever seeing a truncated file.
const tmp = `${OUT_FILE}.tmp`;
writeFileSync(tmp, `${JSON.stringify(cards, null, 2)}\n`);
renameSync(tmp, OUT_FILE);
console.log(`[linkcards] wrote ${Object.keys(cards).length} card(s) → ${OUT_FILE}`);
