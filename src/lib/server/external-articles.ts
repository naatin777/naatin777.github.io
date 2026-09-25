import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import { externalSources, type ArticleSource } from "$lib/config/article-source";

// Shape of content/generated/<source>.json — produced by `pnpm sync:zenn` /
// `pnpm sync:qiita` (scripts/sync-*-posts.ts). The build reads only these
// committed files; it never hits the network. The source list comes from
// config so a new source can't be silently skipped here.

// Only web URLs are linkable from article cards — anything else (javascript:,
// data:, hand-edited junk) fails the build here rather than shipping.
const externalUrl = z.string().refine(
  (value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  },
  { message: "url must be an absolute http(s) URL" },
);

const externalPost = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
  url: externalUrl,
  source: z.enum(externalSources),
});

// Shared with scripts/sync-*-posts.ts — they write the shape this validates.
// Imported type-only there, so the $lib alias never needs runtime resolution.
export type ExternalPost = z.infer<typeof externalPost>;

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
const posts: ArticleItem[] = externalSources
  .flatMap((source) => {
    const file = `content/generated/${source}.json`;
    if (!existsSync(file)) {
      console.warn(`[articles] ${file} not found — run \`pnpm sync:${source}\` to populate it`);
      return [];
    }
    // A hand-edited file could smuggle a foreign `source` label — pin it.
    return z.array(externalPost.extend({ source: z.literal(source) })).parse(JSON.parse(readFileSync(file, "utf8")));
  })
  .map((post) => Object.assign(post, { series: null }));

export function getExternalArticles(): ArticleItem[] {
  return posts;
}
