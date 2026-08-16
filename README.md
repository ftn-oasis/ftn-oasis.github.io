# FTN OASIS

> パスは全てプロジェクトルート (`package.json` のある階層) からの相対パスで表します.

## 名前の由来

**F**uzoku **T**enoji **H**igh school OASIS

## ファイル構造

```file-tree
src/
├── main.tsx                    エントリーポイント
├── App.tsx                     ルーティングの定義
│
├── components/                 ドメインを知らない汎用部品
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Avatar.tsx
│   │   ├── Label.tsx           色つきのタグ
│   │   ├── Tabs.tsx
│   │   ├── Dropdown.tsx
│   │   └── Spinner.tsx
│   └── layout/
│       ├── AppLayout.tsx       Header + <Outlet /> + Footer
│       ├── Header.tsx
│       └── Footer.tsx
│
├── features/                   機能ごとのまとまり
│   ├── repository/
│   │   ├── components/
│   │   │   ├── RepoHeader.tsx
│   │   │   ├── RepoNav.tsx
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileRow.tsx     FileTreeの1行
│   │   │   ├── ReadmeCard.tsx
│   │   │   └── RepoSidebar.tsx
│   │   ├── api.ts              fetchRepo() など
│   │   ├── useRepo.ts          データ取得フック
│   │   └── types.ts            type Repository = {...}
│   │
│   ├── issues/
│   │   ├── components/
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueRow.tsx
│   │   │   ├── IssueLabel.tsx
│   │   │   └── CommentBox.tsx
│   │   ├── api.ts
│   │   ├── useIssues.ts
│   │   └── types.ts
│   │
│   └── user/
│       ├── components/
│       │   ├── ProfileCard.tsx
│       │   └── ContributionGraph.tsx
│       ├── api.ts
│       └── types.ts
│
├── pages/                      URLと1対1で対応
│   ├── HomePage.tsx
│   ├── UserPage.tsx
│   ├── RepoLayout.tsx          RepoHeader + RepoNav + <Outlet />
│   ├── RepoCodePage.tsx
│   ├── RepoIssuesPage.tsx
│   └── IssueDetailPage.tsx
│
├── lib/                        機能に依存しない道具
│   ├── apiClient.ts            fetchのラッパー
│   └── formatDate.ts           「3日前」への変換など
│
└── styles/
    └── globals.css
```

## アイコン･ロゴ

- 原本はAffinityで作成
- git LFS を使用して原本を管理

### 書き出し手順

1. `./design/emblems/` 内のファイルを開く

   | ファイル名                   | 状態                                                                |
   | ---------------------------- | ------------------------------------------------------------------- |
   | `fth-oasis-logo.af`          | `FTH OASIS` の文字がデザインされた横長のマーク                      |
   | `fth-oasis-icon.af`          | ヤシの木を模した正方形のマーク                                      |
   | `fth-oasis-icon-origianl.af` | `fth-oasis-icon` と同じだが, パスが展開されていない[^logo-original] |

2. SVGを `./emblems/exported/` 以下に書き出す

   | 設定               | 値      |
   | ------------------ | ------- |
   | Set viewbox        | ON      |
   | Flatten transforms | ON      |
   | Rasterise          | Nothing |

3. 以下のコマンドを実行

```shell
npm run icons
```

`./emblems/optimized/`[^optimized-directory] と `./public/emblems.svg` は自動生成の為,
直接編集しないでください.

[^logo-original]: `fth-oasis-logo.af` のパスが展開されていないファイルは存在しません.

[^optimized-directory]: `./emblems/optimized/` は `.gitignore`
    によりリモートリポジトリには存在しません. 気にしないでください.
