// Syncs Zenn article metadata into content/generated/zenn.json.
// Run via `pnpm sync:zenn`. Uses only official sources — no private APIs:
//
//   Zenn RSS (https://zenn.dev/<user>/feed?all=1)
//     → the list of published articles: title / pubDate / link
//   zenn-articles repo on GitHub (blobless clone into a temp dir)
//     → frontmatter `topics`, joined on the slug from the RSS link
//     → `git log` on articles/<slug>.md for the repo-side update time;
//       Zenn exposes no per-article updatedAt in its feed
//     One clone replaces per-file API/raw requests, so network cost is
//     O(1) in article count and no rate limit applies.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { XMLParser } from "fast-xml-parser";
import matter from "gray-matter";
import { z } from "zod";

import { author } from "../src/lib/config/site.ts";
// Type-only import: erased at runtime, so the $lib alias inside
// external-articles never needs resolving under node's type stripping.
import type { ExternalPost } from "../src/lib/server/external-articles.ts";

const OUT_FILE = "content/generated/zenn.json";

const zennItemSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
});

// Only the path to the items array is trusted — each item is validated
// individually by zennItemSchema below.
const zennFeedSchema = z.object({
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

const zennFrontmatterSchema = z.object({
  topics: z.array(z.string()).default([]),
});

// Repo-linked Zenn articles deploy on push, so the last commit touching the
// file is the update timestamp Zenn itself reports for the article. git
// itself failing throws — with no reliable date source the sync aborts
// rather than writing wrong data — while a file with no commits (not yet
// pushed to the repo) just yields no updatedAt.
const repoUpdatedAt = (repoDir: string, slug: string): string | undefined => {
  const out = execFileSync("git", ["-C", repoDir, "log", "-1", "--format=%cI", "--", `articles/${slug}.md`], {
    encoding: "utf8",
  }).trim();
  if (out === "") {
    console.warn(`[sync] zenn: no commits for articles/${slug}.md — updatedAt unset`);
    return undefined;
  }
  const timestamp = Date.parse(out);
  if (Number.isNaN(timestamp)) {
    throw new Error(`[sync] zenn: unparseable commit date ${JSON.stringify(out)} for articles/${slug}.md`);
  }
  return new Date(timestamp).toISOString();
};

// Topics live only in the repo frontmatter — RSS does not carry them.
// An article missing from the repo still syncs, with empty tags.
const topicsFor = (repoDir: string, slug: string): string[] => {
  const file = join(repoDir, "articles", `${slug}.md`);
  if (!existsSync(file)) {
    console.warn(`[sync] zenn: no article "${slug}.md" in zenn-articles — empty tags`);
    return [];
  }
  try {
    const parsed = zennFrontmatterSchema.safeParse(matter(readFileSync(file, "utf8")).data);
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

const res = await fetch(`https://zenn.dev/${author.handle}/feed?all=1`, {
  signal: AbortSignal.timeout(15_000),
});
if (!res.ok) throw new Error(`zenn feed responded ${res.status}`);

const doc = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === "item",
}).parse(await res.text());
const feed = zennFeedSchema.safeParse(doc);
if (!feed.success) console.error("[sync] zenn feed failed validation:", feed.error);
const items = feed.success ? (feed.data.rss?.channel?.item ?? []) : [];

// Blobless + sparse clone: full history with file contents fetched lazily
// (and batched by git) — articles/ only, so books/ etc. never download.
const repoDir = mkdtempSync(join(tmpdir(), "zenn-articles-"));
try {
  execFileSync("git", [
    "clone",
    "--filter=blob:none",
    "--sparse",
    "--quiet",
    `https://github.com/${author.handle}/zenn-articles`,
    repoDir,
  ]);
  execFileSync("git", ["-C", repoDir, "sparse-checkout", "set", "articles"]);

  const posts = items.flatMap((item): ExternalPost[] => {
    const parsed = zennItemSchema.safeParse(item);
    if (!parsed.success) {
      console.warn("[sync] zenn: skipping malformed item", parsed.error.issues);
      return [];
    }
    const { title, link, pubDate } = parsed.data;
    const timestamp = Date.parse(pubDate);
    const slug = link.split("/").pop() ?? "";
    // The slug becomes a filesystem path segment in the cloned repo —
    // restrict it so a hostile/malformed feed link can't traverse outside
    // articles/.
    if (!title || !link || !/^[\w-]+$/.test(slug) || Number.isNaN(timestamp)) {
      console.warn(`[sync] zenn: skipping item with missing/invalid fields (${title || link || "?"})`);
      return [];
    }
    // The first commit lands seconds before Zenn's deploy, so a never-edited
    // article would get updatedAt < publishedAt — only emit it when the file
    // was actually committed to again after publication.
    const committedAt = repoUpdatedAt(repoDir, slug);
    const updatedAt = committedAt !== undefined && Date.parse(committedAt) > timestamp ? committedAt : undefined;
    return [
      {
        title,
        tags: topicsFor(repoDir, slug),
        publishedAt: new Date(timestamp).toISOString(),
        updatedAt,
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
} finally {
  rmSync(repoDir, { recursive: true, force: true });
}
