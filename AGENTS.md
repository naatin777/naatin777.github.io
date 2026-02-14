# AGENTS.md

Instructions for coding agents working in this repository.

## Scope

- Applies to the entire repository rooted at this directory.

## Project Summary

- Static site built with Astro.
- Package manager: `pnpm` (locked via `pnpm-lock.yaml`).
- Node version used in CI: `22`.
- Styling uses `vanilla-extract` (`*.css.ts`).

## Setup

1. Enable Corepack if needed: `corepack enable`
2. Install dependencies: `pnpm install --frozen-lockfile`

## Common Commands

- Start dev server: `pnpm dev`
- Build production output: `pnpm build`
- Preview built site: `pnpm preview`
- Format code: `pnpm format`

## Editing Guidelines

- Make source changes under `src/`, `public/`, or config files in root.
- Do not edit generated/build output under `dist/`.
- Do not edit dependencies under `node_modules/`.
- Keep changes minimal and focused on the request.

## Conversation Updates

- When the user specifies new coding/style rules during conversation, update this `AGENTS.md` accordingly.
- Treat newer user instructions in the same conversation as higher priority than older phrasing.
- Keep updates explicit and concise so future agents can follow them without ambiguity.

## Code Rules

- Do not use TypeScript `any` by default.
- `any` may be used only when the user explicitly allows it.
- Prefer explicit types. If needed, use `unknown` and narrow it safely.

## Styling Rules

- Use `vanilla-extract` for styling (`*.css.ts`).
- Put global styles in `src/styles/global.css.ts`.

## Validation

- Run `pnpm build` after functional changes.
- Run `pnpm format` if formatting is affected.

## CI/Deploy Notes

- GitHub Actions installs with `pnpm install --frozen-lockfile`.
- Deployment publishes the `dist/` directory to GitHub Pages.
