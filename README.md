# naatin777.dev

個人ポートフォリオサイト。SvelteKit + Tailwind CSS で構築し、GitHub Pages へ静的エクスポートしている。

- サイト内記事は `content/posts/` に置く。
- Zenn/Qiita の記事メタデータ（タイトル/URL/タグ/日付）は `content/generated/<source>.json` に同期される — コミット済みなので、ビルド時にネットワークへアクセスしない。Qiita は API v2、Zenn は公式 RSS と vendored `content/zenn/` subtree の結合で topics を取得する。

## コマンド

```sh
pnpm install
pnpm dev      # 開発サーバー
pnpm sync:external-posts  # 外部記事メタデータを更新（Zenn RSS + Qiita API）
pnpm sync:zenn            # 単一ソースのみ同期 · pnpm sync:qiita
pnpm build    # vite build → pagefind インデックス → OG 画像 → build/
pnpm preview  # build/ を GitHub Pages 同様に配信（vite preview ではビルド後アセットが欠ける）
pnpm run check   # svelte-check
pnpm run lint    # oxlint
pnpm format      # oxfmt
pnpm run test    # vitest
```

`main` への push で GitHub Actions → GitHub Pages へ自動デプロイされる。デプロイワークフローはビルド前に `pnpm sync:external-posts` を実行するため、同期が失敗した場合は古いデータを黙って配信するのではなくデプロイ自体が失敗する。

## ライセンス

- ソースコード: [MIT](LICENSE)
- `content/posts/` 内の記事: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) © Naatin
