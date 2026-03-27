# AGENTS.md

Instructions for coding agents working in this repository.

## Scope

- Apply these rules across the repository rooted at this directory.
- Newer conversation rules have higher priority than older wording.
- Update this file when the user adds new rules in conversation.

## Conversation Overrides (Latest)

- For Playwright/UI checks, do not use `pnpm dev` because it is unreliable in this repo. Use `pnpm build` and `pnpm preview`, or reuse an existing preview server.
- Before making file edits, first state the intended implementation direction briefly and wait for explicit user confirmation such as `Yes`. Do not start editing immediately after a new request unless the user explicitly asks to proceed without confirmation.
- Do not modify `src/styles/layers.css.ts`, `src/styles/sprinkles.css.ts`, `src/styles/theme.css.ts`, or `src/styles/vars.css.ts` unless the user explicitly asks.
- Editing inside `src/styles/` is allowed for the current refactor work, including files that were previously protected.
- Avoid creating unnecessary constants and avoid excessive `export` additions during style/system refactors.
- Reduced motion is handled globally in `src/styles/global.css.ts` under a high-priority layer. Do not add per-component `prefers-reduced-motion` transition overrides unless the user explicitly asks or a component has a proven exception that cannot be handled globally.

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
- Run type/content checks: `pnpm run check`
- Preview build output: `pnpm preview`
- Format code: `pnpm format`

## Editing Workflow

- Keep each change minimal and focused on the user request.
- Make source changes in `src/`, `public/`, or root config files.
- Keep generated output and dependencies unchanged (`dist/`, `node_modules/`).
- Move reusable UI blocks into `src/components/` when page files grow.
- Do not use `naatin` in identifiers such as variable names, function names, or custom global keys.
- Do not modify these files unless the user explicitly asks:
  `src/styles/color-mode.css.ts`, `src/styles/layers.css.ts`,
  `src/styles/motion.css.ts`, `src/styles/responsive.css.ts`,
  `src/styles/sprinkles.css.ts`, `src/styles/theme.css.ts`,
  `src/styles/vars.css.ts`.

## Naming and File Structure

- Use `kebab-case` for file and directory names in `src/pages/`, `src/styles/`, and `src/content/`.
- Prefer short purpose-based names.
- Keep file names in `src/components/` as `PascalCase`.
- In `src/components/`, pair each `.astro` file with a matching `.css.ts` basename.
- In `src/components/`, each `.astro` or `.tsx` component should import only its own matching `.css.ts` basename unless the user explicitly asks for shared styles.
- Keep page-level styles in `src/styles/pages/` with matching basenames.
  Example: `src/pages/articles.astro` -> `src/styles/pages/articles.css.ts`
- Keep shared blog detail styles in `src/styles/pages/blog/blog.css.ts`.
- Do not place `*.css.ts` files under `src/pages/` to avoid Astro route warnings.

## TypeScript and Framework Rules

- Use explicit types by default.
- Use `unknown` with safe narrowing when type details are uncertain.
- Use `any` only when the user explicitly allows it.
- Build UI with Astro by default.
- Introduce React only when the user explicitly requests React.
- Add `/** @jsxImportSource solid-js */` at the top of every `.tsx` file.

## Import Alias Rules

- Use aliases in imports where configured.
- Use `@scripts/*` for imports from `src/scripts/*` instead of relative paths.
- Keep CSS import style consistent in `.astro` files by using aliases (`@components/...`, `@styles/...`).

## Content and Data Rules

- Manage page-facing project and article data with YAML Content Collections under `src/content/`.
- Store project data as one file per project in `src/content/projects/`.
- Use `iconPath` for project icons in `src/content/projects/*.yml`.
- Maintain feed article tag mappings in `src/content/tags/*.yml`.
- Use `/articles/` as the feed page for Qiita/Zenn content.
- Keep site-native article content and routes in the `blog` collection and `src/pages/blog/`.
- Keep test-only markdown articles in `src/content/dev-markdown/` (`dev-markdown` collection).
- Use `blog` `draft: true` only for unpublished production articles.
- Add `src/pages/blog.astro` only when the user explicitly requests that route.

## Styling Rules

- Keep global styles in `src/styles/global.css.ts`.
- Put all `globalStyle(...)` declarations in `src/styles/global.css.ts`.
- Do not define `globalStyle(...)` in `src/styles/theme.css.ts`.
- Keep `src/styles/theme.css.ts` limited to theme tokens/values, `createTheme`, and theme exports.
- Keep media-query definitions in `src/styles/responsive.css.ts`.
- Do not add standalone breakpoint/media files (for example `src/styles/media.ts`).
- Use `src/styles/responsive.css.ts` for shared breakpoint queries such as `mobile`, `tablet`, and `desktop`.
- Prefer the global reduced-motion rule in `src/styles/global.css.ts` over repeating `prefers-reduced-motion` blocks in component styles.
- In vanilla-extract, do not write `@layer: utilitiesLayer` or any other direct layer assignment. That form is not supported and causes compile errors.
- When using layers in style objects, always write them in object form, for example:
  ```ts
  "@layer": {
    [utilitiesLayer]: {
      ...
    },
  }
  ```
- Use icons from `src/assets/mode/` for the `ThemeToggle` component.
- Use CSS layers in this order: `reset`, `base`, `component`, `utilities`.
- `reset`: neutralize browser default styles.
- `base`: define site-wide defaults such as fonts and typography.
- `component`: style UI parts such as buttons, cards, and navigation.
- `utilities`: keep single-purpose classes that should apply forcefully.
- Keep `.astro` and CSS structure simple and readable with small, reusable class sets.

## Accessibility

- Write meaningful `alt` text for informative images.
- Mark decorative images with `alt=""` and `aria-hidden="true"`.

## Validation

- Run `pnpm build` after functional changes.
- Run `pnpm run check` when changing TypeScript, Astro routes, content collections, or shared utilities.
- Treat `pnpm run check` as passing only when `errors: 0`, `warnings: 0`, and `hints: 0`.
- For theme styling changes, ensure `rg "globalStyle\\(" src/styles/theme.css.ts` returns no matches.
- Run `pnpm format` when formatting is affected.
- Use Playwright MCP for UI checks against a running preview server started with `pnpm build` and `pnpm preview`.
- If port `4321` is already running, use `http://localhost:4321` as-is and do not require port `4322`.
- Save Playwright screenshots in the `output/` folder, then delete them after analysis is complete.
- Interactive features must work in latest Chrome, Firefox, and Safari on desktop, mobile, and tablet.

## CI / Deploy Notes

- GitHub Actions installs dependencies with `pnpm install --frozen-lockfile`.
- GitHub Pages deployment publishes the `dist/` directory.
