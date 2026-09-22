# naatin777.dev

Personal portfolio site. Built with SvelteKit + Tailwind CSS, statically exported to GitHub Pages.

- Articles from Zenn/Qiita are imported via git subtree under `content/` (title/URL/tags only).
- Site-native posts live in `content/posts/`.

## Commands

```sh
pnpm install
pnpm dev      # dev server
pnpm build    # vite build → pagefind index → OG images → build/
pnpm preview  # preview build
pnpm run check   # svelte-check
pnpm run lint    # oxlint
pnpm format      # oxfmt
pnpm run test    # vitest
```

Deploys automatically on push to `main` via GitHub Actions → GitHub Pages.

## License

- Source code: [MIT](LICENSE)
- Articles in `content/posts/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) © Naatin
- Imported articles (`content/zenn/`, `content/qiita/`): article text is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), the rest MIT — per each upstream repo's README
