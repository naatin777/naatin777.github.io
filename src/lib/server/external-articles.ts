import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import type { ArticleSource } from "$lib/config/article-source";

// Shape of content/generated/<source>.json — produced by `pnpm sync:zenn` /
// `pnpm sync:qiita` (scripts/sync-*-posts.ts). The build reads only these
// committed files; it never hits the network.
const SOURCES = ["zenn", "qiita"] as const;

const externalPost = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
  url: z.string(),
  source: z.enum(SOURCES),
});

export interface ArticleItem {
  title: string;
  url: string;
  tags: string[];
  source: ArticleSource;
  series: string | null;
  publishedAt: string;
  updatedAt?: string | undefined;
}

// Validate at build time — a hand-edited or truncated JSON fails loudly here
// rather than silently rendering broken cards. A missing file just means that
// source has never been synced.
const posts: ArticleItem[] = SOURCES.flatMap((source) => {
  const file = `content/generated/${source}.json`;
  if (!existsSync(file)) {
    console.warn(`[articles] ${file} not found — run \`pnpm sync:${source}\` to populate it`);
    return [];
  }
  return z.array(externalPost).parse(JSON.parse(readFileSync(file, "utf8")));
})
  .map((post) => Object.assign(post, { series: null }))
  .toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function getExternalArticles(): ArticleItem[] {
  return posts;
}
