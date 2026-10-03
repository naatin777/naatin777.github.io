import { readFileSync } from "node:fs";
import { z } from "zod";
import { externalSources } from "#lib/config/article-source.js";
import type { ArticleItem } from "#lib/types.js";

// Shape of content/generated/<source>.json — produced by `pnpm sync:zenn` /
// `pnpm sync:qiita` (scripts/sync-*-posts.ts). The build reads only these
// committed files; it never hits the network. The source list comes from
// config so a new source can't be silently skipped here.

// Only web URLs are linkable from article cards — anything else (javascript:,
// data:, hand-edited junk) fails the build here rather than shipping.
const externalUrl = z.url({ protocol: /^https?$/ });

const externalPostSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
  url: externalUrl,
  source: z.enum(externalSources),
});

// Shared with scripts/sync-*-posts.ts — they write the shape this validates.
// Imported type-only there, so the #lib alias never needs runtime resolution.
export type ExternalPost = z.infer<typeof externalPostSchema>;

// Validate at build time — a hand-edited or truncated JSON fails loudly here
// rather than silently rendering broken cards.
const articles: ArticleItem[] = externalSources
  .flatMap((source) =>
    // A hand-edited file could smuggle a foreign `source` label — pin it.
    z
      .array(externalPostSchema.extend({ source: z.literal(source) }))
      .parse(JSON.parse(readFileSync(`content/generated/${source}.json`, "utf8"))),
  )
  .map((post) => Object.assign(post, { series: null, updatedAt: post.updatedAt ?? post.publishedAt }));

export function getExternalArticles(): ArticleItem[] {
  return articles;
}
