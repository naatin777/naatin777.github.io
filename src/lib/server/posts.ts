import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import markedKatex from "marked-katex-extension";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";
import { z } from "zod";
import { renderMermaid } from "./mermaid";

const postFrontmatter = z.object({
  title: z.string(),
  description: z.string().default(""),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date | null;
  tags: string[];
  html: string;
  toc: TocItem[];
  readingTime: number;
}

const postFiles = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const md = new Marked();

md.use(gfmHeadingId());
md.use(markedKatex({ throwOnError: false }));

md.use(
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

md.use({
  async walkTokens(token) {
    if (token.type !== "code" || token.lang !== "mermaid") return;
    const rendered = await renderMermaid(token.text);
    if (!rendered) return; // stays a code block — rendered by shiki as a fallback
    const html = token as unknown as Tokens.HTML;
    html.type = "html";
    html.pre = false;
    html.text = `<div class="mermaid-diagram mermaid-light">${rendered.light}</div><div class="mermaid-diagram mermaid-dark">${rendered.dark}</div>`;
  },
});

const escapeAttr = (text: string): string => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

md.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      const external = /^https?:\/\//.test(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
      return `<a href="${escapeAttr(href)}"${titleAttr}${external}>${text}</a>`;
    },
  },
});

async function renderMarkdown(content: string): Promise<{ html: string; toc: TocItem[] }> {
  const html = await md.parse(content, { async: true });
  const toc = getHeadingList().map(({ id, raw, level }) => ({ id, text: raw, depth: level }));
  return { html, toc };
}

function estimateReadingTime(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, " ")
    .replace(/[#*_`>|[\]()-]/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  const chars = plain.replace(/\s/g, "").length;
  const minutes = Math.max(words / 400, chars / 800);
  return Math.max(1, Math.ceil(minutes));
}

let cache: Promise<Post[]> | null = null;

export function getPosts(): Promise<Post[]> {
  return (cache ??= loadPosts());
}

async function loadPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  // Sequential: getHeadingList() is shared state reset by each parse,
  // so concurrent parses could attribute headings to the wrong post.
  for (const [path, raw] of Object.entries(postFiles)) {
    const { data, content } = matter(raw as string);
    const parsed = postFrontmatter.safeParse(data);
    if (!parsed.success) {
      console.warn(`[posts] skipping ${path}:`, parsed.error.issues);
      continue;
    }
    const fm = parsed.data;
    if (fm.draft) continue;
    const { html, toc } = await renderMarkdown(content);
    posts.push({
      slug: path.split("/").pop()?.replace(/\.md$/, "") ?? "",
      title: fm.title,
      description: fm.description,
      publishedAt: fm.publishedAt,
      updatedAt: fm.updatedAt ?? null,
      tags: fm.tags,
      html,
      toc,
      readingTime: estimateReadingTime(content),
    });
  }
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
