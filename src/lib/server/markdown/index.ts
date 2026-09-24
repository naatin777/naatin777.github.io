// The post markdown pipeline. Author markup — including embedded raw HTML
// parsed by rehype-raw — crosses the rehypeSanitize trust boundary; every
// plugin below it only injects generated markup (KaTeX/Shiki/Mermaid
// SVG/heading anchors) on top of the sanitized tree.
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import rehypeShiki from "@shikijs/rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { TocItem } from "$lib/types";
import { rehypeCodeBlocks } from "./code-blocks";
import { rehypeFlattenRoots } from "./flatten-roots";
import { rehypeAvoidPageIds, rehypeCollectToc, rehypeHeadingAnchors } from "./headings";
import { rehypeResolveImages } from "./images";
import { rehypeLazyImages } from "./lazy-images";
import { rehypeMermaid } from "./mermaid";
import { sanitizeSchema } from "./schema";

const createProcessor = (resolveImage: (src: string) => string) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkAlert)
    .use(remarkRehype, { allowDangerousHtml: true })
    // Trust boundary: author markup (including embedded raw HTML parsed by
    // rehype-raw) is sanitized here; everything below only adds generated
    // markup on top of the sanitized tree.
    .use(rehypeRaw)
    .use(rehypeResolveImages(resolveImage))
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAvoidPageIds)
    .use(rehypeCollectToc)
    .use(rehypeHeadingAnchors)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
    .use(rehypeMermaid)
    .use(rehypeCodeBlocks)
    .use(rehypeShiki, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light-dark()",
      cssVariablePrefix: "--shiki-",
      transformers: [transformerNotationHighlight(), transformerNotationDiff()],
    })
    .use(rehypeFlattenRoots)
    .use(rehypeKatex)
    .use(rehypeLazyImages)
    .use(rehypeStringify);

export async function renderMarkdown(
  content: string,
  options: { resolveImage?: (src: string) => string } = {},
): Promise<{ html: string; toc: TocItem[] }> {
  const file = await createProcessor(options.resolveImage ?? ((src) => src)).process(content);
  return {
    html: String(file),
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- written by rehypeCollectToc in this pipeline
    toc: (file.data.toc as TocItem[] | undefined) ?? [],
  };
}
