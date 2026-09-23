import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import markedAlert from "marked-alert";
import markedFootnote from "marked-footnote";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import markedKatex from "marked-katex-extension";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";
import { z } from "zod";
import type { TocItem } from "$lib/types";
import { renderMermaid } from "./mermaid";

const postFrontmatter = z.object({
  title: z.string(),
  description: z.string().default(""),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  draft: z.boolean().default(false),
});

export type { TocItem };

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date | null;
  tags: string[];
  series: string | null;
  html: string;
  toc: TocItem[];
  readingTime: number;
}

const postFiles = import.meta.glob<string>("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const md = new Marked();

md.use(gfmHeadingId());
md.use(markedKatex({ throwOnError: false }));
md.use(markedAlert());
md.use(markedFootnote());

md.use(
  markedShiki({
    highlight: (code, lang) =>
      codeToHtml(code, {
        lang: lang || "text",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: "light-dark()",
        cssVariablePrefix: "--shiki-",
        transformers: [transformerNotationHighlight(), transformerNotationDiff()],
      }),
  }),
);

md.use({
  async walkTokens(token) {
    if (token.type !== "code" || token.lang !== "mermaid") return;
    const rendered = await renderMermaid(token.text);
    if (!rendered) return; // stays a code block — rendered by shiki as a fallback
    const html: Pick<Tokens.HTML, "type" | "pre" | "text"> & { generated: true } = {
      type: "html",
      pre: false,
      text: `<div class="mermaid-diagram mermaid-light">${rendered.light}</div><div class="mermaid-diagram mermaid-dark">${rendered.dark}</div>`,
      generated: true,
    };
    Object.assign(token, html);
  },
});

const escapeAttr = (text: string): string => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeHtml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Heading innerHTML is entity-escaped; decode before re-escaping for the
// aria-label so screen readers get the plain heading text.
const decodeEntities = (text: string): string =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// marked's default link renderer runs cleanUrl() to reject javascript:/data:
// hrefs; our custom renderer must do the same. Control chars and HTML
// entities are stripped/decoded first so `&#x6A;avascript:` can't sneak by.
const isSafeHref = (href: string): boolean => {
  const normalized = href
    // oxlint-disable-next-line no-control-regex -- intentionally strips control chars before scheme check
    .replace(/[\x00-\x20]+/g, "")
    .replace(/&#(\d+);?/g, (_m, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);?/gi, (_m, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&(colon|tab|newline);/gi, "");
  const protocol = /^([a-z][a-z0-9+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();
  return protocol === undefined || ["http", "https", "mailto"].includes(protocol);
};

md.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!isSafeHref(href)) return text;
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      const external = /^https?:\/\//.test(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
      return `<a href="${escapeAttr(href)}"${titleAttr}${external}>${text}</a>`;
    },
    // marked does not run cleanUrl on image src — apply the same scheme
    // allowlist as links so javascript:/data: sources can't be emitted.
    image({ href, title, text }) {
      if (!isSafeHref(href)) return text;
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy">`;
    },
    // Escape raw HTML written in markdown source (Hugo-style default:
    // generated markup like mermaid SVG is marked `generated` and passes).
    html(token: Tokens.HTML | Tokens.Tag) {
      return (token as { generated?: true }).generated ? token.text : escapeHtml(token.text);
    },
  },
});

// Injects # permalink anchors into rendered headings (h2+ already have ids
// from marked-gfm-heading-id). Runs as a postprocess hook per marked's idiom.
md.use({
  hooks: {
    postprocess(html) {
      return html.replace(/<h([2-6]) id="([^"]+)">([\s\S]*?)<\/h\1>/g, (_match, depth, id, inner) => {
        const label = escapeAttr(decodeEntities(inner.replace(/<[^>]*>/g, "")));
        return `<h${depth} id="${id}">${inner}<a class="heading-anchor" href="#${id}" aria-label="${label} へのリンク">#</a></h${depth}>`;
      });
    },
  },
});

export async function renderMarkdown(content: string): Promise<{ html: string; toc: TocItem[] }> {
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
  /* oxlint-disable no-await-in-loop */
  for (const [path, raw] of Object.entries(postFiles)) {
    const { data, content } = matter(raw);
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
      series: fm.series ?? null,
      html,
      toc,
      readingTime: estimateReadingTime(content),
    });
  }
  /* oxlint-enable no-await-in-loop */
  return posts.toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
