# CLAUDE.md

このファイルは, Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドを提供します.
機能ごとの実装詳細・設計判断の経緯は `docs/` 以下に分割してあります —
**このファイルは作業ルールの要点だけをまとめた索引です. 各機能を触る前に必ず該当する
`docs/` のページを読んでください.**

## プロジェクトについて

FTH OASIS (**F**uzoku **T**enoji **H**igh school OASIS) — React + TypeScript + Vite で構築された
SPA です. README.md によると, 想定されている最終形は GitHub のようなUI (リポジトリブラウザ, issue,
ユーザープロフィールなど) です.

**実装済みのページ・機能一覧, および現状できていないこと (着手する際は要確認) は
[`docs/project-status.md`](docs/project-status.md) を参照してください.** 新しいページを
作る際, URL の命名は既存のリンク (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` など) と
揃えてください.

- 認証/バックエンドは存在しません. `src/lib/currentUser.ts` に仮のユーザー情報
  (`id`/`name`/`email`) を置いているだけで, 各機能のモックデータもすべてダミーです.
- テストスイートは設定されていません.

## コマンド

- `npm run dev` — emblem スプライトを再生成した後, Vite の開発サーバーを起動
- `npm run build` — emblem スプライトを再生成した後, `tsc -b` (型チェック) と `vite build` を実行
- `npm run lint` — リポジトリ全体に ESLint を実行
- `npm run preview` — 本番ビルドをプレビュー
- `npm run emblems` — `emblems/optimized/` から `public/emblems.svg` と
  `src/components/ui/emblem-names.ts` を再生成 (詳細は [`docs/emblem-pipeline.md`](docs/emblem-pipeline.md)).
  `dev`/`build` の実行前に自動で呼ばれる

## 作業の進め方

- **UI の変更を確認する際は `npm run dev` を起動したままにしてください.** ポート占有の解消などで
  一旦落とすのは構いませんが, 作業の最後までに再度起動しておいてください.
- **仕様が曖昧な場合 (命名, 挙動, 配置場所など) は推測で埋めず,
  実装前にユーザーに質問してください.**
- **ボタンの見た目 (border-radius/border-width など) に関する新しい指定があった場合は,
  `--borderRadius-medium`/`--borderWidth-thin` (`globals.css` で定義, 詳細は
  [`docs/architecture.md`](docs/architecture.md) の「カラートークン・デザイントークン」を参照)
  など既存の共通変数を使うかどうかを実装前に質問してください.**
- **リストの角 (一覧 Box/`<table>` など)・フォーカスの枠の角・ボタンの角は,
  特に指示が無い限り既定で `--borderRadius-medium` を使って丸めてください**
  (「今後特に指示が無い場合は, リストの角やフォーカスの枠の角, ボタンの角を
  丸めるようにしてほしい」という依頼による標準方針です — 上記の「新しい指定が
  あった場合は質問する」ルールとは別に, これ自体は既に確立した既定挙動として
  扱ってください. `border-collapse: collapse` の `<table>` は border-radius
  が効かない既知の挙動があるため, `border-collapse: separate; border-spacing: 0;`
  + `overflow: hidden;` に置き換える必要があります — `TransactionItemsList`
  で実際に踏んだ不具合です. 詳細: [`docs/pages/transaction-detail.md`](docs/pages/transaction-detail.md)).
- **依頼された変更の結果, 既存コードと重複が生まれてコンポーネント/フックとして切り出すべきと
  判断できる場合は, 指示されていなくても一緒に切り出してください**
  (設計判断に迷ったら上記と同様に質問する).
- **編集後は以下をすべて実行し, 指摘があれば直してから完了としてください.**
  - `tsc --project tsconfig.app.json --noEmit --ignoreDeprecations 6.0` —
    プロジェクト全体に対して実行する (共有コンポーネント/フックの型を変えた場合,
    他の呼び出し元への波及がここで分かります). ユーザーの nvim 上のエラー表示は LSP
    キャッシュが古いだけのことがあるので, ユーザーから エラーを報告されたら,
    まずこのコマンドで現在のファイル内容に対する実際の型エラーの有無を確認し, 再現しなければその旨
    (LSP再起動で解消する可能性) を伝えてください.
  - `npx eslint <編集したファイル>`
  - `biome lint <編集したファイル>` — Biome はグローバルインストール済みでリポジトリに `biome.json`
    は無く, ユーザーの nvim では既定設定で LSP 診断として lint が表示されます.
    フォーマットの差分は既定のインデントスタイル (タブ) がこのプロジェクトの規約 (2スペース) と
    食い違うだけなので無視してよく, `biome check` ではなく `biome lint` で確認してください.
  - `.css`/`.module.css` を編集した場合は `stylelint <編集したファイル>` も.
    こちらもグローバルインストール済みで設定ファイルは無く, 既定設定で動作します.
    `selector-class-pattern` (クラスセレクタを kebab-case にせよという指摘) は, CSS Modules を
    camelCase (`.homeLink` 等, `styles.homeLink` のように JS 側からプロパティアクセスするため) で
    書くこのプロジェクトの規約と既定設定が衝突しているだけなので無視してください.
    `custom-property-pattern` (カスタムプロパティを kebab-case にせよという指摘) のうち
    `--borderRadius-medium`/`--borderWidth-thin` (共通デザイントークン, `globals.css`
    で定義) も同様に, 指示された表記をそのまま採用した意図的なものなので無視してください.
    それ以外 (ショートハンドの提案, `@import url(...)` の記法, 宣言前の空行など)
    は実際の指摘なので直してください.
  - Biome/stylelint いずれも, プロジェクトの依存関係や設定ファイルとして追加する話ではありません —
    エディタ上の見え方に合わせて確認するためだけのものです.

## アーキテクチャ

**詳細 (アプリの構成・ディレクトリの規約・デザイントークン) は
[`docs/architecture.md`](docs/architecture.md) を参照してください.** 要点のみ:

### パスエイリアス

`tsconfig.app.json` で絶対パスのエイリアスが2つ定義されており (`vite-tsconfig-paths` により Vite
にも自動反映されます):

- `@/*` → プロジェクトルート (例: `@/src/components/...`)
- `@src/*` → `./src/*` (例: `@src/components/...`)

どちらも同じファイルを指しますが, `src/` 配下を指す場合は既存のコードの大半に合わせて `@src/*`
を優先してください.

### ディレクトリ構成 (概要)

- `src/components/` — ドメインを知らない汎用部品 (`ui/`, `layout/`).
- `src/features/<feature>/` — 機能ごとにまとまったコード (`types.ts`/`mockData.ts`/`components/`).
- `src/pages/` — ルートと1対1で対応するコンポーネント.
- `src/lib/` — 機能にもコンポーネントにも依存しない道具置き場.
- `src/providers/AppProviders.tsx` — グローバルな Context Provider (`ThemeProvider`/`ToastProvider`)
  をまとめる唯一の場所. 新しい Provider はここに追加してください.
- ルーティングは `App.tsx` にあります (`createBrowserRouter` のデータルーター — `useBlocker`
  ([`docs/navigation-guard.md`](docs/navigation-guard.md)) がデータルーターでしか動作しない
  ため).
- コンポーネントのスタイルは CSS Modules をコンポーネントと同じ場所に配置します (`Foo.tsx` +
  `Foo.module.css`), `clsx` で合成します.

### export の方法

宣言 (`function`/`const`/`type` など) には `export` を付けず, ファイル末尾にまとめて
`export { Foo, Bar };` (型は `export { type Foo, Bar };`) の形で1箇所に集約します. `export default`
や, 宣言と同時に `export function Foo() {}` のように書くスタイルは使いません. 自動生成ファイル
(`src/components/ui/emblem-names.ts` など) も対象で, 生成元のスクリプト (`scripts/build-sprite.mjs`)
の出力テンプレート側を直してください.

## UI コンポーネントの共通パターン

似た見た目・挙動のコントロールは土台となる CSS Module (`○○Base.module.css`) を共有し,
各コンポーネント自身の `Foo.module.css` にはタグ固有のリセットだけを書く構成にしています.
**新しい部品を追加する際はまず既存のパターンに当てはまらないか [`docs/ui-common-patterns.md`](docs/ui-common-patterns.md)
を確認してください** — 正方形アイコン系 (`controlBase`)/横並びリスト行系 (`menuItemBase`)/
タブバー系 (`tabBase`)/ポップオーバー・ドロップダウンの共通パターン (`useDismissablePopover`,
フォーム用ドロップダウンは `selectFieldBase`) を解説しています.

**フォームにドロップダウンを追加する際は, ネイティブ `<select>` ではなく必ずカスタムポップオーバー
(`selectFieldBase.module.css` ベース) を検討してください** — 詳細は上記ドキュメントを参照.

## ドキュメント索引

各ページ・機能の実装詳細と設計判断の経緯は [`docs/README.md`](docs/README.md) の索引から
参照してください. 主なもの:

- [`docs/project-status.md`](docs/project-status.md) — 実装済み/未実装の一覧
- [`docs/architecture.md`](docs/architecture.md) — アプリの構成・ディレクトリ規約・デザイントークン
- [`docs/ui-common-patterns.md`](docs/ui-common-patterns.md) — 共通 UI パターン
- [`docs/header.md`](docs/header.md) — グローバルヘッダー
- [`docs/user-name-link.md`](docs/user-name-link.md) — 名前表示のプロフィールリンク化
- [`docs/markdown-viewer.md`](docs/markdown-viewer.md) — Markdown プレビュー
- [`docs/request-submit-flow.md`](docs/request-submit-flow.md) — 作成フォームの送信/確認 UX
- [`docs/navigation-guard.md`](docs/navigation-guard.md) — 作成画面の離脱ガード
- `docs/pages/*.md` — 各ページ (組織/文書/会議/会計処理の一覧・詳細, ホーム, 各種作成
  フォーム — 文書作成/文書アップロード/組織作成/会計申請作成 — など) の実装詳細
