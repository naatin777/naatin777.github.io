# AGENTS.md

このリポジトリで作業するコーディングエージェント向けの指示。

## 適用範囲

- このディレクトリをルートとするリポジトリ全体にこれらのルールを適用する。会話中の新しいルールは古い記述より優先される。
- ユーザーが新しいルールを追加した場合、対応するセクションに記録すること — 独立した上書きセクションを追加しない。

## プロジェクト概要

- このサイトは SvelteKit + `@sveltejs/adapter-static` でビルドし、GitHub Pages にデプロイする。
- `pnpm` を `pnpm-lock.yaml` と `pnpm-workspace.yaml` とともに使う（`minimumReleaseAge` などの pnpm 設定はここに置く）。
- CI のランタイムは Node `24` に合わせる。
- Tailwind CSS v4（`@tailwindcss/vite`）+ `@tailwindcss/typography` を使用。グローバルスタイルは `src/app.css` に置く。
- Svelte 5 の runes 構文（`$state`、`$derived`、`$props`、`$bindable`）を使う — `on:` ハンドラ、`createEventDispatcher`、レガシーな `$:` リアクティビティは使わない。

## セットアップ

1. 必要に応じて Corepack を有効化: `corepack enable`
2. ロックファイルを使って依存関係をインストール: `pnpm install --frozen-lockfile`

## よく使うコマンド

- 開発サーバー起動: `pnpm dev` — 開発専用。UI チェックはプレビューを使う（「検証」参照）
- 本番ビルド: `pnpm build`（Vite ビルド → Pagefind インデックス → OG 画像生成。`build/` に出力）
- 型チェック: `pnpm run check`
- Lint: `pnpm run lint`（oxlint）、フォーマット: `pnpm run format` / `pnpm run format:check`（oxfmt）
- テスト: `pnpm run test`（vitest）
- CI 前の全体検証: `pnpm run validate`（check + lint + format:check + test）
- ビルド成果物のプレビュー: `pnpm preview`（GitHub Pages と同様に `build/` を配信する — `vite preview` は `.svelte-kit/output` を配信するため、Pagefind インデックスや OG 画像などのビルド後アセットが欠ける）

## 編集ワークフロー

- 各変更は最小限に保ち、ユーザーの要求に集中させる。
- ファイル編集の前に、実装方針を簡潔に述べ、「はい」などの明示的な確認を待つ。ユーザーが確認なしで進めるよう明示しない限り、新しい要求の直後に編集を開始しない。
- 生成物と依存関係は変更しない（`build/`、`node_modules/`）。
- ページファイルが大きくなったら、再利用可能な UI ブロックを `src/lib/components/` に切り出す。
- 不要な定数の作成や、スタイル/システムのリファクタ時の過剰な `export` 追加は避ける。
- 変数名・関数名・カスタムグローバルキーなどの識別子に `naatin` を使わない。
- アドホックな文字列操作より、確立されたライブラリや宣言的/AST レベルの変換を優先する。Markdown パイプライン（`src/lib/server/posts.ts`）がその典型例: 著者のマークアップ（`rehype-raw` でパースされる埋め込み生 HTML を含む）は最初に `rehype-sanitize` を通し、生成される出力（KaTeX/Shiki/Mermaid SVG/見出しアンカー）は trust boundary の後に AST ノードとして注入される。

## 命名とファイル構成

- ルート・スタイル・コンテンツのファイル名は `kebab-case` にする。
- コンポーネントファイルは `src/lib/components/` に `PascalCase.svelte` で置く。
- サーバー専用コードは `src/lib/server/` に置く（クライアントコンポーネントから import しない）。
- サーバーとクライアントで共有する型は `src/lib/types.ts` に置く — ファイルごとに再定義しない。

## TypeScript ルール

- デフォルトで明示的な型を使う。`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` が有効。
- 型の詳細が不確かな場合は `unknown` と安全な絞り込み（zod）を使う。
- `any` はユーザーが明示的に許可した場合のみ使う。
- 型のみの import には `import type` を使う（`verbatimModuleSyntax`）。
- oxlint は type-aware で実行される（`oxlint-tsgolint`）: `typescript/no-unsafe-type-assertion` は狭い型への `as` キャストを拒否する。境界データは zod/`instanceof`/型ガードで絞り込むこと。キャストが本当に正当化される場所（同じパイプラインが書き込む `file.data` など）では、理由付きの `oxlint-disable-next-line` コメントで抑制する。

## コンテンツルール

- ローカル記事は `content/posts/<year>/<slug>/index.md` に置く（year フォルダは整理用で、URL は `/posts/<slug>/`）。frontmatter は zod で検証される（`title`、`publishedAt`、任意で `description`、`updatedAt`、`tags`、`series`、`draft`）。裸の日付（`YYYY-MM-DD`、任意で `HH:MM[:SS]`）は JST として解釈される — それ以外は明示的なオフセットを書く。記事アセット（画像）は `index.md` の隣に置き、相対パス（`./image.png`）で参照する — vite がバンドルし、パイプラインが src を書き換える。
- 未公開記事は `content/posts/` の外に置く — アセットの glob は `content/posts/` 配下でマッチした全ファイルを出力するため、外にあればビルドに到達しない。`content/posts/` 内の `draft: true` も互換性のためページをスキップするが、アセットは出力されるため、外への移動の代替にはならない。
- 外部記事（Zenn/Qiita）は `content/generated/<source>.json` から来る。`pnpm sync:zenn` / `pnpm sync:qiita` で生成される（`pnpm sync:external-posts` で両方実行）。Qiita は非認証の API v2 を使用。Zenn は公式 RSS で列挙・日付・URL を取得し、frontmatter の `topics` は `content/zenn/`（git subtree）と結合する — 非公開 API は使わない。各ソースは1つの生成ファイルを所有し、同期が他方のソースのデータに触れることはない。ビルドはコミット済みのファイルのみを読み、ネットワークにはアクセスしない。
- `src/lib/server/posts.ts` は不正な Markdown/frontmatter で throw してはいけない — スキップして警告する。
- `content/zenn/` と `content/qiita/` は記事リポジトリ（`zenn-articles` / `qiita-articles`）を git subtree で vendored したもの — Markdown ソースを手元で確認するために置く。パイプラインが参照するのは `content/zenn/` の `topics` のみ。

## スタイリングルール

- グローバルスタイルとコンポーネントレベルのクラス（`.card`、`.chip`、`.prose` の調整）は `src/app.css` に置く。
- テーマトークン（`--background`、`--foreground`、`--muted`、`--border`、`--surface`、`--accent`）は `src/app.css` の `@theme`/`:root` で定義される。ライト/ダーク切替は `[data-theme]` で、`.prose` は `--tw-prose-*` マッピングで駆動される。
- Markdown が生成する HTML（アラート、脚注、見出しアンカー、タスクリスト）は Tailwind のスキャン対象外 — スタイルは `src/app.css` に明示的に書く。
- typography プラグインの `.prose` 要素スタイル（マージン、色、`--tw-prose-*` 変数）を上書きするルールは `src/app.css` で**レイヤーなし**に保つ — プラグインは utilities レイヤーで出力するため、`@layer components` を黙って上回る。
- モーション低減は `src/app.css` でグローバルに処理される。ユーザーが明示的に求めた場合か、グローバルで処理できない実証済みの例外があるコンポーネント以外では、コンポーネントごとの `prefers-reduced-motion` トランジション上書きを追加しない。
- アイコンは `@lucide/svelte` を使う。

## アクセシビリティ

- 情報を持つ画像には意味のある `alt` テキストを書く。装飾的な画像は `alt=""` にする。
- 単一選択フィルタグループは `role="radiogroup"` + `role="radio"` + `aria-checked`、複数選択チップは `aria-pressed` を使う。両方とも `src/app.css` の `.chip` ルールでスタイルされる。
- ランドマーク/nav ラベルは `aria-labelledby` → `LangText` を含む要素でローカライズする（非アクティブな言語は `display:none` なので、スクリーンリーダーはアクティブな方だけを読み上げる）。id には `$props.id()` を使い、二言語の `aria-label` は書かない。
- `LangText` は両言語を DOM にレンダリングし、デフォルトでない方に `data-pagefind-ignore` を付ける — 検索インデックスが両方のバリアントを拾わないよう、この属性を維持する。
- Markdown パイプラインが注入する見出しアンカーは `aria-label` 付きの実際のフォーカス可能リンク — その中にアンカーをネストしない。

## 検証

- 機能変更後は `pnpm build` を実行する。
- TypeScript、ルート、コンテンツ、共有ユーティリティを変更したら `pnpm run check` を実行する — 合格は `errors: 0, warnings: 0, hints: 0`。
- 変更セットを終える前に `pnpm run validate`（または個別スクリプト）を実行する。
- UI チェックは実行中のプレビューサーバー（`pnpm build` + `pnpm preview`）に対して Playwright/agent-browser を使う。UI チェックに `pnpm dev` は使わない — このリポジトリでは信頼できない。ポート `4321` がすでに動いていれば再利用する。
- スクリーンショットは `output/` に保存し、分析後に削除する。
- インタラクティブ機能はデスクトップ・モバイル・タブレットの最新 Chrome、Firefox、Safari で動作しなければならない。

## CI / デプロイ

- GitHub Actions は `pnpm install --frozen-lockfile` で依存関係をインストールし、`pnpm run build` の前に `pnpm run validate` を実行する。
- デプロイは `peaceiris/actions-gh-pages` で `build/` ディレクトリを公開する（`main` への push のみ。PR はチェックのみ実行しデプロイしない）。
- Lighthouse 監査は `scripts/lighthouse.ts` で実行される（Chrome と事前の `pnpm build` が必要）— `PATHS` は実際のルートと同期させる。レポートは `output/lighthouse/` に出力される。
