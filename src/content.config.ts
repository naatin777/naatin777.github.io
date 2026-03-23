import { feedLoader } from "@ascorbic/feed-loader";
import { defineCollection } from "astro:content";
import { author } from "@config/author";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const qiita = defineCollection({
  loader: feedLoader({
    url: `http://qiita.com/${author.name}/feed`,
  }),
});

const zenn = defineCollection({
  loader: feedLoader({
    url: `http://zenn.dev/${author.name}/feed`,
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "[0-9][0-9][0-9][0-9]/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const tags = defineCollection({
  loader: glob({ pattern: "*.{yml,yaml}", base: "./src/data/tags" }),
  schema: z.object({
    source: z.enum(["qiita", "zenn"]),
    entries: z.array(
      z.object({
        url: z.url(),
        tags: z.array(z.string()),
      }),
    ),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.{yml,yaml}", base: "./src/data/projects" }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    iconPath: z.string().optional(),
    sourceUrl: z.url().optional(),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.url(),
      }),
    ),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  qiita,
  zenn,
  blog,
  tags,
  projects,
};
