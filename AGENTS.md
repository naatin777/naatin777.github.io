# AGENTS.md

Instructions for coding agents working in this repository.

## Scope

- Apply these rules across the repository rooted at this directory.
- Newer conversation rules have higher priority than older wording.
- Update this file when the user adds new rules in conversation.

## Conversation Overrides (Latest)

- For UI checks, do not use `pnpm dev` if it is unreliable. Use `pnpm build` and `pnpm preview`, or reuse an existing preview server.
- Before making file edits, first state the intended implementation direction briefly and wait for explicit user confirmation such as `Yes`. Do not start editing immediately after a new request unless the user explicitly asks to proceed without confirmation.
- The visual design is being redesigned from scratch; do not port old styling decisions without asking.
- Reduced motion handling should be global, not per-component.

## Project Snapshot

- SvelteKit (Svelte 5) + `@sveltejs/adapter-static`, fully prerendered static site.
- Deployed to GitHub Pages from the `build/` directory.
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`). Theme tokens live in `src/app.css` via `@theme` + CSS custom properties; dark mode uses `data-theme` attribute with `@custom-variant dark`.
- Lint/format: `oxlint` + `oxfmt` (no ESLint/Prettier).
- Content: Markdown files under `content/` — see "Content" below.

## Setup

1. Enable Corepack as needed: `corepack enable`
2. Install dependencies with lockfile: `pnpm install --frozen-lockfile`

## Common Commands

- Start dev server: `pnpm dev`
- Build production output: `pnpm build` (outputs to `build/`)
- Preview build output: `pnpm preview`
- Type/template check: `pnpm run check`
- Lint: `pnpm run lint`
- Format: `pnpm format` (oxfmt, includes `.svelte` via svelte compiler and Tailwind class sorting)

## Content

- `content/zenn/` — git subtree of `naatin777/zenn-articles`. Articles live in `articles/*.md`; only frontmatter (`title`, `topics`, `published`, optional `published_at`) is read. Rendered as external links, never as local pages.
- `content/qiita/` — git subtree of `naatin777/qiita-articles`. Articles live in `public/*.md`; only frontmatter (`title`, `tags`, `id`, `private`, dates) is read. URL is built from `id`.
- `content/posts/` — site-native articles, rendered as local pages at `/posts/[slug]/`. Frontmatter: `title`, `description`, `publishedAt`, `updatedAt`, `tags`, `draft`.
- Update subtrees with `git subtree pull --prefix=content/zenn https://github.com/naatin777/zenn-articles main --squash` (same for qiita).
- `content/` is excluded from lint/format — do not edit subtree files in this repo.
- Tag handling: tags come from frontmatter only; no manual mapping files. Filter matching is case-insensitive.

## Editing Workflow

- Keep each change minimal and focused on the user request.
- Source lives in `src/`; static assets in `static/`; imported assets in `src/lib/assets/`.
- Use Svelte 5 runes (`$state`, `$derived`, `$props`, `$bindable`). Do not use legacy Svelte syntax or React.
- Use `$lib/...` aliases, not relative paths, for imports outside a route directory.
- Use `$app/state` (not `$app/stores`) for page state.
- Use kebab-case for file names, PascalCase for Svelte components.

## Styling Rules

- Global styles and theme tokens: `src/app.css` only.
- Component styles: Tailwind utilities in markup. Reach for scoped `<style>` blocks only when utilities don't fit.
- Dark mode: write `dark:` variants; the attribute is `data-theme` on `<html>`.
- Theme flash prevention lives in the inline script in `src/app.html`; keep it in sync with `src/lib/theme.svelte.ts` (`THEME_COLOR` values must match `@theme` tokens in `src/app.css`).
- Reduced motion is handled globally in `src/app.css`; do not add per-component overrides.

## i18n

- Languages are defined once in `src/lib/i18n.ts` (`langs` array). Default is `ja`.
- Translated strings use `<LangText texts={{ ja: "…", en: "…" }} />`, which renders one `span` per language; CSS `:lang()` shows the matching one. This makes language switching flash-free and JS-optional.
- Language selection: `?lang=` query param → `localStorage` → `ja`, resolved by the inline script in `src/app.html`. `LangSelect` keeps URL param, localStorage, and `<html lang>` in sync via `$app/navigation`'s `replaceState` (never raw `history.replaceState` — it destroys SvelteKit history state).
- Adding a language: extend `langs`/`langNames` in `i18n.ts` and add a `.lang-xx:lang(xx)` rule in `app.css`. Incomplete `texts` then fail typecheck.
- Article content itself is not translated; UI chrome only.

## SEO / Metadata

- Use `<Seo title="…" description="…" />` per page (never `<svelte:head>` in `+layout.svelte` — duplicate `<title>`/description would result).
- `404.html` is generated via `adapter({ fallback: "404.html" })` for GitHub Pages.
- `sitemap.xml` and `feed.xml` (RSS 2.0) are prerendered `+server.ts` endpoints listing static pages + local posts; `static/robots.txt` references the sitemap and `app.html` links the feed.
- `static/.nojekyll` exists (peaceiris/actions-gh-pages also auto-adds it, but keep it for robustness).
- `<Seo>` supports `type="article"` (emits `article:*` meta), `jsonLd`, and defaults to `og-image.png` (1200×630) with `summary_large_image` Twitter cards.
- Posts get heading ids via `marked-gfm-heading-id`; `getHeadingList()` (called right after `marked.parse`) provides TOC data — do not re-implement slugify. External links get `target="_blank" rel="noopener noreferrer"` via a marked renderer.
- `+layout.svelte` registers the skip link, view transitions (skipped under `prefers-reduced-motion`), and font preloads. Scroll-reveal uses CSS `animation-timeline: view()` behind `@supports` + `no-preference`.

## Data Layer

- Server-only modules go in `src/lib/server/` (`articles.ts`, `posts.ts`, `mermaid.ts`). They use `import.meta.glob` + `gray-matter` + `zod` and run at prerender time.
- Markdown → HTML via `marked` (plain Markdown; no embedded components).
- Math is rendered at build time by `marked-katex-extension` (KaTeX CSS is imported in `posts/[slug]/+page.svelte`).
- Code blocks are highlighted at build time by `marked-shiki` + `shiki` (github-light/github-dark via `--shiki-*` CSS variables toggled by `[data-theme]` in `app.css`).
- ` ```mermaid ` blocks are rendered to SVG at build time via `mermaid-isomorphic` + Playwright Chromium. Both `default` and `dark` theme SVGs are emitted and toggled by CSS (`[data-theme]`). Playwright must NOT be bundled — `ssr.external` in `vite.config.ts` keeps it node-resolved. Render calls must be sequential; concurrent `renderer()` calls fail during prerender.
- CI installs the browser with `pnpm exec playwright install --with-deps chromium`; locally run `pnpm exec playwright install chromium` once.

## Validation

- Run `pnpm build` after functional changes.
- Run `pnpm run check` when changing TypeScript, routes, or content loading. Passing means 0 errors and 0 warnings.
- Run `pnpm run lint` and `pnpm format` before considering work done.
- Use Playwright/browser preview against `pnpm preview` for UI checks.

## CI / Deploy Notes

- GitHub Actions installs with `pnpm install --frozen-lockfile` on Node 22.
- Deployment publishes the `build/` directory (`publish_dir: build` in `deploy.yml`).
- `static/CNAME` carries the custom domain.
- A weekly scheduled rebuild (`cron`) refreshes Zenn article dates fetched from the Zenn API at build time.
- `check` + `lint` run as a quality gate before build in CI.
