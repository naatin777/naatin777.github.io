import { z } from "zod";
import type { ArticleSource } from "$lib/config/article-source";
import generatedPosts from "../../../content/generated/external-posts.json";

// Shape of content/generated/external-posts.json — produced by
// `pnpm sync:external-posts` (scripts/sync-external-posts.ts).
// The build reads only this file; it never hits the network.
const externalPost = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  url: z.string(),
  source: z.enum(["zenn", "qiita"]),
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
// rather than silently rendering broken cards.
const posts: ArticleItem[] = z
  .array(externalPost)
  .parse(generatedPosts)
  .map((post) => Object.assign(post, { series: null }));

export function getExternalArticles(): ArticleItem[] {
  return posts;
}
