# AGENTS.md

Instructions for coding agents working in this repository.

## Scope

- Apply these rules across the repository rooted at this directory; newer conversation rules override older wording.
- When the user adds a new rule, record it under the matching section below — do not append a separate overrides section.

## Project Snapshot

- Build this site with SvelteKit + `@sveltejs/adapter-static`, deployed to GitHub Pages.
- Use `pnpm` with `pnpm-lock.yaml` and `pnpm-workspace.yaml` (pnpm settings live there, including `minimumReleaseAge`).
- Match CI runtime with Node `24`.
- Use Tailwind CSS v4 (`@tailwindcss/vite`) + `@tailwindcss/typography`; global styles live in `src/app.css`.
- Use Svelte 5 runes syntax (`$state`, `$derived`, `$props`, `$bindable`) — no `on:` handlers, no `createEventDispatcher`, no legacy `$:` reactivity.

## Setup

1. Enable Corepack as needed: `corepack enable`
2. Install dependencies with lockfile: `pnpm install --frozen-lockfile`

## Common Commands

- Start dev server: `pnpm dev` — development only; UI checks use the preview (see Validation)
- Build production output: `pnpm build` (Vite build → Pagefind index → OG image generation; outputs to `build/`)
- Run type checks: `pnpm run check`
- Lint: `pnpm run lint` (oxlint), format: `pnpm run format` / `pnpm run format:check` (oxfmt)
- Tests: `pnpm run test` (vitest)
- Full pre-CI validation: `pnpm run validate` (check + lint + format:check + test)
- Preview build output: `pnpm preview` (serves `build/` like GitHub Pages — `vite preview` serves `.svelte-kit/output` instead and would miss post-build assets like the pagefind index and OG images)

## Editing Workflow

- Keep each change minimal and focused on the user request.
- Before making file edits, state the intended implementation direction briefly and wait for explicit user confirmation such as "Yes". Do not start editing immediately after a new request unless the user explicitly asks to proceed without confirmation.
- Keep generated output and dependencies unchanged (`build/`, `node_modules/`).
- Keep reusable UI blocks in `src/lib/components/` when page files grow.
- Avoid creating unnecessary constants and avoid excessive `export` additions during style/system refactors.
- Do not use `naatin` in identifiers such as variable names, function names, or custom global keys.
- Prefer established libraries and declarative/AST-level transforms over ad-hoc string manipulation. The Markdown pipeline (`src/lib/server/posts.ts`) is the canonical example: author markup — including embedded raw HTML, parsed by `rehype-raw` — passes `rehype-sanitize` first, and generated output (KaTeX/Shiki/Mermaid SVG/heading anchors) is injected as AST nodes after the trust boundary.

## Naming and File Structure

- Use `kebab-case` for route, style, and content filenames.
- Keep component files in `src/lib/components/` as `PascalCase.svelte`.
- Server-only code lives in `src/lib/server/` (never import it from client components).
- Types shared between server and client live in `src/lib/types.ts` — do not re-derive them per file.

## TypeScript Rules

- Use explicit types by default; `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` are on.
- Use `unknown` with safe narrowing (zod) when type details are uncertain.
- Use `any` only when the user explicitly allows it.
- Use `import type` for type-only imports (`verbatimModuleSyntax`).
- oxlint runs type-aware (`oxlint-tsgolint`): `typescript/no-unsafe-type-assertion` rejects `as` casts to narrower types. Narrow boundary data with zod/`instanceof`/type guards instead; where a cast is genuinely justified (e.g. `file.data` written by the same pipeline), suppress with a reasoned `oxlint-disable-next-line` comment.

## Content Rules

- Local posts live at `content/posts/<year>/<slug>/index.md` (the year folder is organizational; the URL is `/posts/<slug>/`) with zod-validated frontmatter (`title`, `publishedAt`, optional `description`, `updatedAt`, `tags`, `series`, `draft`). Bare dates (`YYYY-MM-DD`, optionally `HH:MM[:SS]`) are interpreted as JST — write an explicit offset for anything else. Post assets (images) sit beside `index.md` and are referenced relatively (`./image.png`) — vite bundles them and the pipeline rewrites the src.
- Unpublished posts belong in `content/drafts/<slug>/` — the asset glob emits every file it matches, so nothing there reaches the build. `draft: true` inside `content/posts/` still skips the page for compatibility but its assets still ship, so it is not a substitute for `content/drafts/`.
- External articles (Zenn/Qiita) come from `content/generated/<source>.json`, produced by `pnpm sync:zenn` / `pnpm sync:qiita` (`pnpm sync:external-posts` runs both). Qiita uses the unauthenticated API v2. Zenn uses the official RSS for enumeration/dates/URLs joined with `content/zenn/` (git subtree) for frontmatter `topics` — no private APIs. Each source owns one generated file — a sync never touches the other source's data. The build reads only those committed files — never the network.
- `src/lib/server/posts.ts` must never throw on malformed Markdown/frontmatter — skip and warn instead.

## Styling Rules

- Keep global styles and component-level classes (`.card`, `.chip`, `.prose` tweaks) in `src/app.css`.
- Theme tokens (`--background`, `--foreground`, `--muted`, `--border`, `--surface`, `--accent`) are defined under `@theme`/`:root` in `src/app.css`; light/dark switching is via `[data-theme]` and `.prose` is driven by `--tw-prose-*` mappings.
- Markdown-generated HTML (alerts, footnotes, heading anchors, task lists) is not scanned by Tailwind — its styles must be written explicitly in `src/app.css`.
- Rules that override the typography plugin's `.prose` element styles (margins, colors, `--tw-prose-*` vars) must stay **unlayered** in `src/app.css` — the plugin emits in the utilities layer, which silently beats `@layer components`.
- Reduced motion is handled globally in `src/app.css`. Do not add per-component `prefers-reduced-motion` transition overrides unless the user explicitly asks or a component has a proven exception that cannot be handled globally.
- Use `@lucide/svelte` for icons.

## Accessibility

- Write meaningful `alt` text for informative images; decorative images use `alt=""`.
- Single-select filter groups use `role="radiogroup"` + `role="radio"` + `aria-checked`; multi-select chips use `aria-pressed`. Both are styled by the `.chip` rule in `src/app.css`.
- Landmark/nav labels are localized via `aria-labelledby` → an element containing `LangText` (the inactive language is `display:none`, so screen readers announce only the active one). Use `$props.id()` for the id; never write bilingual `aria-label`s.
- `LangText` renders both languages into the DOM and marks the non-default one `data-pagefind-ignore` — keep that attribute so the search index doesn't index both variants.
- Heading anchors injected by the Markdown pipeline are real focusable links with `aria-label` — do not nest anchors inside them.

## Validation

- Run `pnpm build` after functional changes.
- Run `pnpm run check` when changing TypeScript, routes, content, or shared utilities — passing means `errors: 0, warnings: 0, hints: 0`.
- Run `pnpm run validate` (or the individual scripts) before finishing a change set.
- For UI checks use Playwright/agent-browser against a running preview server (`pnpm build` + `pnpm preview`). Do not use `pnpm dev` for UI checks — it is unreliable in this repo. If port `4321` is already running, reuse it.
- Save screenshots in `output/` and delete them after analysis.
- Interactive features must work in latest Chrome, Firefox, and Safari on desktop, mobile, and tablet.

## CI / Deploy Notes

- GitHub Actions installs dependencies with `pnpm install --frozen-lockfile` and runs `pnpm run validate` before `pnpm run build`.
- Deployment publishes the `build/` directory via `peaceiris/actions-gh-pages` (push to `main` only; PRs run checks but do not deploy).
- Lighthouse audits run via `scripts/lighthouse.ts` (requires Chrome and a prior `pnpm build`) — keep its `PATHS` in sync with real routes; reports land in `output/lighthouse/`.
