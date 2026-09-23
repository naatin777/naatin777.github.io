// Syncs Zenn article metadata into content/generated/zenn.json.
// Run via `pnpm sync:zenn`. Uses the official unauthenticated RSS feed:
// https://zenn.dev/<user>/feed?all=1
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const USERNAME = "naatin777";
const OUT_FILE = "content/generated/zenn.json";

const zennItem = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  category: z.array(z.string()).optional(),
});

const res = await fetch(`https://zenn.dev/${USERNAME}/feed?all=1`, {
  signal: AbortSignal.timeout(15_000),
});
if (!res.ok) throw new Error(`zenn feed responded ${res.status}`);

const doc = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === "item" || name === "category",
}).parse(await res.text());
const items = (doc?.rss?.channel?.item ?? []) as unknown[];

const posts = items.flatMap((item) => {
  const parsed = zennItem.safeParse(item);
  if (!parsed.success) {
    console.warn("[sync] zenn: skipping malformed item", parsed.error.issues);
    return [];
  }
  const { title, link, pubDate, category } = parsed.data;
  const timestamp = Date.parse(pubDate);
  if (!title || !link || Number.isNaN(timestamp)) {
    console.warn(`[sync] zenn: skipping item with missing/invalid fields (${title || link || "?"})`);
    return [];
  }
  return [
    {
      title,
      // Zenn is expected to emit topics as <category> — currently it emits
      // none, so tags are [] until the feed does. Dependency is localized here.
      tags: category ?? [],
      publishedAt: new Date(timestamp).toISOString(),
      url: link,
      source: "zenn",
    },
  ];
});

// Write via temp+rename so a crash mid-write can't corrupt the existing file;
// an empty fetch never overwrites real data.
if (posts.length === 0) throw new Error("zenn: fetched 0 posts — not overwriting");
mkdirSync("content/generated", { recursive: true });
writeFileSync(`${OUT_FILE}.tmp`, `${JSON.stringify(posts, null, 2)}\n`);
renameSync(`${OUT_FILE}.tmp`, OUT_FILE);
console.log(`[sync] wrote ${posts.length} zenn post(s) -> ${OUT_FILE}`);
