# AGENTS.md

Personal portfolio site (`naatin777.dev`). SvelteKit + Svelte 5, fully prerendered static site deployed to GitHub Pages. Japanese-first UI with English support.

## Boundaries

**Ask first:** state the intended direction briefly before editing files, unless the user explicitly asks to proceed.

**Never:**

- Use raw `history.replaceState` — it destroys SvelteKit history state. Use `replaceState` from `$app/navigation` with `page.state`.
- Mutate the global `marked` — use the dedicated `Marked` instance in `posts.ts`.
- Parallelize `loadPosts` (shared `getHeadingList` state) or mermaid `renderer()` calls (fails under prerender — the queue in `mermaid.ts` exists for this).
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
- `pnpm build` → `build/`; `pnpm preview` — for UI checks always preview the built output, never `pnpm dev`
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
- Markdown pipeline in `posts.ts`: `marked` + `marked-katex-extension` + `marked-shiki` + `marked-gfm-heading-id`, all at build time.
- ` ```mermaid ` blocks: a `walkTokens` hook converts them to `html` tokens containing light+dark SVGs (CSS toggles by `data-theme`). Failed renders stay as shiki-highlighted code blocks — no separate fallback path. Playwright must stay in `ssr.external` in `vite.config.ts`.
- TOC data comes from `getHeadingList()` right after `md.parse` — do not re-implement slugify.
- `content/` is excluded from lint/format.

## i18n

- `src/lib/config/i18n.ts` `langs` array is the single source of truth; default is `ja`.
- `<LangText texts={{ ja: "…", en: "…" }} />` renders one span per language; CSS `:lang()` shows the match (flash-free, works without JS).
- Resolution order: `?lang=` → `localStorage` → `ja`, applied by the inline script in `app.html`. `LangSelect` keeps URL/localStorage/`<html lang>` in sync.
- Adding a language touches THREE places: `langs`/`langNames` in `i18n.ts`, a `:root:lang(xx) .lang-xx` rule in `app.css`, and the hardcoded `en|ja` whitelist in the `app.html` inline script (marked with a sync comment).

## SEO

- Per-page `<Seo>` component — never put `<svelte:head>` in `+layout.svelte` (duplicate `<title>`/description).
- `sitemap.xml` and `feed.xml` are prerendered `+server.ts` endpoints; `robots.txt`, `.nojekyll`, `CNAME`, `og-image.png`, `favicon.ico`, `apple-touch-icon.png` live in `static/`.
- Dates are shared via `src/lib/date.ts` `formatDate` (bare `YYYY-MM-DD` strings are treated as local dates, not UTC).

## Sync points

These values are duplicated by necessity — update them together:

| Change | Also update |
| --- | --- |
| Add a language | `config/i18n.ts` + `app.css` lang rule + `app.html` whitelist |
| Theme colors | `app.css` tokens + `THEME_COLOR` in `theme.svelte.ts` + `app.html` inline script |
| Add a static route | `staticPages` in `sitemap.xml/+server.ts` |
| Add an article source | `ArticleItem.source` union + `sourceLabels` in `ArticleCard.svelte` |

## Validation

After functional changes run all of: `pnpm run check`, `pnpm run lint`, `pnpm run format`, `pnpm build`. For UI verification use `pnpm preview` + agent-browser — inspect the accessibility tree, not just screenshots.

## Deploy

Push to `main` → GitHub Actions: install → playwright chromium → check/lint/format gate → build → publish `build/` via peaceiris/actions-gh-pages. Weekly cron rebuild refreshes Zenn API dates.
