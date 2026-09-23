# naatin777.dev

Personal portfolio site. Built with SvelteKit + Tailwind CSS, statically exported to GitHub Pages.

- Site-native posts live in `content/posts/`.
- Zenn/Qiita article metadata (title/URL/tags/dates) is synced into `content/generated/<source>.json` — committed, so builds never hit the network. Qiita via API v2; Zenn via the official RSS joined with the vendored `content/zenn/` subtree for topics.

## Commands

```sh
pnpm install
pnpm dev      # dev server
pnpm sync:external-posts  # refresh external article metadata (Zenn RSS + Qiita API)
pnpm sync:zenn            # or sync a single source · pnpm sync:qiita
pnpm build    # vite build → pagefind index → OG images → build/
pnpm preview  # serve build/ like GitHub Pages (vite preview misses post-build assets)
pnpm run check   # svelte-check
pnpm run lint    # oxlint
pnpm format      # oxfmt
pnpm run test    # vitest
```

Deploys automatically on push to `main` via GitHub Actions → GitHub Pages. The deploy workflow runs `pnpm sync:external-posts` before building, so a failed sync fails the deploy rather than shipping silently stale data.

## License

- Source code: [MIT](LICENSE)
- Articles in `content/posts/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) © Naatin
