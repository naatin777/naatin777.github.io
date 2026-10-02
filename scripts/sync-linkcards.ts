// Syncs link-card metadata into content/generated/linkcards.json.
// Run via `pnpm sync:linkcards`.
//
// A paragraph that is only a bare URL becomes a link card at render time,
// so this script walks content/posts/**/*.md with the real parser (code
// fences can't yield false positives), collects those URLs, fetches each
// page once, and writes og:/<title>/description metadata. The file is
// committed — builds never touch the network.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import { join } from "node:path";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { z } from "zod";

// Single source of truth for the card shape — imported at runtime via
// #lib (package.json imports field); the module only pulls node/unist
// deps, so node's type stripping can execute it.
import { cardSchema, type Linkcard } from "#lib/server/markdown/linkcards.ts";

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

const fetchCard = async (url: string): Promise<Linkcard> => {
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
  const tree = fromHtml(await res.text());
  const metadata = new Map<string, string>();
  let title: string | undefined;
  visit(tree, "element", (node) => {
    if (node.tagName === "title") title ??= toText(node).trim();
    if (node.tagName !== "meta") return;
    const key = node.properties.property ?? node.properties.name;
    const value = node.properties.content;
    if (typeof key === "string" && typeof value === "string" && !metadata.has(key)) metadata.set(key, value);
  });
  const rawImage = metadata.get("og:image");
  // og:image is remote-fetched data that lands post-sanitize as <img src> —
  // only http(s) may pass; anything else (data:, javascript:, junk) is dropped.
  const image = rawImage ? new URL(rawImage, res.url || url) : undefined;
  return cardSchema.parse({
    title: metadata.get("og:title") ?? metadata.get("twitter:title") ?? title ?? url,
    description: metadata.get("og:description") ?? metadata.get("description") ?? "",
    image: image && (image.protocol === "http:" || image.protocol === "https:") ? image.href : undefined,
    siteName: metadata.get("og:site_name"),
  });
};

const sorted = [...collectUrls(markdownFiles(POSTS_DIR))].toSorted();
const existing = existsSync(OUT_FILE)
  ? z.record(z.string(), cardSchema).parse(JSON.parse(readFileSync(OUT_FILE, "utf8")))
  : {};
const cards: Record<string, Linkcard> = {};
const results = await Promise.allSettled(sorted.map(fetchCard));
results.forEach((result, i) => {
  const url = sorted[i];
  if (url === undefined) return;
  if (result.status === "fulfilled") {
    cards[url] = result.value;
    console.log(`[linkcards] ${url} → ${result.value.title}`);
  } else {
    console.warn(`[linkcards] ${url}:`, result.reason);
    // Keep cached metadata during outages, while still pruning removed URLs.
    const previous = existing[url];
    if (previous) cards[url] = previous;
    else process.exitCode = 1;
  }
});

mkdirSync(join(OUT_FILE, ".."), { recursive: true });
// Rename-over keeps readers from ever seeing a truncated file.
const tmp = `${OUT_FILE}.tmp`;
writeFileSync(tmp, `${JSON.stringify(cards, null, 2)}\n`);
renameSync(tmp, OUT_FILE);
console.log(`[linkcards] wrote ${Object.keys(cards).length} card(s) → ${OUT_FILE}`);
