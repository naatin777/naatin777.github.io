---
title: "Markdownレンダリングテスト"
description: "見出し・コード・数式・図・脚注など、Markdownパイプラインの全機能を確認するためのテスト記事"
publishedAt: 2026-09-23
tags:
  - test
  - markdown
draft: false
---

この記事はMarkdownパイプラインの表示確認用です。各種要素が正しくレンダリングされるかを一覧できます。

## 見出しと目次

h2/h3が3つ以上あると目次が表示されます。

### サブ見出し h3

h3は目次でインデントされます。

#### h4以降

h4以降は目次に出ません。

## テキスト装飾

**太字**、*斜体*、~~取り消し線~~、`inline code`、そして[外部リンク](https://example.com)と[内部リンク](/about/)の区別。

> 引用ブロックです。
> 複数行にわたる引用。

## コードブロック

言語指定でShikiハイライトが効きます。

```ts:src/utils/greet.ts
interface User {
  name: string;
  age: number;
}

const greet = (user: User): string => `Hello, ${user.name}!`;
```

`{!}`マーカーで行ハイライト:

```ts
const a = 1;
const b = 2; // [!code highlight]
const c = 3;
```

diff記法:

```ts
const old = "removed"; // [!code --]
const fresh = "added"; // [!code ++]
```

## 数式

インライン数式: オイラーの等式 $e^{i\pi} + 1 = 0$ が美しい。

ブロック数式:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## Mermaid図

```mermaid
flowchart LR
    A[Markdown] --> B[remark]
    B --> C[rehype]
    C --> D{sanitize}
    D --> E[HTML]
```

複雑なフローチャート(サブグラフ・複数経路):

```mermaid
flowchart TB
    subgraph Client["クライアント"]
        Browser["ブラウザ"]
        Cache[("Service Worker\nキャッシュ")]
    end
    subgraph Build["ビルド時"]
        MD["content/posts/**/index.md"] --> Unified["unified パイプライン"]
        Unified -->|"sanitize → slug → toc"| HTML["HTML AST"]
        Zenn["Zenn API"] --> JSON["generated/zenn.json"]
        Qiita["Qiita API"] --> JSON2["generated/qiita.json"]
    end
    subgraph Output["静的出力"]
        Pages["HTML pages"]
        Feed["feed.xml"]
        Index["Pagefind index"]
    end
    Unified --> Pages
    JSON --> Pages
    JSON2 --> Pages
    Pages --> Feed & Index
    Browser -->|request| Pages
    Cache -.->|offline| Browser
    Pages -.->|deploy| GH[("GitHub Pages")]
```

シーケンス図(参加者・ループ・条件分岐):

```mermaid
sequenceDiagram
    autonumber
    actor User as 読者
    participant Page as 記事ページ
    participant PF as Pagefind
    participant SW as ブラウザ

    User->>Page: 検索語を入力
    activate Page
    Page->>PF: debouncedSearch(query, 300ms)
    activate PF
    PF-->>Page: results[](title, excerpt)
    deactivate PF
    alt 結果あり
        Page-->>User: 上位8件を表示
    else 0件
        Page-->>User: 「見つかりませんでした」
    end
    User->>Page: 結果をクリック
    Page->>SW: SPA遷移
    deactivate Page
    SW-->>User: 記事を表示
```

状態遷移図(複合状態・分岐):

```mermaid
stateDiagram-v2
    [*] --> Draft: 記事を書き始める
    state Draft {
        [*] --> Writing
        Writing --> Reviewing: セルフレビュー
        Reviewing --> Writing: 修正点あり
    }
    Draft --> Published: draft: false でコミット
    Published --> Updated: updatedAt を更新
    Updated --> Published: 再ビルド
    Published --> Archived: 古くなった
    Archived --> [*]
```

クラス図(継承・関連・多重度):

```mermaid
classDiagram
    class Post {
        +string slug
        +string title
        +Date publishedAt
        +string[] tags
        +Series? series
        +render() Promise~Html~
    }
    class ExternalArticle {
        +string url
        +string source
        +Date publishedAt
    }
    class Article {
        <<interface>>
        +string title
        +Date publishedAt
    }
    Post ..|> Article : implements
    ExternalArticle ..|> Article : implements
    Post "1" *-- "0..*" Tag : has
    Post "0..1" --> "1" Series : belongs to
    ArticlesPage ..> Article : aggregates
```

ER図(リレーションと属性):

```mermaid
erDiagram
    POST ||--o{ TAGGING : "has"
    POST {
        string slug PK
        string title
        date publishedAt
        string series FK
    }
    TAG ||--o{ TAGGING : "is tagged by"
    TAG {
        string name PK
    }
    SERIES ||--o{ POST : "contains"
    SERIES {
        string name PK
        string description
    }
    EXTERNAL_ARTICLE ||--|| SOURCE : "belongs to"
    SOURCE {
        string name PK
        string baseUrl
    }
```

Gitグラフ(ブランチ・マージ):

```mermaid
gitGraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "feat: posts pipeline"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "feat: mermaid"
    commit id: "fix: newline"
    checkout develop
    merge feature/mermaid id: "merge mermaid"
    checkout main
    merge develop id: "release" tag: "v1.0"
```

## アラート

> [!NOTE]
> 補足情報です。

> [!WARNING]
> 注意が必要な内容です。

> [!IMPORTANT]
> 重要な内容です。

## テーブル

| 要素 | 対応 |
|------|------|
| コード | Shiki |
| 数式 | KaTeX |
| 図 | Mermaid |

## タスクリスト

- [x] 実装済みの項目
- [ ] 未実装の項目

## 画像

同じフォルダに置いた画像を相対パスで参照します。

![テスト用SVG](./sample.svg)

## Raw HTML

安全なHTMLはそのまま使えます。危険なものはsanitizeで除去されます。

<details>
  <summary>折りたたみの例</summary>

  details/summaryで折りたたみコンテンツを作れます。

</details>

キーボード表記: <kbd>Ctrl</kbd> + <kbd>C</kbd>

## 脚注

脚注のあるテキストです[^1]。複数の脚注[^note]も使えます。

[^1]: これは脚注です。
[^note]: 名前付き脚注です。

## 区切り線

---

以上でテストは終わりです。
