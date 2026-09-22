import matter from "gray-matter";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";
import { z } from "zod";
import { renderMermaid } from "./mermaid";

const frontmatter = z.object({
  title: z.string(),
  description: z.string().default(""),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date | null;
  tags: string[];
  html: string;
}

const files = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

marked.use(markedKatex({ throwOnError: false }));

marked.use(
  markedShiki({
    highlight: (code, lang) =>
      codeToHtml(code, {
        lang: lang || "text",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        cssVariablePrefix: "--shiki-",
      }),
  }),
);

const escapeHtml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const mermaidBlock = /```mermaid\s*\n([\s\S]*?)```/g;

async function toHtml(content: string): Promise<string> {
  let out = content;
  for (const match of content.matchAll(mermaidBlock)) {
    const rendered = await renderMermaid(match[1]);
    const replacement = rendered
      ? `<div class="mermaid-diagram mermaid-light">${rendered.light}</div><div class="mermaid-diagram mermaid-dark">${rendered.dark}</div>`
      : `<pre><code>${escapeHtml(match[1])}</code></pre>`;
    out = out.replace(match[0], replacement);
  }
  return marked.parse(out, { async: true });
}

let cache: Promise<Post[]> | null = null;

export function getPosts(): Promise<Post[]> {
  return (cache ??= buildPosts());
}

async function buildPosts(): Promise<Post[]> {
  const posts = await Promise.all(
    Object.entries(files).flatMap(([path, raw]) => {
      const { data, content } = matter(raw as string);
      const parsed = frontmatter.safeParse(data);
      if (!parsed.success) {
        console.warn(`[posts] skipping ${path}:`, parsed.error.issues);
        return [];
      }
      const fm = parsed.data;
      if (fm.draft) return [];
      return [
        toHtml(content).then((html) => ({
          slug: path.split("/").pop()?.replace(/\.md$/, "") ?? "",
          title: fm.title,
          description: fm.description,
          publishedAt: fm.publishedAt,
          updatedAt: fm.updatedAt ?? null,
          tags: fm.tags,
          html,
        })),
      ];
    }),
  );
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
