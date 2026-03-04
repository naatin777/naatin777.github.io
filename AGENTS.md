# AGENTS.md

Instructions for coding agents working in this repository.

## Scope

- Apply these rules across the repository rooted at this directory.

## Project Snapshot

- Build this site with Astro.
- Use `pnpm` with `pnpm-lock.yaml`.
- Match CI runtime with Node `22`.
- Use `vanilla-extract` for styling (`*.css.ts`).

## Setup

1. Enable Corepack as needed: `corepack enable`
2. Install dependencies with lockfile: `pnpm install --frozen-lockfile`

## Common Commands

- Start dev server: `pnpm dev`
- Build production output: `pnpm build`
- Preview build output: `pnpm preview`
- Format code: `pnpm format`

## Editing Workflow

- Keep each change minimal and focused on the user request.
- Make source changes in `src/`, `public/`, or root config files.
- Use `kebab-case` for file and directory names in `src/pages/`, `src/styles/`, and `src/content/`; prefer short purpose-based names.
- Keep file names in `src/components/` as `PascalCase` and pair each `.astro` file with a matching `.css.ts` basename.
- Keep generated output and dependencies unchanged (`dist/`, `node_modules/`).
- Move reusable UI blocks into `src/components/` when page files grow.
- Update this `AGENTS.md` when the user adds new rules in conversation.
- Apply newer conversation rules as higher priority than older wording.
- Do not use `naatin` in identifiers such as variable names, function names, or custom global keys.

## TypeScript and Framework Rules

- Use explicit types by default.
- Use `unknown` with safe narrowing when type details are uncertain.
- Use `any` when the user explicitly allows it.
- Add `/** @jsxImportSource solid-js */` at the top of every `.tsx` file.
- Build UI with Astro by default.
- Introduce React when the user explicitly requests React.

## Content and Data Rules

- Manage page-facing project and article data with YAML Content Collections under `src/content/`.
- Store project data as one file per project in `src/content/projects/`.
- Use `iconPath` for project icons in `src/content/projects/*.yml`.
- Maintain feed article tag mappings in `src/content/tags/*.yml`.
- Use `/articles/` as the feed page for Qiita/Zenn content.
- Keep site-native article content and routes in the `blog` collection and `src/pages/blog/`.
- Keep test-only markdown articles in `src/content/dev-markdown/` (`dev-markdown` collection). Use `blog` `draft: true` only for unpublished production articles.
- Add `src/pages/blog.astro` when the user explicitly requests that route.

## Styling and File Pairing Rules

- Keep global styles in `src/styles/global.css.ts`.
- Do not add standalone breakpoint/media files (for example `src/styles/media.ts`); keep media-query definitions in `src/styles/responsive.css.ts`.
- Use icons from `src/assets/mode/` for the `ThemeToggle` component.
- Use CSS layers in this order: `reset`, `base`, `component`, `utilities`.
- `reset`: neutralize browser default styles.
- `base`: define site-wide defaults such as fonts and typography.
- `component`: style UI parts such as buttons, cards, and navigation.
- `utilities`: keep single-purpose classes that should apply forcefully (e.g., margin tweaks, hide/show).
- Keep page-level styles in `src/styles/pages/` with matching basenames (for example, `src/pages/articles.astro` -> `src/styles/pages/articles.css.ts`).
- Keep shared blog detail styles in `src/styles/pages/blog/blog.css.ts`.
- Do not place `*.css.ts` files under `src/pages/` to avoid Astro route warnings.
- In `src/components/`, pair each `.astro` file with a matching `.css.ts` basename.
- Keep CSS import style consistent in `.astro` files by using aliases (`@components/...`, `@styles/...`).
- Keep `.astro` and CSS structure simple and readable with small, reusable class sets.

## Accessibility

- Write meaningful `alt` text for informative images.
- Mark decorative images with `alt=""` and `aria-hidden="true"`.

## Validation

- Run `pnpm build` after functional changes.
- Run `pnpm format` when formatting is affected.
- Use Playwright MCP for UI checks on the running local dev server.
- If port `4321` is already running, use `http://localhost:4321` as-is and do not require port `4322`.
- Save Playwright screenshots in the `output/` folder, then delete them after analysis is complete.

## CI / Deploy Notes

- GitHub Actions installs dependencies with `pnpm install --frozen-lockfile`.
- GitHub Pages deployment publishes the `dist/` directory.
