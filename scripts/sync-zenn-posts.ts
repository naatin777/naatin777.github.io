// Syncs Zenn article metadata into content/generated/zenn.json.
// Run via `pnpm sync:zenn`. Uses only official sources — no private APIs:
//
//   Zenn RSS (https://zenn.dev/<user>/feed?all=1)
//     → the list of published articles: title / pubDate / link
//   Vendored repo (content/zenn/articles/<slug>.md, via git subtree)
//     → frontmatter `topics`, joined on the slug from the RSS link
//   GitHub commits API on the article repo (official, unauthenticated)
//     → last commit touching articles/<slug>.md = the repo-side update
//       time; Zenn exposes no per-article updatedAt in its feed
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import matter from "gray-matter";
import { z } from "zod";

import { author } from "../src/lib/config/site.ts";
// Type-only import: erased at runtime, so the $lib alias inside
// external-articles never needs resolving under node's type stripping.
import type { ExternalPost } from "../src/lib/server/external-articles.ts";

const ARTICLES_DIR = "content/zenn/articles";
const OUT_FILE = "content/generated/zenn.json";

const zennItem = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
});

// Only the path to the items array is trusted — each item is validated
// individually by zennItem below.
const zennFeed = z.object({
  rss: z
    .object({
      channel: z
        .object({
          item: z.array(z.unknown()).optional(),
        })
        .optional(),
    })
    .optional(),
});

const zennFrontmatter = z.object({
  topics: z.array(z.string()).default([]),
});

const githubCommits = z.array(
  z.object({
    commit: z.object({
      committer: z.object({ date: z.string() }),
    }),
  }),
);

// Repo-linked Zenn articles deploy on push, so the last commit touching the
// file is the update timestamp Zenn itself reports for the article. A failure
// just means no updatedAt — publication data from the RSS still syncs.
const repoUpdatedAt = async (slug: string): Promise<string | undefined> => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${author.name}/zenn-articles/commits?path=articles/${slug}.md&per_page=1`,
      {
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "zenn-posts-sync" },
      },
    );
    if (!res.ok) return undefined;
    const parsed = githubCommits.safeParse(await res.json());
    const date = parsed.success ? parsed.data[0]?.commit.committer.date : undefined;
    if (!date || Number.isNaN(Date.parse(date))) return undefined;
    return new Date(date).toISOString();
  } catch {
    return undefined;
  }
};

// Topics live only in the repo frontmatter — RSS does not carry them.
// An article missing from the subtree still syncs, with empty tags.
const topicsFor = (slug: string): string[] => {
  const file = `${ARTICLES_DIR}/${slug}.md`;
  if (!existsSync(file)) {
    console.warn(`[sync] zenn: no vendored article "${slug}.md" — empty tags (pull the subtree?)`);
    return [];
  }
  try {
    const parsed = zennFrontmatter.safeParse(matter(readFileSync(file, "utf8")).data);
    if (!parsed.success) {
      console.warn(`[sync] zenn: bad frontmatter in ${file}`, parsed.error.issues);
      return [];
    }
    return parsed.data.topics;
  } catch (error) {
    console.warn(`[sync] zenn: cannot read ${file}`, error);
    return [];
  }
};

const res = await fetch(`https://zenn.dev/${author.name}/feed?all=1`, {
  signal: AbortSignal.timeout(15_000),
});
if (!res.ok) throw new Error(`zenn feed responded ${res.status}`);

const doc = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === "item",
}).parse(await res.text());
const feed = zennFeed.safeParse(doc);
if (!feed.success) console.error("[sync] zenn feed failed validation:", feed.error);
const items = feed.success ? (feed.data.rss?.channel?.item ?? []) : [];

const posts = (
  await Promise.all(
    items.map(async (item): Promise<ExternalPost[]> => {
      const parsed = zennItem.safeParse(item);
      if (!parsed.success) {
        console.warn("[sync] zenn: skipping malformed item", parsed.error.issues);
        return [];
      }
      const { title, link, pubDate } = parsed.data;
      const timestamp = Date.parse(pubDate);
      const slug = link.split("/").pop() ?? "";
      // The slug becomes a filesystem path segment in topicsFor() — restrict it
      // so a hostile/malformed feed link can't traverse outside ARTICLES_DIR.
      if (!title || !link || !/^[\w-]+$/.test(slug) || Number.isNaN(timestamp)) {
        console.warn(`[sync] zenn: skipping item with missing/invalid fields (${title || link || "?"})`);
        return [];
      }
      // The first commit lands seconds before Zenn's deploy, so a never-edited
      // article would get updatedAt < publishedAt — only emit it when the file
      // was actually committed to again after publication.
      const committedAt = await repoUpdatedAt(slug);
      const updatedAt = committedAt !== undefined && Date.parse(committedAt) > timestamp ? committedAt : undefined;
      return [
        {
          title,
          tags: topicsFor(slug),
          publishedAt: new Date(timestamp).toISOString(),
          updatedAt,
          url: link,
          source: "zenn",
        },
      ];
    }),
  )
).flat();

// Write via temp+rename so a crash mid-write can't corrupt the existing file;
// an empty fetch never overwrites real data.
if (posts.length === 0) throw new Error("zenn: fetched 0 posts — not overwriting");
mkdirSync("content/generated", { recursive: true });
writeFileSync(`${OUT_FILE}.tmp`, `${JSON.stringify(posts, null, 2)}\n`);
renameSync(`${OUT_FILE}.tmp`, OUT_FILE);
console.log(`[sync] wrote ${posts.length} zenn post(s) -> ${OUT_FILE}`);
