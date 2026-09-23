# AGENTS.md

Personal portfolio site (`naatin777.dev`). SvelteKit + Svelte 5, fully prerendered static site deployed to GitHub Pages. Japanese-first UI with English support.

## Boundaries

**Ask first:** state the intended direction briefly before editing files, unless the user explicitly asks to proceed.

**Never:**

- Bypass `rehype-sanitize` for author-derived markup — generated content only. The schema in `posts.ts` is the single trust boundary.
- Parallelize mermaid `renderer()` calls (fails under prerender — the queue in `mermaid.ts` exists for this).
- Edit files inside `content/zenn/` or `content/qiita/` — they are git subtrees.
- Commit generated output (`build/`, `.svelte-kit/`) or secrets.

## Stack

- SvelteKit 2 + Svelte 5 runes, `@sveltejs/adapter-static` (`prerender`, `trailingSlash: "always"`, `fallback: "404.html"`)
- Tailwind CSS v4 (`@tailwindcss/vite`) — all global styles and theme tokens in `src/app.css`; dark mode via `data-theme` attribute + `@custom-variant dark`
- pnpm 10, Node 22 (match CI); oxlint + oxfmt — no ESLint/Prettier

## Commands

- `pnpm install --frozen-lockfile`
- `pnpm run check` — svelte-check; passing means 0 errors AND 0 warnings
- `pnpm run lint` / `pnpm format` / `pnpm run format:check` — oxlint / oxfmt
- `pnpm run test` — vitest unit tests (`src/**/*.test.ts`)
- `pnpm build` → `vite build` + pagefind index + per-post OG image generation (`scripts/generate-og.mjs`, needs playwright chromium)
- `pnpm preview` — for UI checks always preview the built output, never `pnpm dev`. Kill old preview processes before re-testing — sirv caches asset stats and serves stale bytes otherwise. `vite preview` only serves manifest-registered files, so pagefind/OG assets 404 there — use a plain static server (e.g. `python3 -m http.server -d build`) to verify search or OG images.
- `pnpm exec playwright install chromium` — required once locally for mermaid rendering (CI does this per build)
- Update content subtrees: `git subtree pull --prefix=content/zenn https://github.com/naatin777/zenn-articles main --squash` (same pattern for qiita)

## Conventions

- Imports via `$lib/...` aliases; `$app/state` (not `$app/stores`); Svelte 5 runes only
- PascalCase components, kebab-case files; server-only modules in `src/lib/server/`
- Tailwind utilities in markup; scoped `<style>` blocks only when utilities don't fit
- Reduced motion is handled globally in `src/app.css` — do not add per-component overrides
- Name things by what they hold: `external-articles.ts` (Zenn/Qiita), `toNavItem`, `renderBothThemes`, `toTimestamp` — avoid vague names like `time`/`pick`/`data2`
- Prefer maintainable, data-driven structures over ad-hoc workarounds; when a value must live in two places, add it to the sync-point table below and mark it with a comment

## Content

- `content/posts/*.md` → local pages at `/posts/[slug]/`. Frontmatter: `title`, `description`, `publishedAt`, `updatedAt`, `tags`, `draft`. Invalid frontmatter is skipped with a warning, never fails the build.
- `content/zenn/` + `content/qiita/` — git subtrees; frontmatter only, rendered as external links on `/articles/`. Zenn dates come from the API (paginated via `next_page`, falls back to frontmatter).
- A meta CSP lives in `src/app.html` (GitHub Pages cannot set headers) — when adding external resources (images, fonts, scripts, connections), update the policy or they will be blocked.
- Markdown pipeline in `posts.ts` is unified-based: `remark-parse` → `remark-gfm` → `remark-math` → html-to-text + `remarkAlert` → `remark-rehype` → **`rehype-sanitize` (trust boundary — author markup ends here)** → `rehype-slug` → toc/heading anchors → `rehype-external-links` → `rehypeMermaid` → `@shikijs/rehype` → `rehype-katex` → lazy images → `rehype-stringify`. Keep generated-content plugins AFTER sanitize. Posts may use `> [!NOTE]` alerts, `[^n]` footnotes, and shiki `// [!code highlight]`/`[!code ++]` notation.
- ` ```mermaid ` blocks: `rehypeMermaid` replaces `pre>code.language-mermaid` with light+dark SVG hast nodes (CSS toggles by `data-theme`). Failed renders stay as shiki-highlighted code blocks — no separate fallback path. Playwright must stay in `ssr.external` in `vite.config.ts`.
- Shiki uses `defaultColor: "light-dark()"` — theme switching relies on `color-scheme` (`:root` light / `[data-theme="dark"]` dark in `app.css`). Do not remove those rules or re-add manual `.shiki` overrides.
- `typescript` is pinned to `^6` — svelte-check does not support TS 7 (native port) yet; do not upgrade it when bumping deps.
- TOC comes from `rehypeCollectToc` (hast traversal after `rehype-slug`), stored on `file.data.toc` — do not re-implement slugify. `sr-only` headings (footnote label) are excluded from toc/anchors.
- `content/` is excluded from lint/format.

## i18n

- `src/lib/config/i18n.ts` `langs` array is the single source of truth; default is `ja`.
- `<LangText texts={{ ja: "…", en: "…" }} />` renders one span per language; CSS `:lang()` shows the match (flash-free, works without JS).
- Resolution order: `?lang=` (incoming links only) → `localStorage` → `ja`, applied by the inline script in `app.html`. `LangToggle` writes `localStorage` + `<html lang>` only — it intentionally does not touch the URL.
- Adding a language touches THREE places: `langs`/`langNames` in `i18n.ts`, a `:root:lang(xx) .lang-xx` rule in `app.css`, and the hardcoded `en|ja` whitelist in the `app.html` inline script (marked with a sync comment).

## SEO

- Per-page `<Seo>` component — never put `<svelte:head>` in `+layout.svelte` (duplicate `<title>`/description).
- `sitemap.xml` and `feed.xml` are prerendered `+server.ts` endpoints; `robots.txt`, `.nojekyll`, `CNAME`, `og-image.png`, `favicon.ico`, `apple-touch-icon.png` live in `static/`.
- `/og/[slug]/` pages are OG-image templates (screenshotted by `scripts/generate-og.mjs` into `build/og/<slug>.png`) — noindexed, robots-disallowed, and excluded from search results. Not user-facing.
- Site search on `/articles/` uses pagefind (index built post-build; UI hidden when the index is absent).
- `server/articles.ts` `getAllArticles()` merges blog posts + external articles (shared by `/` and `/articles/` loads). `server/external-articles.ts` stays external-only — don't make it import `posts.ts`.
- Controls whose SSR state can be wrong (lang, theme) hide until hydration via `hydrated()` from `src/lib/hydrated.svelte.ts` — reuse it, don't re-implement.
- Dates are shared via `src/lib/date.ts` `formatDate` (bare `YYYY-MM-DD` strings are treated as local dates, not UTC).
- Blog posts can set `series: <name>` in frontmatter — posts sharing a name get an ordered series navigation box on the post page and a series chip on article cards.

## Sync points

These values are duplicated by necessity — update them together:

| Change                | Also update                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a language        | `config/i18n.ts` + `app.css` lang rule + `app.html` whitelist                                                                                                        |
| Theme colors          | `app.css` tokens + `THEME_COLOR` in `theme.svelte.ts` + `app.html` inline script                                                                                     |
| Add a static route    | `navItems` in `config/nav.ts` — header nav and sitemap both derive from it                                                                                           |
| Add an article source | `src/lib/source.ts` (`ArticleSource` union + `sourceOrder`/`sourceLabels`/`sourceStyles`) — badges, `/articles/` filter, and `ArticleItem.source` all derive from it |

## Validation

After functional changes run all of: `pnpm run check`, `pnpm run lint`, `pnpm run format`, `pnpm run test`, `pnpm build`. For UI verification use `pnpm preview` + agent-browser — inspect the accessibility tree, not just screenshots.

## Deploy

Push to `main` → GitHub Actions: install → playwright chromium → check/lint/format/test gate → build → Lighthouse audit → publish `build/` via peaceiris/actions-gh-pages. Weekly cron rebuild refreshes Zenn API dates; a separate weekly job runs lychee link checks. Action `uses:` are pinned to commit SHAs — Dependabot (`github-actions` + `npm` ecosystems) keeps them updated.
