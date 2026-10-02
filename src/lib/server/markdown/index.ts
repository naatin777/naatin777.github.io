// The post markdown pipeline. Author markup — including embedded raw HTML
// parsed by rehype-raw — crosses the rehypeSanitize trust boundary; every
// plugin below it only injects generated markup (KaTeX/Shiki/Mermaid
// SVG/heading anchors) on top of the sanitized tree.
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import rehypeShiki from "@shikijs/rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { TocItem } from "#lib/types.js";
import { consoleLines, lineAnchorIds, rehypeCodeBlocks } from "./code-blocks";
import { remarkDetails } from "./details";
import { rehypeFlattenRoots } from "./flatten-roots";
import { rehypeUniqueHeadingIds, rehypeCollectToc, rehypeHeadingAnchors } from "./headings";
import { rehypeResolveImages, type ResolveImage } from "./images";
import { rehypeLazyImages } from "./lazy-images";
import { rehypeLinkcards } from "./linkcards";
import { rehypeMermaid } from "./mermaid";
import { sanitizeSchema } from "./schema";
import { rehypeWrapTables } from "./tables";
import { rehypeTaskLabels } from "./task-labels";

const createProcessor = (resolveImage: ResolveImage) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkAlert)
    .use(remarkDirective)
    .use(remarkDetails)
    .use(remarkRehype, { allowDangerousHtml: true })
    // Trust boundary: author markup (including embedded raw HTML parsed by
    // rehype-raw) is sanitized here; everything below only adds generated
    // markup on top of the sanitized tree.
    .use(rehypeRaw)
    .use(rehypeResolveImages(resolveImage))
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
    .use(rehypeMermaid)
    .use(rehypeCodeBlocks)
    .use(rehypeShiki, {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
      defaultColor: "light-dark()",
      cssVariablePrefix: "--shiki-",
      transformers: [
        transformerNotationHighlight(),
        transformerNotationDiff(),
        transformerNotationFocus(),
        // {3-6} meta for fenced blocks — works on any language, unlike the
        // notation transformers which need comment syntax (none in `text`
        // log output). lineAnchorIds adds per-line ids when the fence
        // carries #name (see rehypeCodeBlocks); consoleLines dims output
        // rows in ```console blocks.
        transformerMetaHighlight(),
        lineAnchorIds(),
        consoleLines(),
      ],
    })
    .use(rehypeLinkcards)
    .use(rehypeFlattenRoots)
    .use(rehypeSlug)
    .use(rehypeUniqueHeadingIds)
    .use(rehypeCollectToc)
    .use(rehypeHeadingAnchors)
    .use(rehypeTaskLabels)
    .use(rehypeKatex)
    .use(rehypeLazyImages)
    .use(rehypeWrapTables)
    .use(rehypeStringify);

export async function renderMarkdown(
  content: string,
  options: { resolveImage?: ResolveImage } = {},
): Promise<{ html: string; toc: TocItem[] }> {
  const file = await createProcessor(options.resolveImage ?? ((src) => src)).process(content);
  return {
    html: String(file),
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- written by rehypeCollectToc in this pipeline
    toc: (file.data.toc as TocItem[] | undefined) ?? [],
  };
}
