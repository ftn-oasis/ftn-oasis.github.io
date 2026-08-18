# CLAUDE.md

このファイルは, Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドを提供します.

## プロジェクトについて

FTH OASIS (**F**uzoku **T**enoji **H**igh school OASIS) — React + TypeScript + Vite で構築された SPA
です. README.md によると, 想定されている最終形は GitHub のようなUI (リポジトリブラウザ, issue,
ユーザープロフィールなど) です.

現状できていること:

- `Header` (`src/components/layout/`) — ハンバーガーメニュー (`NavDrawer` を開閉), ロゴ+パンくず,
  検索ボタン, 「作成」ドロップダウン, 主要ナビアイコン, 通知, ユーザーメニュー (`UserMenuButton`)
  を1行に並べたグローバルヘッダー. 画面が狭くなると検索ボタンやナビアイコンが
  自動で折り畳まれるレスポンシブ対応あり.
- テーマシステム (`ThemeContext`) — ライト/ダーク (Catppuccin Latte/Mocha) を OS
  の設定から自動検出し, 手動切り替えにも対応.
- `NavDrawer` — 左からスライドインするメニュー (ホーム/各種申請/規則等/組織など).
- ルーティングの土台と最初のページ — `App.tsx` に `<Routes>` を導入し, `AppLayout`
  (`Header` + `<Outlet />`, 全ページ共通) 配下に `/users/:userId` → `UserProfilePage`
  (`src/pages/`) を実装済みです. `currentUser.id` と一致しない `userId` (未知のユーザーなど)
  は「ユーザーが見つかりません」という結果になります — 実際のユーザー検索/存在チェックの API
  が無いための暫定挙動です. `ProfileTabs` の「概要」タブの本文として `OverviewSection`
  (`src/features/user/components/`, 詳細は「プロフィールページの概要タブ」を参照)
  を実装済みですが, 「文書」タブの本文はまだ無く, タブを切り替えても何も表示されません
  (「栞」タブは依頼により削除済みです).
  同様に `/orgs/:orgId` (概要タブ) と `/orgs/:orgId/documents` (文書タブ)/
  `/orgs/:orgId/book` (会計タブ)/`/orgs/:orgId/members` (構成員タブ)
  も実装済みです (詳細は「組織プロフィールページ」「組織の文書一覧
  (`OrganizationDocumentsSection`)」「組織の入出金一覧
  (`OrganizationBookSection`)」「組織の構成員一覧
  (`OrganizationMembersSection`)」を参照) — この4つは `OrganizationLayout`
  (`src/pages/`) という共通の親ルートの下にネストしたルートとして実装しており,
  組織の存在チェックと `OrganizationTabs` の表示はそちらに集約されています.
  `path="*"` の catch-all として `NotFoundPage`
  (`src/pages/`, 詳細は「404 ページ (`NotFoundPage`)」を参照) も実装済みで,
  `/users/:userId`/`/orgs/:orgId` 以外のどのパスにもマッチしない URL は 404 ページに
  なります (以前はここが完全な白紙になっていました).

現状できていないこと (着手する際は要確認):

- **`/users/:userId`/`/orgs/:orgId`/`/orgs/:orgId/documents`/`/orgs/:orgId/book`/
  `/orgs/:orgId/members` 以外の実ページ**は依然として存在しません —
  Header/Drawer 内のリンク先の大半, および組織プロフィールページの「会議」
  「設定」タブは実際には `NotFoundPage` (404) が表示されるだけの状態です.
  新しいページを
  作る際, URL の命名は既存のリンク (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` など)
  と揃えてください. ユーザー/組織のプロフィールページは `/users/:userId`/`/orgs/:orgId`
  (`/` 直下ではなくそれぞれの配下) に切り出してあるため, 新しいトップレベルのページ
  (`/foo` 等) を追加する際に `<Route>` の並び順を気にする必要はありません (`path="*"`
  の `NotFoundPage` より前に置く必要はありますが, それ以外の既存ルートとの前後関係は
  無関係です) — 以前は `/:userId` という動的ルートが最上位にあり, 新しいページより前に
  置かないとそちらに飲み込まれてしまう問題がありましたが, 各々のプレフィックス配下に
  切り出したことで解消しています.
- 認証/バックエンド — 存在しません. `src/lib/currentUser.ts` に仮のユーザー情報
  (`id`/`name`/`email`) を置いているだけです. `UserProfilePage` の文書の件数
  (`DUMMY_DOCUMENT_COUNT`) や, 「概要」タブの所属組織/文書一覧
  (`src/features/user/mockData.ts`), 組織プロフィールページの組織詳細/構成員/直近の動向
  (`src/features/organization/mockData.ts`, `id: "test-org"` の1件のみ) も同様にダミーです.
- テストスイート — 設定されていません.
- `src/` 内の一部ファイルは空のスタブです (例: `SearchBar.tsx`). import
  されているからといって中身があるとは限らないので, 必ず内容を確認してください.

## コマンド

- `npm run dev` — emblem スプライトを再生成した後, Vite の開発サーバーを起動
- `npm run build` — emblem スプライトを再生成した後, `tsc -b` (型チェック) と `vite build` を実行
- `npm run lint` — リポジトリ全体に ESLint を実行
- `npm run preview` — 本番ビルドをプレビュー
- `npm run emblems` — `emblems/optimized/` から `public/emblems.svg` と
  `src/components/ui/emblem-names.ts` を再生成 (「アイコン・emblem パイプライン」参照).
  `dev`/`build` の実行前に自動で呼ばれる

## 作業の進め方

- **UI の変更を確認する際は `npm run dev` を起動したままにしてください.** ポート占有の解消などで
  一旦落とすのは構いませんが, 作業の最後までに再度起動しておいてください.
- **仕様が曖昧な場合 (命名, 挙動, 配置場所など) は推測で埋めず,
  実装前にユーザーに質問してください.**
- **ボタンの見た目 (border-radius/border-width など) に関する新しい指定があった場合は,
  `--borderRadius-medium`/`--borderWidth-thin` (`globals.css` で定義, 詳細は
  「共通デザイントークン」を参照) など既存の共通変数を使うかどうかを実装前に質問してください.**
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

### パスエイリアス

`tsconfig.app.json` で絶対パスのエイリアスが2つ定義されており (`vite-tsconfig-paths` により Vite
にも自動反映されます):

- `@/*` → プロジェクトルート (例: `@/src/components/...`)
- `@src/*` → `./src/*` (例: `@src/components/...`)

どちらも同じファイルを指しますが, `src/` 配下を指す場合は既存のコードの大半に合わせて `@src/*`
を優先してください.

### アプリの構成

`main.tsx` は `<AppProviders><App /></AppProviders>` をマウントします. `AppProviders`
(`src/providers/AppProviders.tsx`) は Context/Router
などのグローバルなラッパーをまとめる唯一の場所で, 現状は `BrowserRouter` (`react-router`) と
`ThemeProvider` の2つです. 新しいグローバルな Provider を追加する際は, `main.tsx`
に直接ラップするのではなく, ここに追加してください. `react-router` の `<Link>` など Router
のコンテキストに依存する機能は, この `BrowserRouter` より内側でないと 実行時エラーになります.

`ThemeContext` (`src/contexts/ThemeContext.tsx`) はライト/ダークテーマの状態と `useTheme()`
フックを保持します.

- 初期値は `getSystemTheme()` (`matchMedia("(prefers-color-scheme: dark)")`) で OS の設定から決め,
  `matchMedia` の `change` イベントも購読しているため, アプリを開いたまま OS 側の
  設定を変えるとサイトのテーマも自動追従します.
- `toggleTheme` で手動切り替えすると `hasManualOverrideRef` が立ち, それ以降は (再読み込みするまで)
  OS 側の変更より手動選択を優先します — 自動追従と手動トグルが 競合しないためです.
- `theme` state は `useEffect` で `document.documentElement.dataset.theme` に反映しており,
  `src/styles/theme.css` の `[data-theme="light"|"dark"]` セレクタがこれを参照します. state
  を持つだけでは見た目に反映されない点に注意してください.
- 永続化 (localStorage 等) にはまだ対応していません — 手動選択はページ再読み込みで失われます.
- `ToggleThemeButton` (`src/features/navigation/ToggleThemeButton.tsx`) は動作しますが, まだ Header
  などの実際のUIには組み込まれていません (呼び出し元が無いプロトタイプの状態).

### ディレクトリの規約

- `src/components/` — ドメインを知らない汎用部品.
  - `ui/` — `Button`/`Avatar`/`IconLink`/`IconButton`/`MenuLink`/`Divider`/`CurrentContentBar`/
    `Label` などの原子的な部品と, それらが共有するフック (`useTooltipAlign`,
    `useDismissablePopover`, `useEscapeKey`) や CSS Module (`controlBase`/`menuItemBase`/
    `tabBase`, 「UI コンポーネントの共通パターン」を参照).
  - `layout/` — `Header` とその内部部品 (`Breadcrumb`, `PrimaryNavLinks`,
    `useHeaderResponsiveLayout`, `getBreadcrumb`, 下部ヘッダーのスロットを提供する
    `HeaderBottomSlotContext`/`HeaderBottomPortal`), 全ページ共通の `AppLayout`
    (`HeaderBottomSlotProvider` + `Header` + `<Outlet />`).
- `src/features/<feature>/` — 機能ごとにまとまったコード. 現状 `features/navigation/` (`MenuButton`,
  `NavDrawer`, `CreateButton`, `UserMenuButton`, `ToggleThemeButton`, フラットに直下へ配置),
  `features/user/components/` (`ProfileTabs`/`OverviewSection` など, README.md のファイル構造に
  合わせて `components/` を1段挟む配置 — `features/navigation/` とは階層が異なる点に注意),
  `features/organization/components/` (`OrganizationTabs`/`OrganizationOverviewSection`/
  `OrganizationDocumentsSection`/`OrganizationBookSection`/
  `OrganizationMembersSection` など, 同じく `components/` を挟む配置. 詳細は
  「組織プロフィールページ」「組織の文書一覧 (`OrganizationDocumentsSection`)」
  「組織の入出金一覧 (`OrganizationBookSection`)」「組織の構成員一覧
  (`OrganizationMembersSection`)」を参照) が存在.
- `src/pages/` — ルートと1対1で対応するコンポーネント. 現状 `UserProfilePage`
  (`/users/:userId`), `OrganizationLayout` (`/orgs/:orgId` の親ルート, 「組織が見つかりません」
  判定と `OrganizationTabs` の表示を担う) とその子ルート `OrganizationOverviewPage`
  (`/orgs/:orgId`, index route)/`OrganizationDocumentsPage`
  (`/orgs/:orgId/documents`)/`OrganizationBookPage` (`/orgs/:orgId/book`)/
  `OrganizationMembersPage` (`/orgs/:orgId/members`),
  `NotFoundPage` (`path="*"`) が存在.
- `src/lib/` — 機能にもコンポーネントにも依存しない道具置き場 (現状 `currentUser.ts` のみ).
- コンポーネントのスタイルは CSS Modules をコンポーネントと同じ場所に配置する方式です (`Foo.tsx` +
  `Foo.module.css`), `clsx` で合成します.
- Catppuccin ベースのカラートークン (`--color-header-*`, `--color-border`, `--color-focus` など) は
  `src/styles/theme.css` に定義されており, `src/styles/globals.css` (`@import url("./theme.css");`
  のみの薄いファイル) 経由で `src/index.css` から import されています. `globals.css` は将来
  テーマ以外のグローバルスタイルを追加する場合の置き場として空けてあるので, テーマの内容は
  `theme.css` に足してください. 新しい部品の色は極力これらのカスタムプロパティを参照してください —
  **定義済みだが未使用のトークンが無いか確認してから新しい色を決めてください**
  (`--color-header-logo`/`--color-header-body-em`/`--color-current-content-bar`
  (`MenuLink` の `.active` の左脇の線) はこうして見つかった例です). `theme.css` は
  `:root`/`[data-theme="light"]` (既定) と `[data-theme="dark"]` の2ブロックで構成され,
  後者は前者と同じトークン名を Mocha パレットで1:1に上書きする完全なミラーです — 新しいトークンは
  必ず両方のブロックに追加してください (片方だけだとテーマ切り替え時にそこだけ色が変わらず残ります).
  色以外の共通デザイントークン (テーマに依らず値が変わらないもの) は `globals.css` 自身の
  `:root` ブロックに定義します — 現状 `--borderRadius-medium: 0.375rem`/
  `--borderWidth-thin: 0.0625rem` の2つ (ユーザーからそのままの表記で指定されたため, 既存の
  `--color-*` 系と異なり camelCase を含みます — `stylelint` の `custom-property-pattern`
  指摘は意図的なものとして無視してください). `--borderRadius-medium` は `controlBase`
  (`IconButton`/`IconLink`)・`menuItemBase` (`MenuLink` など)・`NavDrawer` の
  閉じるボタン・`ProfileTabs` の `.tab` など, 「角丸 8px のボタン, またはそのボーダーを
  取り払ったもの」に適用しています. `--borderWidth-thin` はそのうちボーダーが実際に
  表示されているもの (`controlBase` のみ) に適用しています. `CreateButton`/`UserMenuButton`
  の `.menu` (ドロップダウンパネル) や `NavDrawer` の `.drawer` (ドロワー全体) は角丸の数値こそ
  同じ 8px でしたが, ボタンではなくパネル/コンテナのため対象外としました — ボタンの見た目の
  トークンとして導入した経緯を踏まえての判断です. パネル類にも広げるかどうかはユーザーに
  未確認なので, 今後変更する際は先に相談してください.
- `src/index.css` の `body` は `margin: 0` のみで, `padding` は付けません (`Header` が画面の
  上下左右いっぱいに表示されるべきデザインのため).
- フォントは `src/styles/fonts.css` で `--font-body` ("Noto Sans JP") / `--font-mono` ("M PLUS 1
  Code") を定義し, `src/index.css` から import した上で `:root` (本文) と `code`/`pre`/`kbd`/`samp`
  (等幅) にそれぞれ適用しています. 実体は `index.html` の Google Fonts の `<link>` で読み込んでおり
  (現状 400/700 のみ), 太さを増やす場合は `index.html` の `family=...:wght@...`
  にも追加してください.

### export の方法

宣言 (`function`/`const`/`type` など) には `export` を付けず, ファイル末尾にまとめて
`export { Foo, Bar };` (型は `export { type Foo, Bar };`) の形で1箇所に集約します. `export default`
や, 宣言と同時に `export function Foo() {}` のように書くスタイルは使いません. 自動生成ファイル
(`src/components/ui/emblem-names.ts` など) も対象で, 生成元のスクリプト (`scripts/build-sprite.mjs`)
の出力テンプレート側を直してください. この規約は `src/` (と, それを生成するスクリプト) が対象です —
`header-src/` は非対象のプロトタイプ資料なので, 独自の `export function Foo()`
スタイルのまま揃えなくて構いません.

## UI コンポーネントの共通パターン

似た見た目・挙動のコントロールは土台となる CSS Module (`○○Base.module.css`) を共有し,
各コンポーネント 自身の `Foo.module.css` にはタグ固有のリセットだけを書く構成にしています.
新しい部品を追加する際は まずこれらのパターンに当てはまらないか検討してください.

### 正方形アイコン系: `controlBase.module.css`

`IconButton`/`IconLink` が使う土台. サイズ・角丸・配色・hover/focus/active・CSS のみの
ホバー時ツールチップを持ちます. 使う側は `clsx(base.root, styles.root, className)` のように
両方のクラスを合成してください.

- **サイズ**: `--control-size` (既定 35px) を高さ・最小幅の両方に使い, 2箇所のハードコードが
  食い違うのを防いでいます. `width: fit-content` は CSS Grid の子要素になったときに既定の
  `justify-items: stretch` で正方形が崩れるのを防ぐためです — 中身が `--control-size` より
  小さければ正方形, 広ければ (ラベルや `dropdown` の追加アイコンなどで) その分だけ横に広がります.
- **`dropdown?: boolean`** — `icon` の右隣に `IconCaretDownFilled` (`size={13}`) を並べます.
  開閉の実際の挙動は持たず, 呼び出し側が `onClick` で実装します. 2つのアイコンの合計幅が
  `--control-size` 相当に達し単一アイコン時のようなクリアランスが自然には生まれないため, `.dropdown`
  修飾クラスで `padding-inline: 5.5px` (6.5px の見た目のクリアランスから border 1px を差し引いた値)
  を明示的に補っています.
- **`text?: string`** — アイコンの右隣に可視のラベルテキストを表示します (例: Header の検索ボタン
  `<IconButton icon={IconSearch} label="検索" text="検索…" stretch />`). `text` がある場合は
  `aria-label` を付けません (可視テキストがアクセシブルネームを兼ねるため) — 結果として CSS
  ツールチップ (`[aria-label]` 依存) も自動的に出なくなります.
- **`stretch?: boolean`** — `controlBase` の正方形・中央寄せを上書きし, `width: 100%`・
  `justify-content: flex-start` の横幅いっぱい・左揃えにします (`.stretch`).
- **`hideTooltip?: boolean`** — CSS ツールチップを非表示にします (`aria-label` 自体は残るので
  アクセシビリティは維持). ボタン直下 (`top: 100%`) に別のポップオーバーを開く場合, クリック時点で
  ボタンに `:hover` が乗ったままなのでツールチップとポップオーバーが重なって表示されてしまいます —
  ポップオーバーの `open` state をそのまま `hideTooltip={open}` として渡して防いでください
  (`CreateButton`/`MenuButton` が実例).
- **ツールチップの位置**: 既定は `left: 50%; transform: translateX(-50%)` の中央寄せですが,
  画面端に近いと見切れます. `useTooltipAlign` (`src/components/ui/useTooltipAlign.ts`, `label`
  の文字数からツールチップ幅を概算し, hover/focus 時に `getBoundingClientRect()` で画面端との
  距離を判定 — 疑似要素は直接計測できないため文字数ベースの概算です) が返す `ref`/`align`/
  `onMouseEnter`/`onFocus` をトリガー要素にそのまま渡し, `align` を `data-tooltip-align`
  属性として設定してください. `controlBase` 側は `.root[data-tooltip-align="left"|"right"]::after`
  で中央寄せを上書きします. **戻り値をオブジェクトのまま JSX に展開する (`ref={tooltip.ref}`
  のようにプロパティアクセスする) と `eslint-plugin-react-hooks` の `react-hooks/refs`
  が誤検知するため, 必ず分割代入してから個別に渡してください.** `controlBase`
  を使わない独自のツールチップ (`.homeLink` など) を実装する場合も同じフックと `data-tooltip-align`
  の仕組みを流用してください.
- **ツールチップの背景色** (`--color-hover-background`, `theme.css` で Catppuccin `overlay2` を指す)
  はツールチップ専用のトークンです — `controlBase.module.css` と `Header.module.css` の `.homeLink`
  の2箇所以外からは参照されていません.

`src/components/ui/Icon.tsx` は `@tabler/icons-react` のアイコンをラップしますが, `icon`/`size`
以外の props (`aria-hidden` など) はそのまま `<svg>` へ転送されます. ボタン/リンク側に `aria-label`
があるような装飾目的のアイコンには `aria-hidden="true"` を渡してください.

`IconLink` の `icon` prop は `TablerIcon` 専用です. `Emblem` (`fth-oasis-icon` など, git LFS
管理の自前 SVG スプライト) のように `TablerIcon` でない中身をリンクにしたい場合は `IconLink`/
`controlBase` を使わず, 同じ見た目のツールチップだけを個別に実装します — Header のロゴ (`.homeLink`)
が実例です. `Emblem` に `label` を渡さなければ自動的に `aria-hidden` になるので, リンク側の
`aria-label` と二重に持たせる必要はありません. `.homeLink` の `color` は他のヘッダー 要素と違い
`--color-header-logo` (Catppuccin `text`) を使っています — `Emblem` の SVG は `fill="currentColor"`
なので, この `color` がそのままアイコンの塗り色になります.

### 横並びリスト行系: `menuItemBase.module.css`

`NavDrawer`/`CreateButton`/`UserMenuButton`/`DocumentFilterSidebar` の中の各行が使う,
`controlBase` とは別系統の土台です. 正方形ではなく横幅 100%・中身は左揃え・ボーダーは
通常時もhover時も常に非表示 (hoverは背景色の変化のみ) です. `.root` には
`box-sizing: border-box` を明示しています (`<a>`/`<Link>` は既定で `content-box`
のため, これがないと `width: 100%` に `padding` が上乗せしてはみ出します). `font-size`
は `.root` 自体には持たせず `font: inherit` のままにしています — `NavDrawer.module.css`
の `.drawer`/`DocumentFilterSidebar.module.css` の `.root` (呼び出し側のコンテナ) で
`font-size: 0.9rem` (ヘッダーのパンくず, `Breadcrumb.module.css` と同じ値) を指定し,
カスケードで反映させる形にしています — `CreateButton`/`UserMenuButton`
のメニューなど, この指定をしていない呼び出し元は引き続き既定サイズ (1rem)
のままです (「サイドバーとメニュードロワーの文字サイズをパンくずと揃えてほしい」
という依頼が対象を明示していたため, 共有する `menuItemBase.root` 自体を
変更せず, 対象の呼び出し元だけスコープする形にしています).

`MenuLink` (`src/components/ui/MenuLink.tsx`) はこの土台の上にアイコン+可視ラベルを乗せた
リンクです. `to` が `/^https?:\/\//` にマッチすれば `<a href>` (外部リンク), それ以外は
`react-router` の `<NavLink to={...} end>` として描画します — `<Link>` ではなく `<NavLink>`
なのは, 現在のパスと `to` が一致する項目を強調するためです. `end` を付けているのは, 付けないと
`to="/"` が常にどのパスでも一致してしまう (NavLink は既定でプレフィックス一致) ためで,
現状ネストしたサブページが無いこととも合わせ, 完全一致で揃えています. 一致する項目には
`.active` (menuItemBase 側で定義. 背景は hover と同じ, 文字は太字+`--color-header-body-em`
(Catppuccin `text`) — 元は背景のみで区別していましたが, 「選択中の項目の文字を太字に,
text色にしてほしい」という依頼で追加しました. `DocumentFilterSidebar`/
`DocumentSortDropdown` も同じ `menuItemBase.active` を使うため, 併せて同じ見た目になります)
を付けつつ, `NavLink`
の children-as-function (`{({ isActive }) => ...}`) で `isActive` が真の場合のみ
`CurrentContentBar` (後述) を差し込みます. 外部リンク (`<a href>`) 側は URL
がそもそも現在のパスと一致し得ないため対象外です. `onClick?: () => void`
は任意で, ポップオーバー/ドロワーを閉じる目的で使います.

`CurrentContentBar` (`src/components/ui/CurrentContentBar.tsx`) は「現在選択中/表示中」を示す,
両端が丸い太さ3pxの青線 (`--color-current-content-bar`) だけを持つ汎用部品です.
`position: absolute; top: 0; bottom: 0;` の独立した `<span>` として重ねる作りで,
`box-shadow: inset` を使わないのは, 親要素の `border-radius` に沿って角が丸まってしまうのを
避けるためです — `menuItemBase.root` (`border-radius: 8px`) の上に乗せてもバー自身の
`border-radius: 999px` だけで丸まり, ボタンの角には影響されません. 使う側は親要素に
`position: relative` を指定した上で配置してください (`menuItemBase.root` は既に指定済み).
`left: -6px` は `menuItemBase.root` の `margin: 0 6px` (バーがボタンと重ならず数px
離れて収まるよう, 左右に用意した隙間) を前提にした値です — 別の場所で使う際, 親要素の
左右の余白が 6px 分無い場合はこの値も調整してください. 現状 `MenuLink` の `.active`
でのみ使っていますが, 名前の通りリスト行など他の「現在選択中」を示したい箇所でも
流用できる想定です.

`icon`+`label` の定型に収まらない行 (`NavDrawer` の「問題を報告」ボタン, `UserMenuButton` の
プロフィール行) は `MenuLink` を使わず `menuItemBase.root` を直接 `<button>`/`<Link>` に適用して
個別実装しています.

`NavDrawer` 内の「規則･資料」(`/materials`)/「組織」(`/orgs`) は, 以前は実際のドメインが
未確定のため `https://<subdomain>.io/{documents,organizations}` という外部URLの
プレースホルダーでしたが, 内部ルーティングへ差し替え済みです. どちらも実ページは
まだ無いため (前者は未着手, 後者は `/orgs/:orgId` はあっても一覧page `/orgs` 自体は
無い), 現状はリンク先が `NotFoundPage` (404) になります.
「規則･資料」は「文書」(`/documents`, `PrimaryNavLinks`/`CreateButton` の
「全ての文書」「新たに文書を作成」が指す, 組織が作成する文書の機能) とは別物である
点に注意してください — 当初 `getBreadcrumb.ts` の `documents` に「規則・資料」を
割り当てていましたが, これは「規則･資料」がまだ外部URLだった頃の名残りで,
実際には「文書」の方を指すべき値だったための誤りでした. 現在は `documents: "文書"`/
`materials: "規則・資料"`/`orgs: "組織"` (`/orgs/:orgId` の判定より後に評価されるため,
`/orgs` 単体のときだけ使われます) とそれぞれ独立させています.

### タブバー系: `tabBase.module.css`

`ProfileTabs`/`OrganizationTabs` が使う, ヘッダー下部に隙間なく続けて表示するタブバー共通の
見た目です (「Header 固有の実装」の「下部ヘッダーのスロット」を参照). `.root`
(`padding: 0 16px` の横並び) / `.tab` (選択中以外は `--color-header-body-em`
= Catppuccin `text`. 以前は `--color-header-body` = `overlay2` でしたが,
選択中/非選択中を色ではなく太字+下線だけで区別するよう変更しました. `font-size`
はヘッダーのパンくず (`Breadcrumb.module.css`) と同じ `0.9rem`
にしています — 「ヘッダーのタブテキストのサイズをパンくずと揃えてほしい,
文字色はそのまま」という依頼のため, `color` はそのまま変更していません) / `.selected`
(`::after` の絶対配置による下線. `CurrentContentBar` と同様, 親の `border-radius`
を気にせず独立させるための構造で, 詳細は下記 `ProfileTabs` の実装解説を参照) /
`.count` (件数バッジ, 背景は `--color-background`) を提供します. タグ非依存 (`class` の
みで完結) なので, `ProfileTabs` (状態切り替えの `<button>`) と `OrganizationTabs`
(実際にルーティングする `<NavLink>`) のどちらからも同じクラスをそのまま使えます —
新しいタブバーを追加する際もこの土台を使ってください.

`Label` (`src/components/ui/Label.tsx`) は背景透過+`--borderWidth-thin`のボーダーの
丸いタグです. 元は `DocumentCard` の公開/非公開ラベル専用の CSS でしたが,
`OrganizationHeaderBox` の組織種別ラベルでも同じ見た目が必要になったため汎用部品として
切り出しました (README.md の `components/ui/Label.tsx` に対応). 種類を示す短いラベル
全般 (状態, カテゴリなど) に使う想定です.

### ポップオーバー/ドロップダウンの共通パターン

`CreateButton` (GitHub ヘッダーの New ボタンを参考にしたドロップダウン) と `UserMenuButton`
(アバターのメニュー) はどちらもこの型です:

- 開閉状態・範囲外クリック/Escape での自動クローズは `useDismissablePopover<T>()`
  (`src/components/ui/useDismissablePopover.ts`) にまとめてあります.
  `{ open, wrapperRef, toggle,
  close }` を返すので, `wrapperRef` をトリガーとパネルの両方を包む
  `position: relative` な `<div>` に付けてください. 内部で `useEscapeKey`
  (`src/components/ui/useEscapeKey.ts`, `NavDrawer` のEscape処理とも共用) を使っています.
- パネル自体は `position: absolute; top: calc(100% + 4px);` でトリガーの下に開き, 枠線・角丸・
  box-shadow を持つ独立したカードとして表示します (`CreateButton.module.css`/
  `UserMenuButton.module.css` の `.menu` が実例). 横位置はトリガーの位置に応じて `left: 0`
  (`CreateButton`, 画面中央寄り) か `right: 0` (`UserMenuButton`, 画面右端寄り) を使い分けています —
  画面端でのはみ出し検知は (`useTooltipAlign` のような) 未実装です.
- 中身の各行は `menuItemBase.module.css` (`MenuLink`, または独自の `<button>`) を使い,
  区切りが要る場合は `Divider` を挟みます.
- トリガーが `IconButton` の場合は `hideTooltip={open}` を渡してください (「正方形アイコン系」参照).
- `UserMenuButton` のプロフィール行 (`.userName`/`.userEmail`) は `white-space: nowrap`
  にしています — `.menu` は `min-width: 240px` (最小値のみで `width`/`max-width`
  は指定していない) なので, 折り返しさえ起きなければ内容が長いときにパネル自体が
  自然に (block/flex の shrink-to-fit で) 広がります. 折り返しを許すと, 長いメール
  アドレスなどが `min-width` の範囲内で複数行に割れてしまうため, 折り返さずパネルの
  幅で吸収する方針にしています.

`NavDrawer` (`open`/`onClose` を外部から制御される, 左からスライドインする全画面ドロワー) は
上記と構造が違うため同じフックは使いませんが, Escape 処理だけ `useEscapeKey(open, onClose)`
で共通化しています. 外側クリックの代わりに全画面のオーバーレイ `<button>`
(`tabIndex={-1} aria-hidden="true"`, クリックで `onClose`) を使っています.

`NavDrawer` の先頭には `drawerHeader` (左に `<Emblem name="fth-oasis-icon" />`, 右に閉じるボタン)
があります. 閉じるボタンは正方形の1箇所だけの利用のため `menuItemBase` は流用せず
`NavDrawer.module.css` 内に単独で定義しています. `.drawer` は `overflow: hidden auto;` (x=hidden,
y=auto を明示するショートハンド) としています — 片方の軸だけ `visible` 以外にすると CSS
の仕様上もう片方も暗黙的に `auto` 扱いになり, わずかなはみ出しでも横スクロールバーが 出てしまうため,
横スクロールを一切許可しないコンテナでは両軸を明示してください. `.drawer` は
左端が画面外にスライドして隠れるため, `border-radius: 0 8px 8px 0;` で右側の角だけを丸めています
(`8px` は他のパネル/ボタン類と揃えた値です).

## Header 固有の実装

`Header.tsx` (`<header className={styles.header}>`) は縦に2段の構造です. `.header` 自体は
`flex-direction: column` で, `background`/`border-bottom: 1px solid var(--color-border)`
もこの最上位の要素にだけ付けています — 下段 (後述の「下部ヘッダーのスロット」) が
あってもなくても, ヘッダー全体が常に1つの区切られたブロックに見えるようにするためです.

1段目 (`.top`, 固定 `height: 60px`) が常時表示される行で, `.left` (ハンバーガー・ロゴ・
パンくず)/`.center` (検索, `flex: 1 1 auto` で残り幅いっぱいに広がりつつ
`justify-content: flex-end` で中身は右詰め)/`.right` (`margin-left: auto` で右詰め,
それ以外のアイコン群とアバター) の3つの `<div>` に分けた `display: flex` (CSS Grid
ではありません) の1行レイアウトです. `.top` 自体の `gap` と `.right` 内の `gap` は両方
`10px` に揃えています (検索ボタンが正方形に縮んだ際, 隣接ボタンとの隙間が食い違わないように
するため). 新しく横並びのセクションを追加する場合もこの3分割に沿ってください.

2段目は `<div ref={setSlot} />` という中身の無い要素で, 「下部ヘッダーのスロット」
(`HeaderBottomSlotContext.tsx`/`HeaderBottomPortal.tsx`) です. `ProfileTabs`
のようにページ固有の内容をヘッダーの一部として (実際に `<header>` の内部の DOM として)
表示したい場合に使います. `AppLayout.tsx` 上で `Header` と `<Outlet />` は兄弟要素のため,
props で直接渡すことができません — `AppLayout` を `HeaderBottomSlotProvider` で包み,
`Header` がスロットの `<div>` の ref を `setSlot` として Context に公開し,
ページ側 (`<Outlet />` の中身) が `HeaderBottomPortal` (`createPortal`) でその DOM
ノードへ描画する, という構成です (`ThemeContext.tsx` と同様, Provider コンポーネントと
フックだけを export し, 生の Context オブジェクトはファイル内に閉じています). スロットが
空の `<div>` は高さ 0 に潰れるだけなので, 何も描画しないページでは単純な1行ヘッダーに戻ります.
このスロットは Header 自身がどのページの, どんな内容かを一切知らない汎用の差し込み口です
— `Header.tsx` (`components/layout/`, ドメインを知らない汎用部品) が
`ProfileTabs` (`features/user/`, ドメイン固有) を import しないで済むのはこの設計のためです.

- **パンくず** (`Breadcrumb.tsx`) — `getBreadcrumb(pathname)` (`getBreadcrumb.ts`) が現在パスを
  `string[]` (各要素が1階層分の表示名) に変換し, `Breadcrumb` が `" / "` で結合して**配列の
  最後の要素だけ** `.current` (`font-weight: 700`) でボールド表示します. 既定では2階層まで
  表示しますが, `settings`/`documents`/`materials`/`orgs`/`meetings`/`books` は階層に関わらず
  1階層目だけを日本語の表示名で表示します (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` に列挙—
  同様の性質を持つルートを新設したらここに追加). `/users/${userId}` (ユーザーのプロフィール
  ページ) も同様に1階層だけの特別扱いですが, `SPECIAL_ROOT_LABELS` とは別ロジックです —
  `userId` が `currentUser.id` と一致すればパス文字列ではなく `currentUser.name` を,
  一致しなければ (実データが無いためどのみち「ユーザーが見つかりません」になりますが)
  `userId` をそのまま表示します.
  `issues`/`pulls`/`notifications` も同様に追加済みで, それぞれ「指摘事項」「修正提案」「通知」
  です — `issues`/`pulls` は他の特殊パスと違い, パンくずだけでなく `PrimaryNavLinks`/`NavDrawer`
  のラベル (ヘッダーのツールチップ/ドロワーの表示文言) もこの表記に揃えるようユーザーから
  指定されたため, そちらも変更済みです (`CreateButton` の「新たに改善点を指摘」は動詞句のため
  対象外としています). `logout` はユーザー確認の結果, 専用画面になる想定のため
  意図的に `SPECIAL_ROOT_LABELS` へ追加していません — 抜けているわけではないので,
  新たに追加しないよう注意してください.
- **レスポンシブな折り畳み** (`useHeaderResponsiveLayout.ts`) — `breadcrumbRef`/
  `searchWrapperRef`/`rightRef` の位置を `useEffect` (初回計測 + `resize` イベント, `pathname`
  が変わったら再計測) で測り, 2段階のブレークポイントを判定します.
  - パンくず左端 〜 検索ボタン右端が 500px を切ったら `searchCollapsed` — `IconButton` から
    `text`/`stretch` を外し, 通常の正方形アイコンボタンに切り替えます.
  - パンくず左端 〜 `.right` 右端 (`UserMenuButton` を含む) が 640px を切ったら `navCollapsed` —
    `PrimaryNavLinks` (「作成」「全ての通知」「アバター」以外の主要ナビアイコン) をまるごと
    描画から外します. `.right` は `margin-left: auto` で常にヘッダー右端に張り付いているため,
    中身をどれだけ隠しても右端の座標は変わりません — そのため `navCollapsed`
    の判定結果が自分自身の計測対象に影響するフィードバックループにはなりません. 新しく `.right`
    内のアイコンを非表示にする条件を追加する場合もこの性質を崩さないでください.
  - `.center` に `min-width: 0` を付けると, 検索ボタンがゼロ幅まで潰れて `.right` と重なって
    見える不具合になるため付けていません — `IconButton` 自体が `min-width: var(--control-size)`
    を持つので, `.center` はその最小幅を自然に尊重させる必要があります.
- 検索ボタンの横幅上限は `IconButton.module.css` の `.stretch` で
  `max-width: calc(var(--control-size) * 4)` (140px) としています. `.center` 自体には
  max-width を付けていません — 以前は `max-width: 720px` を付けていましたが, ウィンドウ幅が
  それを超えると `.center` の伸長がそこで頭打ちになり, 余った幅は `.right` の
  `margin-left: auto` に吸われて `.center`/`.right` の間に隙間ができ, 検索バーが画面中央
  付近に取り残されて見える不具合になっていました. 検索ボタン自身が `.stretch` の 140px
  で頭打ちになるため, `.center` 側で重ねて上限を設ける必要はありません.

## プロフィールページのタブ (`ProfileTabs`)

`src/features/user/components/ProfileTabs.tsx` (README.md のファイル構造に合わせ,
`features/user/components/` に配置 — `features/navigation/` のようにフラットではなく `components/`
を1段挟みます) は GitHub の User Profile ページを参考にしたタブバーです.
`src/pages/UserProfilePage.tsx` (`/users/:userId`) がページの唯一の中身として,
`HeaderBottomPortal` (前述の「Header 固有の実装」を参照) 経由でグローバルヘッダー
(`Header.tsx`) 内部のスロットへ描画しています — アバターやユーザー名などのプロフィール情報は
表示しません. 見た目自体は `tabBase.module.css` (前述の「UI コンポーネントの共通パターン」を
参照) を使っており, `ProfileTabs` 自身の CSS Module はありません.

- `documentCount` prop (件数) が 0 または未指定の場合, 「文書」タブ自体を描画しません
  — 「概要」タブは常に表示されます. 件数はまだ実データが無いため, 呼び出し側でダミーの
  数値を渡す想定です. **「栞」タブは依頼により削除しました** — 以前は `bookmarkCount`
  prop で同様に出し分けていましたが, `ProfileTabsProps`/`tabs` 配列/呼び出し元
  (`UserProfilePage.tsx` の `DUMMY_BOOKMARK_COUNT`) ごと削除しています.
- 各タブはラベルの左に `Icon` (`size={16}`, `aria-hidden="true"`) を表示します —
  概要 `IconHome`/文書 `IconFileText` (組織側の同名タブと共通), 会計
  `IconReceiptYen`/会議 `IconCalendarTime`/構成員 `IconUsers`/設定 `IconSettings`
  (いずれも `OrganizationTabs`, 後述). `tabBase.module.css` の `.tab` は元々
  `gap: 6px` を持っていた (アイコン追加を見越した値) ため, 追加の CSS 変更は不要でした.
- `role="tablist"`/`role="tab"`/`aria-selected` を持たせた素朴な ARIA Tabs パターンです (コンテナは
  `<nav>` ではなく `<div role="tablist">` — `<nav>` は landmark role のため `tablist` role
  と併用できません). `OrganizationTabs` (後述) と違い実際のルーティングは伴わない,
  内部 `useState` だけの状態切り替えのため, `<button role="tab">` を使っています.
- 選択状態自体は内部の `useState` で完結していますが (既定は先頭の `"overview"`),
  `onChange` prop で選択キーを呼び出し元に通知します. `UserProfilePage` はこれを
  自分の `useState` にミラーし, `selectedTab === "overview"` のときだけ
  `OverviewSection` を描画する, という形で本文の切り替えに使っています —
  「文書」タブは対応する本文コンポーネントがまだ無いため, 選択しても何も表示されません.
  今後実装する際は同じパターン (`selectedTab` の分岐を増やす) で接続してください.

`src/pages/UserProfilePage.tsx` (`/users/:userId`) は `useParams()` で取った `userId` が
`currentUser.id` と一致しない場合は「ユーザーが見つかりません」を表示します — 他ユーザーの実データが
無いための暫定挙動です. プロフィールページを `/` 直下ではなく `/users` 配下に切り出しているため,
`/issues` のような (まだページの無い) 他機能の予約パスとの衝突は起きません (詳細は
「プロジェクトについて」の「現状できていないこと」を参照).

## プロフィールページの概要タブ (`OverviewSection`)

`src/features/user/components/OverviewSection.tsx` は「概要」タブの本文です. README.md
のファイル構造に合わせ, データ層は `features/user/` 直下に `types.ts` (`Organization`/
`DocumentSummary`/`DocumentVisibility`)・`mockData.ts` (`MOCK_ORGANIZATIONS`/
`MOCK_DOCUMENTS`, 実データ取得 API が無いためのダミーデータ. 他のページでも使い回せるよう
`components/` の外, feature 直下に置いています) として置き, 表示側は
`features/user/components/` 配下に分割しています (`ProfileSidebar`/
`OrganizationListItem`/`PinnedDocuments`/`DocumentCard`).

- `DocumentVisibility` (公開/非公開) は, `tsconfig.app.json` の `erasableSyntaxOnly`
  により実際の TypeScript `enum` 構文が使えないため, `const オブジェクト + typeof
  ... [keyof typeof ...]` で導出した union 型で enum 相当のものを表現しています —
  `DocumentVisibility.Public` のように値としても, 型としても同じ名前で使えます.
  真偽値ではなくこの形にしているのは, 将来公開範囲が増えても (例: 組織内限定など)
  型を壊さず選択肢を追加できるようにするためです.
- `OverviewSection.module.css` の `.root` が `max-width: 1280px; padding: 24px 16px;`
  の `display: grid; grid-template-columns: 1fr 3fr;` で, 左をサイドバー
  (`ProfileSidebar`), 右をメイン (`PinnedDocuments` を包む `<main>`) に1:3で分割します.
  上下の `padding: 24px` はタブ直下に本文が詰まって見えないための独自の余白で,
  指示された値ではありません.
- `ProfileSidebar` の「ユーザーアバター」+「ユーザー名・メールアドレス」の行,
  `OrganizationListItem` の「組織アバター」+「組織名・役職」の行は, いずれも
  **アバターが先 (左), その右にテキスト**の順です (最初はユーザー側だけ逆順で実装し,
  後で揃える形になった経緯があります — 新しく同種の行を追加する際もこの順に揃えてください).
  ユーザーアバターは `Avater` (`src/components/ui/Avatar.tsx`) の `size="large"`
  (50px), 組織アバターは `size="medium"` (40px, `OrganizationListItem` のみ
  他より一回り小さい) で, どちらも `aspect-ratio: 1` の正方形/円形です.
  組織アバターのみ `shape="square"` (角丸 `--borderRadius-medium`, 既定は
  `shape="circle"`) を指定しています — `border` (色・太さ) 自体は形状によらず
  共通の `.avatar` ルールにしているため, 「組織アバターのボーダーをユーザーアバターと
  揃える」という要件は自然に満たされます. `size` は `"small"`/`"medium"`/`"large"`
  (よく使う大きさの preset) に加えて, 数値も直接受け付けます (例:
  `OrganizationHeaderBox` の `size={100}`, `ActivityCard` の `size={40}`,
  `OrganizationSidebar` の `size={35}`) — 1箇所でしか使わないような大きさの
  たびに新しい preset 名を増やすのを避けるための設計です (`xlarge` という
  preset が一度作られましたが, 数値指定に置き換えて削除した経緯があります).
  なお, 「隣接するテキストの高さに動的に合わせる」(`flex` の stretch +
  `aspect-ratio` で幅を追従させる, `size="fill"` という名前で実装していたもの)
  という案を, ユーザーアバター (2行分の高さ) →組織アバター (同じく2行分)
  の順で**二度**試しましたが, どちらも最終的に固定サイズへ戻しています —
  `.avatar` の `flex: none` や flex item 既定の `min-width`/`min-height: auto`
  を上書きしてもなお, `width`/`height` が両方 `auto` かつ `aspect-ratio`
  を持つ置換要素 (`<img>` など) は flexbox の仕様上 `align-items: stretch`
  の対象外になる (画像本来の実サイズで描画される) ため, 単純な
  `min-width/height: 0` だけでは解決しません. `height: 100%`
  (`auto` を避けて stretch 対象にする) を試すと, 今度は逆にテキスト側
  (`.text`, 同じく高さ `auto`) まで一緒に引き伸ばされて双方が異常に
  巨大化する, 別の問題が発生しました. 動的サイジングを再挑戦する場合は
  ResizeObserver 等での実測ベースのアプローチを検討してください —
  純粋な CSS (flex stretch) でのアプローチはこれで二度とも実用に至って
  いません.
- `OrganizationListItem` はアイコン・組織名・役職の行全体が1つのボタンです —
  `menuItemBase.root` (前述) を直接 `<Link to={`/orgs/${organization.id}`}>`
  に適用しています (`UserMenuButton` のプロフィール行と同じパターン). `Organization`
  (`features/user/types.ts`) の `id` は `features/organization/mockData.ts` の
  `MOCK_ORGANIZATION.id` (`test-org`) と一致するものだけ実際のページが存在し,
  それ以外 (`student-council`/`newspaper-club`) はダミーのリンク (404) です.
  `menuItemBase.root` の `padding: 8px 12px` はアイコン1つ分の高さ (35px 前後)
  を想定した値で, 40px のアバターを乗せるこの行には上下が余分だったため,
  `a.root { padding-top: 0; padding-bottom: 0; }` (タグ込みセレクタで
  `menuItemBase` とのカスケード順に依存せず確実に上書き) で打ち消しています.
- `DocumentCard` は `.root` に `padding: 16px` (四方均等) を持たせ, タイトル行/説明文/
  メタ情報 (3行目) の間隔は個別の margin ではなく `.root` の `gap: 16px`
  で揃えて統一しています.
  - タイトル行: `IconFileText` (`size={20}`, リンクにはしない, 独立した要素) + 文書名
    (`<Link>`, 太字・`--color-link` で青くしリンクであることを示す, サイズ `1rem`)
    + 状態ラベル (`DocumentVisibility`, `Label` (前述の「UI コンポーネントの共通パターン」
    を参照) を使用) を左詰めで並べます (space-between で右に追いやらないよう, `.title` の `flex` は
    `0 1 auto` — 伸びて後続の要素を右に追いやらないよう `flex-grow: 0`
    のままにしています. 一度 `flex: 1 1 auto` にして省略記号 (`text-overflow:
    ellipsis`) を効かせようとしたところ, 状態ラベルが右端に追いやられてしまったため
    元に戻した経緯があります — 長い文書名の省略が必要になったら, ラベル側を
    `flex-shrink: 0` で固定幅化した上で `.title` 側だけ伸縮させるなど,
    左揃えを崩さない形で対応してください).
  - 3行目 (`.meta`): 「`IconBuilding` (`size={16}`) + 組織名」と「`IconFile`
    (`size={16}`) + ファイル種別」をそれぞれ `.metaGroup` としてまとめ,
    `.metaGroup` 間の `gap` を通常のアイコン-文字間より広くとる (`24px`)
    ことで別の情報であることを示しています. 組織名はボーダー無しのボタン
    (`<Link>` にホバー背景だけを付けたもの) として `/orgs/${organizationId}`
    (ホスト名を `~` と表記した場合の `~/orgs/組織ID` 相当 — `~` の意味は下記コラムを参照)
    にリンクします. 組織プロフィールページ (`/orgs/:orgId`, 詳細は「組織プロフィールページ」
    を参照) を実装した際に, 実在しない `/${organizationId}` だった旧リンクを
    この実際のルートへ差し替えています.
  - 文書名の `<Link>` 以外の文字・アイコン (タイトル行の `IconFileText`, 状態ラベル,
    説明文, 3行目一式) はすべて `--color-body-subtext` (Catppuccin `subtext1`,
    `theme.css` に今回追加したトークン) で統一しています — 「これは実際にリンクである」
    という視覚的な合図を `--color-link` の青に一本化するためです.
  - リンク先はまだ実装していない文書ページ想定で `/orgs/${organizationId}/documents/${documentId}`
    の形にしています (`/${userId}/...` ではなく組織に紐付く点に注意. こちらも組織プロフィール
    ページ実装時に `/orgs/` 配下へ差し替えています). カード自体の `border`/`border-radius`
    は指定が無かったため `--borderWidth-thin`/`--borderRadius-medium` を流用しています.

**`~` 表記について**: ユーザーからの指示文中の `~` はホスト名 (サイトのルート, 例:
`https://fth-oasis.example`) を指します. `~/組織名` は「ホスト名直下の, その組織のパス」
という意味です. 以降の指示でも同じ意味で使われる想定です.

`DocumentCard` の説明文 (`.description`) が中央揃えに見える不具合を調べたところ,
原因は Vite の React テンプレート由来の `src/App.css` (`#root { text-align: center;
... }`, `App.tsx` から `import "./App.css"` されているだけで他に用途は無かった)
が, 明示的に `text-align` を指定していない要素すべてに中央揃えを継承させていたためでした.
個別のコンポーネント側で上書きするのではなく, 根本原因である `App.css`
とその import ごと削除しています — 同様に「揃えたはずなのに揃わない」ことがあれば,
まずこの手のグローバルな残骸が無いか (`src/index.css`/`src/styles/` 以下) 疑ってください.

## 組織プロフィールページ

`/orgs/:orgId` 配下は `src/pages/OrganizationLayout.tsx` を親ルートとする
ネストしたルートです (`App.tsx` の `<Route path="/orgs/:orgId" element={<OrganizationLayout />}>`
配下に index route `OrganizationOverviewPage`/`path="documents"` の
`OrganizationDocumentsPage` を並べています). `OrganizationLayout` が
`UserProfilePage` の「見つからない」判定 (`orgId` が `MOCK_ORGANIZATION.id`
(`"test-org"`) と一致しない場合に「組織が見つかりません」を表示) と
`OrganizationTabs` (下記) の表示をまとめて担い, 各ページ (`OrganizationOverviewPage`/
`OrganizationDocumentsPage`) は本文コンポーネントを描画するだけの薄いラッパーです —
`/orgs/:orgId` 配下のページが増えるたびに同じ判定/タブ表示を書き直さずに済むよう,
文書タブ (`OrganizationDocumentsPage`) を追加したタイミングでこの形に切り出しました
(切り出す前は `OrganizationProfilePage.tsx` という1ファイルが両方を兼ねていました).
React Router のネストしたルートでは, 親ルート (`/orgs/:orgId`) の `useParams()`
の結果は `<Outlet />` 経由で描画される子ルート側でもそのまま (マージされた形で)
取得できるため, `OrganizationDocumentsPage` 自身は `orgId` を扱う必要がありません.
データ層は `features/organization/` 直下に `types.ts`/`mockData.ts`, 表示側は
`features/organization/components/` 配下に分割しています.

- **タブ (`OrganizationTabs`)** は `ProfileTabs` と見た目こそ `tabBase.module.css`
  (前述) を共有していますが, 実装は別物です. `ProfileTabs` は本文切り替えが
  `useState` だけで完結する (URL が変わらない) のに対し, `OrganizationTabs`
  は各タブが実際の `<NavLink>` (概要 `/orgs/:orgId` (`end` 必須 — 無いと他の全タブでも
  概要が選択中に見えてしまいます)/文書 `/orgs/:orgId/documents`/会計
  `/orgs/:orgId/book`/会議 `/orgs/:orgId/meetings`/構成員 `/orgs/:orgId/members`/
  設定 `/orgs/:orgId/settings`) です — 概要/文書以外はいずれもまだ実ページが無いため,
  選択すると `NotFoundPage` (404) が表示されます (ヘッダーの下部スロットも失われます.
  「プロジェクトについて」の「現状できていないこと」を参照). **「設定」のリンク先は
  依頼文に明記が無かったため, 他のタブと同じ `/orgs/:orgId/設定パス` の形で
  `/orgs/:orgId/settings` と推測しています** — 別のパスにしたい場合は
  `OrganizationTabs.tsx` の `tabs` 配列を修正してください. 各タブはラベルの左に
  `Icon` (`size={16}`, `aria-hidden="true"`) を表示します — 概要 `IconHome`/文書
  `IconFileText`/会計 `IconReceiptYen`/会議 `IconCalendarTime`/構成員 `IconUsers`/
  設定 `IconSettings` (`ProfileTabs` の項も参照. 依頼文の `IconRecipientYen`/
  `IconSetting` は `@tabler/icons-react` に存在しない名称だったため, それぞれ
  実在する `IconReceiptYen`/`IconSettings` に読み替えています — 前者は
  `CreateButton` の「新たに会計申請を作成」, 後者は `DocumentFilterSidebar`
  の「管理下」フィルターで既に使われているアイコンと同じです).
- **ヘッダーの Box (`OrganizationHeaderBox`)** は `height: 116px; margin: 24px 0;`
  の横並びで, 左に組織アバター (`size={100} shape="square"`), 右にパンくず/組織名+
  種別バッジ/概要文/メタ情報の4行を `justify-content: center` で縦に並べています.
  - パンくず (`ancestorNames` + 自分の名前を `IconChevronRight` で繋いだもの) は
    依頼文の「「組織の概要」と同じ大きさ」という指定の意図が明確ではなかったため,
    説明文などと同じ二次的なテキストサイズ (`0.875rem`) として実装しました —
    意図と違う場合は `OrganizationHeaderBox.module.css` の `.breadcrumb` を
    調整してください. `organization.type === OrganizationType.Volunteer`
    (有志) の場合と `ancestorNames` が空の場合はパンくず自体を描画しません.
  - 種別バッジは `OrganizationType` (学級/執行機関/議決機関/独立委員会/クラブ/有志.
    `DocumentVisibility` と同じ, `erasableSyntaxOnly` 対応の const オブジェクト +
    union 型) を `Label` で表示します.
  - 設立日 (`foundedAt?: string`) が無い場合は `IconCalendarWeek` ごとメタ情報の
    その項目自体を描画しません (所属人数は常に表示).
- **本文** は `OrganizationOverviewSection.module.css` の `.root` で
  `max-width: 1280px; padding: 0 16px; margin: 0 auto;` として `OverviewSection`
  と揃え, `.body` を `display: grid; grid-template-columns: 3fr 1fr;` で
  左をメイン (`OrganizationActivityFeed`), 右をサイドバー (`OrganizationSidebar`)
  に3:1で分割しています — `OverviewSection` の 1:3 (サイドバー:メイン, サイドバーが左)
  とは列の比率も左右も逆なので, 実装する際に混同しないよう注意してください.
  - `OrganizationSidebar` は「構成員」見出し + 参加ユーザーのアバター
    (`size={35}`) を `flex-wrap: wrap` で左詰めに並べたものです.
  - `OrganizationActivityFeed` は `IconClock` + 「直近の動向」見出し + `ActivityCard`
    の一覧です. カードの外形 (`border`/`border-radius`/`padding: 16px`) は
    `DocumentCard` と同じものを流用し, 幅だけ 100% に引き延ばしています. `.root`
    には `box-sizing: border-box` を明示しています — これが無いと `width: 100%`
    に `padding`/`border` が上乗せされて `main` の幅からはみ出す不具合になっていました
    (`menuItemBase.root` の同種の注意書きを参照. `DocumentCard` はグリッドの stretch
    に幅を委ねているため元々この問題が起きません).
- **`ActivityCard`** はユーザーアバター (`size={40}`) + 名前 (太字) + 日時 (小さく,
  名前の下) の共通ヘッダーの下に, `activity.type` ごとに異なる本文
  (`MeetingActivityBody`/`MoneyActivityBody`/`DocumentActivityBody`,
  `ActivityCard.tsx` 内の非 export のローカル関数) を出し分ける構成です.
  - 会議作成: 「日時」「開催場所」「出席者」は鉤括弧を付けず `ラベル: 値` とし,
    3つをまとめて1行 (`.meta`/`.metaGroup`, `DocumentCard` の `.meta`/`.metaGroup`
    と同じ命名・考え方) にしています — `flex-wrap: wrap` なので, 画面が狭く1行に
    収まらない場合は `metaGroup` 単位 (項目の途中ではなく) で折り返します.
    「議題」だけ他とは別行のまま複数件のときに特別な形式になります (こちらも
    鉤括弧は付けません) — 1件なら他と同じ `議題: 値`, 2件以上なら `議題:`
    の行の下に箇条書きを続けます. `ラベル:` の部分 (「日時」等) は
    `.meta`/`.fieldRow` の `--color-body-subtext` のままですが, 値の部分だけ
    `.metaValue` (`--color-body-body`) で囲んで, 議題の箇条書き (`.list`,
    同じく `--color-body-body`) と色を揃えています — ラベルより値を目立たせる
    ための区別です. `.list` の `padding-left` は `2rem` (既定の `1.25em`
    (約20px) から拡大した値) にしています.
  - 金銭の出納: アイコンは `IconCreditCard` (当初 `IconCurrencyYen` でしたが変更).
    金額は「収入」(`amount >= 0`)/「支出」(負) をコロンで数値に繋ぎ, 符号は付けず
    絶対値 (`Math.abs`) で表示します (当初 `+`/`-` の符号付きで実装していましたが変更).
    `toLocaleString()` 等でのカンマ区切りはせず (依頼文で明示的に「コンマ無し」),
    末尾に「円」を付けています.
  - 会議の議題/出納の項目/文書の変更点の箇条書きは, いずれも見出しの直下に
    そのまま描画します (当初は出納/文書の2つだけ `padding: 16px` の Mantle 背景
    Box で囲んでいましたが, 依頼により箇条書きは全種類とも Box 無しの
    `.list` に統一しました — 会議の議題はもともと Box 無しだったため, これで
    3種類の見た目が揃っています). 一覧が `ActivityCard.tsx` の
    `READ_MORE_THRESHOLD` (= 5) 件以上のとき, 表示自体は先頭5件で打ち切り,
    代わりに太字下線の「詳しく見る」(`ReadMoreLink`, 非 export のローカル関数)
    を末尾に出します — 依頼文の会議/出納/文書それぞれのリンク先
    (`/orgs/:orgId/meetings/:meetingId` など) に対応するページはまだ無いため,
    実際にクリックすると 404 になります.
- **データモデリング**: 依頼文に「上記にある ID などは組織とは分離して考え, データベースで
  見た際には木構造ではなくなっている可能性があることに注意」という指示があったため,
  `types.ts` の `Activity` (会議作成/金銭の出納/文書の変更) は組織の子要素として
  ネストさせず, `MOCK_DOCUMENTS` (`features/user/mockData.ts`) と同じように
  それぞれ独立した `id` + `organizationId` (参照用の外部キー相当のフィールド)
  を持つフラットな配列として表現しています. 会議/出納/文書側の ID
  (`meetingId`/`transactionId`/`documentId`/`versionId`) も同様に, 組織 ID
  から導出/prefix したりせず, 完全に独立した文字列にしています — 実際の DB
  設計でもこの形 (別テーブル + 外部キー) を想定した実装です.
- **`currentUser` (test-user) との繋がり**: `/users/:userId` 側から組織プロフィール
  ページの見え方を確認できるよう, `features/user/mockData.ts` の
  `MOCK_ORGANIZATIONS` の1件を `test-org` (`features/organization/mockData.ts`
  の `MOCK_ORGANIZATION` と同じ組織) にし, `MOCK_DOCUMENTS` の `bunkasai-plan`
  (文化祭実行計画書) を `test-org` の所有にしています.
  `features/organization/mockData.ts` 側の `bunkasai-plan` を編集した
  `DocumentChangeActivity` の `actorName` は `currentUser.name` を直接
  参照しています (ハードコードした文字列を2箇所に置いて食い違うのを防ぐため).
  当初は `DocumentSummary` に `lastEditedBy?: string` を追加し,
  `DocumentCard` の3行目にも `IconPencil` + 「{name}が編集」として同じ編集を
  表示していましたが, 自分自身のプロフィールページで「自分が編集した」と
  表示するのは自明で不要と判断し, `lastEditedBy` フィールドごと削除しました
  (`ActivityCard` 側の表示は組織のページなので引き続き有用です).

## 組織の文書一覧 (`OrganizationDocumentsSection`)

`src/features/organization/components/OrganizationDocumentsSection.tsx` は
`/orgs/:orgId/documents` (「組織プロフィールページ」参照) の本文です. GitHub
のリポジトリ一覧ページ (検索バー + フィルターサイドバー + ページネーション付きの
一覧 Box) を参考にした構成で, `.root` を `display: grid;
grid-template-columns: 1fr auto 3fr;` として左をサイドバー, 中央を縦の `Divider`,
右をメインに1:3で分割しています (概要タブの `OrganizationOverviewSection`
と同じ列比率・左右関係ですが, 分割線を挟む点が異なります). **当初は左をメイン
右をサイドバーとして実装していましたが, 依頼により左右を逆転しています** —
`OrganizationDocumentsSection.tsx` の JSX 上も `DocumentFilterSidebar` →
`Divider` → `<main>` の順に変更済みです.

- **状態は `OrganizationDocumentsSection` 1箇所に集約**しています —
  `searchText`/`sortField`/`sortDirection`/`page` の4つの `useState` をこの
  コンポーネントだけが持ち, 子コンポーネント (`DocumentFilterSidebar`/
  `DocumentSearchBar`/`DocumentListBox`) はすべて値と `onChange` 系コールバックを
  受け取るだけの制御コンポーネントです. 見出し・検索欄・サイドバーの選択状態は
  いずれもこの単一の `searchText` から導出しています (下記).
- **`DocumentFilterSidebar`**: `NavDrawer` などと同じ `menuItemBase.module.css`
  を土台にした, フィルター選択の役割を持つボタンの縦リストです. フィルター自体
  (「子組織: false」などのクエリ文字列によるドキュメントの絞り込み) はまだ実装して
  いないため, ボタンを押すと `DOCUMENT_FILTERS` (`DocumentFilterSidebar.tsx` で
  export) の対応する `query` 文字列を検索欄にそのまま入れるだけです — 一覧の中身は
  絞り込まれません. 選択中の判定は `filter.query === searchText` の完全一致で行い,
  一致するボタンにだけ `menuItemBase.active` (背景グレー) と `CurrentContentBar`
  (左の青線) を付けます.
- **`DocumentSearchBar`**: Header の検索ボタン (リンクのみで入力欄を持たない)
  とは別物の, 実際に入力できるテキストボックスです. 文字が入っているときだけ
  `IconCircleXFilled` の clear ボタン (`aria-label="検索文字列をクリア"`, クリックで
  `onChange("")`) を表示し, 右端に `border-left` で区切った `surface0` 背景の
  検索ボタン (`IconSearch`, クリックしても何もしません — フィルター自体が未実装のため)
  を配置しています. `IconSearch` は `size` を明示せず `Icon` の既定値 (22px)
  のままにしています — 当初 `size={18}` を指定していましたが, `IconButton`
  内部のアイコン (同じく既定の22px) より小さく見えるという指摘を受けました.
  実際に小さく見えていた原因は `size` の指定そのものではなく, `.searchButton`
  に `padding` を明示していなかったために当時の `src/index.css` にあった
  `button { padding: 8px 16px; ... }` (Vite テンプレート由来の, グローバルな
  素の `button` セレクタへの残骸 — `DocumentCard` の説明文が中央揃えに見えた
  `App.css` の `#root { text-align: center; }` と同じ系統の問題) が効いてしまい,
  `width: 40px` の `.searchButton` の中身が実質8pxほどしか残らず, アイコンが
  `flex-shrink` で潰れていたことでした. この `button {}` 残骸自体は後述の
  「グローバル CSS のクリーンアップ」でサイト用のベースラインに置き換え済みですが,
  `.searchButton` 側にも `padding: 0;` を明示したままにしています (他のボタンと
  同様, 自身の見た目を自身の CSS Module 内で完結させる方針に揃えるため).
- **見出しの導出**: `DOCUMENT_FILTERS.find((f) => f.query === searchText)` が
  見つかればそのフィルターの `label` を, 見つからなければ (サイドバーのボタン
  以外から検索欄に任意の文字列を入力した場合を含む) 「全て」を見出しとして
  表示します — `DocumentFilterSidebar` の選択中判定と同じロジックをここでも
  独立して行っています (両方とも同じ `DOCUMENT_FILTERS`/`searchText` を参照する
  ため, サイドバーの選択状態と見出しは常に一致します).
- **`DocumentSortDropdown`**: `CreateButton`/`UserMenuButton` と同じ
  `useDismissablePopover` ベースのポップオーバーです. 現在の並び替え条件
  (`DocumentSortField`: 最新編集日時/作成日/名称, `DocumentSortDirection`:
  昇順/降順) に応じて `IconSortAscendingLetters`/`IconSortDescendingLetters`
  を出し分けます. メニューでは3つの `DocumentSortField` だけを選べます — **同じ
  項目を選び直すと昇順/降順がトグルし, 別の項目を選ぶとその項目の降順
  (`DocumentSortDirection.Desc`) から始まります** (最新順/新しい順を既定とする
  ほうが自然だろうという判断で, 明示的な依頼ではありません — 昇順を既定にしたい
  場合は `OrganizationDocumentsSection.tsx` の `onSortChange` 呼び出し元
  (`DocumentSortDropdown.tsx` 内) を調整してください). トリガーの末尾には
  `IconCaretDownFilled` (`size={13}`) を付けています — `controlBase` の
  `dropdown` prop (`IconButton`/`IconLink` の右隣に同じアイコンを添える仕組み,
  「正方形アイコン系」参照) と同じ見た目の意図ですが, `DocumentSortDropdown`
  のトリガーは正方形ではなく「アイコン+文字ラベル」の横長ボタンで `controlBase`
  を使っていないため, 同じアイコンを個別に描画する形で揃えています.
- **`DocumentListBox`**: 一覧全体を包む枠線付きの Box です. 上部の `.toolbar`
  (`background: var(--color-secondary1)`) に「n本の文書」(検索にマッチする件数.
  太字) と `DocumentSortDropdown` を並べます. 各行は `DocumentListRow` —
  文書名 (太字)/概要/`IconFile` + ファイル種別を横並びにした, 行全体が1つの
  `<Link to={`/${document.organizationId}/${document.id}`}>` になっている
  ボタンです. リンク先はまだ実装していない文書ページ想定で, `OverviewSection`
  の `DocumentCard` と同じ形式です. **`Pagination` はこの Box の内部ではなく,
  呼び出し元 (`OrganizationDocumentsSection`) が Box の外側 (上下) に配置します**
  — 当初は Box 内部の `.toolbar` 直下/一覧末尾に組み込んでいましたが,
  「Box の外に出してほしい」という依頼を受け, `DocumentListBox` からは
  `Pagination` の import と `page`/`pageCount`/`onPageChange` props
  を削除し, `OrganizationDocumentsSection` 側で `pageCount > 1`
  のときだけ `<Pagination>` を `<DocumentSearchBar>` の下と
  `<DocumentListBox>` の下に直接並べる形にしています (`.main`
  の `flex-direction: column; gap: 16px;` にそのまま乗るため,
  `DocumentListBox.module.css` 側の `.paginationTop`/`.paginationBottom`
  (区切り線付きの内部ラッパー) は不要になり削除しました).
- **一覧のキーボード操作**: 「キーボードショートカットやコマンドなどでページを
  変化させた際に, リストが変化したことが判るようにしてほしい」「リスト内の要素に
  Tab フォーカスした際, 矢印キーで上下にフォーカス移動できるようにしてほしい」
  という依頼により, `DocumentListRow` を並べる内側の `<div>`
  (`DocumentListBox.tsx`) 自体をプログラム的にフォーカス可能にしています —
  **`tabIndex={-1}` なので Tab キーの通常の移動順には含まれません**
  (「Tab で移動している時はリスト全体にフォーカスが当たらないようにしてほしい」
  という依頼のため, 当初の `tabIndex={0}` から変更しました). そのため Tab
  で辿り着くのは常に個々の行 (`DocumentListRow`, 実体は `<a>`, 本来から
  フォーカス可能) のほうで, 一覧自体へのフォーカスは下記の「ページ切り替え時の
  自動フォーカス」など `.focus()` の明示的な呼び出し経由でのみ起こります.
  - **ページ切り替え時に一覧へ自動フォーカス**: `page` prop
    (`OrganizationDocumentsSection` から新たに渡すようにしたもの.
    `Pagination` の props とは別に, この一覧の `useEffect` の依存目的だけで
    渡しています) を前回値と比較する `useEffect` で, 実際に値が変わった
    ときだけ一覧に `.focus()` します (`biome` の `useExhaustiveDependencies`
    が「参照していない依存」を指摘するため, 単に `if (isFirstRender) return`
    で済ませず `previousPageRef` と比較する形にして `page`
    を実際にエフェクト内で参照するようにしています — 副作用として,
    初回マウント時は前回値と同じなので自動的にフォーカスされません).
    フォーカスが当たると `:focus-visible` で青い枠 (`--color-focus`)
    が表示され, ページの内容が変わったことに気付けます.
  - **`role="listbox"`**: 素の `<div>` に `tabIndex`/`onKeyDown`
    を付けるだけだと biome の `lint/a11y/noStaticElementInteractions`/
    `noNoninteractiveTabindex` に抵触するため, ARIA 上「操作可能」に
    分類される役割が必要でした. `role="group"` はいずれも「非対話的」
    扱いで同じ指摘が残ったため, ウィジェット役割である `role="listbox"`
    にしています — 本来の listbox パターン (`role="option"` の子要素 +
    `aria-selected`) までは実装していません (行は実際のページ遷移リンクの
    ままにしたい — `role="option"` にすると Vimium 等からのリンク認識に
    影響しかねないため) が, biome の a11y チェックを満たしつつ
    「フォーカス可能なグループ」を表現する現実的な妥協です.
  - **矢印キーでの行移動**: 一覧の `onKeyDown` で, フォーカスが行
    (`<a>`) 上にあるとき (`document.activeElement` が一覧内の `<a>`
    のいずれかと一致するとき) は ArrowUp/ArrowDown で前後の行へ
    `.focus()` します (先頭/末尾の行では `Math.min`/`Math.max`
    でそれ以上動かないようにしています). **一覧自体 (行以外, つまり
    `role="listbox"` の `<div>` 自身) にフォーカスがある場合は,
    下矢印で一番下の行, 上矢印で一番上の行へ直接ジャンプします**
    (`currentIndex === -1` — `document.activeElement` が一覧内の
    どの `<a>` とも一致しない — の場合の分岐) — 一覧全体にフォーカスが
    当たった直後 (ページ切り替え時の自動フォーカスなど) から, 内容を
    一通り確認したい場合に応じて先頭/末尾どちらからでもすぐ辿れるように
    という依頼によるものです. `DocumentListRow` (`.root`, 実体は `<a>`)
    にも `:focus-visible` (`outline: 2px solid var(--color-focus);
    outline-offset: -2px;`) を追加しています — 一覧全体の枠
    (`role="listbox"` の `<div>` 自身が持つ, 前述の `:focus-visible`)
    とは別に, 個々の行が現在フォーカスされていることも青枠でわかるように
    するためです.
- **`Pagination`** (`src/components/ui/Pagination.tsx`) — 文書一覧専用ではなく
  再利用可能な汎用コンポーネントとして `components/ui/` に置いています. 依頼文の
  例示 (`1 … 3 4 5 6 7 8 9 10 11 12 … 15`, 現在ページ8/全15ページ, 中央に
  常に10個の数字) を元に当初 `WINDOW_SIZE = 10` として実装しましたが,
  「前へ/次へをできるだけ中央の数字に寄せたい (両端に固定するのではなく)」
  「中央に常に表示する数字を10個から5個に」という依頼により, **`WINDOW_SIZE
  = 5`** に変更し, 前へ/次へも番号の並びに直接隣接させる (両端固定はしない)
  単一の `justify-content: center` な行に戻しています — 表示数を絞ったことで
  ページ間の要素数の変動幅そのものが小さくなり, 中央寄せのままでも前へ/次への
  位置のずれが目立ちにくくなります. `getPageItems` は現在ページの前後を
  `halfBefore = Math.ceil((WINDOW_SIZE - 1) / 2)`/`halfAfter =
  Math.floor((WINDOW_SIZE - 1) / 2)` で (奇数の `WINDOW_SIZE`
  でも前寄り優先で) 均等に割り振り, 中央の数字がちょうど `WINDOW_SIZE`
  個になるようにしています — 元の `WINDOW_SIZE = 10` の入力でも
  依頼文の例示と完全一致することを確認した上でのリファクタリングです.
  全ページ数が `WINDOW_SIZE + 2` 以下のときは省略記号を使わずすべての番号を
  並べます. **番号ボタン/前へ/次へはいずれも `<button>` ではなく `<a>`
  にしています** — 「Vimium などのキーボード拡張の "]]"/"[[" (次/前ページへの
  移動) やリンクとして追従できるようにしてほしい」という依頼のためで,
  Vimium/Tridactyl 等の "]]"/"[[" は `rel="next"`/`rel="prev"` を持つ `<a>`
  を探して操作する仕様のため, 前へ/次へには `href="#prev"`/`href="#next"`
  と合わせて `rel="prev"`/`rel="next"` を付けています (`<button>` のままだと
  この仕組みから一切検出されず, 実際に Firefox 上の拡張で動作しないことが
  確認されたため `<a>` 化が必須でした). 番号ボタンは `href={`#${item}`}`
  のみ (`rel` 属性は無し) で, どちらもクリック時は `event.preventDefault()`
  で実際のハッシュ遷移 (URL 変化・スクロール) を打ち消した上で `onChange`
  だけを呼ぶため, 見た目・挙動は従来のボタンと変わりません (`<a>` は既定で
  `display: inline` のため, `.page`/`.step` に `display: inline-flex`
  を明示しないと `width` 指定などが効かない点に注意. `<a>` には
  `disabled` 属性が無いため, 前へ/次への無効化は `aria-disabled`
  + `.stepDisabled` (`onClick` 内でも実際のページ変更を止めている)
  で表現しています — 元は `<button disabled>` の `:disabled`
  疑似クラスを使っていましたが, `<a>` 化に伴いクラスベースに置き換えました).
  数字ボタン (`key={item}`, 選択中は背景 `--color-link`/文字
  `--color-background`, それ以外は背景透過/文字 `--color-body-headline`)
  と省略記号 (`key={`ellipsis-${index}`}` — 単純な `index` だけを key
  にすると, 同じ数値がページ番号ボタンの `key={item}` と衝突し React が
  「重複した key」の警告を出して描画が不安定になることがあったため,
  接頭辞で名前空間を分けています) は前へ/次へ (`IconChevronLeft`/
  `IconChevronRight`, 枠線無しの青文字リンク, 先頭/末尾ページでは
  `aria-disabled="true"` + `--color-overlay1` + `cursor: not-allowed`)
  を挟みます. **数字ボタンの幅は, ページ数全体の最大桁数 (`String(pageCount).length`,
  常に描画される末尾ページ番号を含む) に固定しています** — 元は
  `min-width: 2rem` のみだったため, 1桁のページ番号は 2rem に収まる一方
  2桁のページ番号はそれより広がってしまい, 桁数の異なるページを跨いで
  「次へ」を押すたびにボタン幅がわずかに変わって見える不具合になっていました.
  `maxDigits = String(pageCount).length` を `Pagination.tsx` で計算し,
  `<nav>` に `style={{ "--page-digits": maxDigits }}` として渡して
  `.page { width: calc(var(--page-digits, 1) * 1ch + 16px); }`
  で全ての数字ボタンに同じ幅を適用しています (`font-variant-numeric:
  tabular-nums` も併せて指定 — 等幅フォントではないため, これが無いと
  同じ桁数でも数字の種類によって `ch` 基準の幅計算がわずかにずれ得ます).
- **グローバル CSS のクリーンアップ**: `DocumentSearchBar` の検索アイコンが潰れる
  不具合の調査で `src/index.css` に Vite テンプレート由来の残骸
  (`button { padding: 8px 16px; font-size: 1rem; cursor: pointer; }`/
  `nav a { margin-right: 16px; }`) が見つかったため, 「テンプレート由来の設定は
  全て削除し, このサイト用に適したものを使用してほしい」という依頼を受け,
  削除した上で `button` セレクタだけこのサイトに適した最小限のベースライン
  (`padding: 0; border: none; background: none; color: inherit;
  cursor: pointer; font: inherit;` — ブラウザ既定の見た目だけを打ち消し,
  実際の色/余白は `controlBase`/`menuItemBase`/`tabBase`
  や各コンポーネント自身の CSS Module に委ねる, という既存の方針をそのまま
  グローバル側にも反映した内容) に置き換えました. `nav a` 側は, この
  アプリの `<nav>` 内のリンク/ボタンの間隔がすべて `gap`
  (flex/grid) で統一的に確保されており, どこにも依存されていなかったため
  置き換えずに削除のみです. 変更後, ヘッダー/`NavDrawer`/`ProfileTabs`
  など既存の全ボタンが (すべて自前で見た目を定義しているため) 見た目に
  変化が無いことを Playwright で確認済みです — 唯一 `ToggleThemeButton`
  (`features/navigation/`, 「アプリの構成」参照) だけは自身の CSS
  を持たないプロトタイプのため, 素の `<button>` の見た目が変わりますが,
  どこからも呼び出されていない (呼び出し元が無い) ため実害はありません.
- **`Divider` の `orientation` 拡張**: メイン/サイドバー間の縦の区切り線のため,
  元は横線専用だった `Divider` (`src/components/ui/Divider.tsx`) に
  `orientation?: "horizontal" | "vertical"` (既定 `"horizontal"`, 既存の呼び出し元は
  無変更で動作) を追加しました. `.vertical` は `align-self: stretch;
  height: auto;` — 高さ0の `<hr>` でも, 親が flex/grid (既定で `align-items:
  stretch`) であれば `align-self: stretch` だけで縦幅いっぱいまで伸びます
  (`border-left` に切り替え, `margin` も `4px 0` → `0 4px` に転置).
- **モックデータ**: `MOCK_ORGANIZATION_DOCUMENTS` (`features/organization/mockData.ts`)
  はページネーションの動作を実際に確認できるよう, 10種類の話題 (`DOCUMENT_TOPICS`)
  ×10種類の文書テンプレート (`DOCUMENT_TITLE_TEMPLATES`) の組み合わせを
  機械的に繰り返して300件 (20件/ページ×15ページ) 生成しています. `type: OrganizationDocument`
  はフィルター (子組織/関与/管理権限など) がまだ実装されていないため, それらに
  対応するフィールドは持たせていません.

## 組織の入出金一覧 (`OrganizationBookSection`)

`src/features/organization/components/OrganizationBookSection.tsx` は
`/orgs/:orgId/book` (「組織プロフィールページ」参照) の本文です. 「基本的な構造は
文書一覧 (`OrganizationDocumentsSection`) と同じで, そこからの変更点」という依頼文の
通り, `Document*` 系のコンポーネント一式 (`DocumentFilterSidebar`/`DocumentSearchBar`/
`DocumentSortDropdown`/`DocumentListBox`/`DocumentListRow`) をそれぞれ
`Transaction*` として並行複製し (`Pagination`/`Divider` は既存のものをそのまま
再利用), 以下の差分だけを反映しています — 既存の `Document*` コンポーネント自体は
変更していません (実装済みで動作確認済みのコードを, 依頼されていない範囲まで
リファクタリングして壊すリスクを避けるため, このセッションで確立した「機能ごとに
似た構成でも別コンポーネントとして持つ」方針を踏襲しています).

**レイアウト**は `OrganizationDocumentsSection` (サイドバー/`Divider`/メインの
グリッド1枚だけの `.root`) とは異なり, `OrganizationOverviewSection`
(`OrganizationHeaderBox` + `Divider` + サイドバー/メインの `.body`) と同じ
2段構成にしています — `TransactionSummaryBox` (後述) を「サイドバーとメインに
跨るように配置してほしい」という依頼のため, `OrganizationBookSection.module.css`
を `.root` (`max-width: 1280px; padding: 0 16px; margin: 0 auto;`, `OrganizationOverviewSection`
の `.root` と同一) + `.body` (`display: grid; grid-template-columns: 1fr auto 3fr;
gap: 16px; padding: 24px 0;`, サイドバー/`Divider`/メインは元の `.root`
の中身をそのまま移した) の2階層に分割し, `TransactionSummaryBox` と
その下の水平 `<Divider />` (依頼により追加) を `.body` の外 (`.root` 直下)
に置いています.

- **`TransactionSummaryBox`**: 残金/支出合計/収入合計を表示する Box です.
  当初「`OrganizationHeaderBox` と同じ大きさ」という依頼から `height: 116px`
  を指定していましたが, 「要素の高さは内容 (文字の高さ) に合わせてほしい」
  という依頼により固定高さをやめ, 中身 (2行のテキスト) に応じた自然な高さに
  しています (`margin: 24px 0` は `OrganizationHeaderBox` と同じ値のまま
  残しています — こちらは上下の余白であり「高さ」ではないため対象外の判断).
  「"残金" の横に `IconMoneybag` を表示してほしい」という依頼で `.balance`
  (`残金: {balance}円`) の左にアイコンを追加し, 支出合計/収入合計の行
  (`.meta`) は `OrganizationHeaderBox` の `.meta`/`.metaItem`
  (`IconMoneybagMinus`/`IconMoneybagPlus`, サイドバーの支出/収入フィルターと
  同じアイコン) と同じ構造です. `balance`/`incomeTotal`/`expenseTotal` は
  `OrganizationBookSection` が prop の `transactions` (絞り込み前の全件)
  から算出して渡します — 一覧上部の「計」(`TransactionListBox` の
  `totalAmount`, 絞り込み後の `sorted` が対象) とは異なる集合が対象である点に
  注意してください. `incomeTotal`/`expenseTotal` は常に0以上 (収入の合計/
  支出の絶対値の合計) ですが, `balance` (収入-支出) は負の値になり得るため,
  「計」と同様に符号付きの数値をそのまま表示しています.

- **`type OrganizationTransaction`** (`types.ts`) — `OrganizationDocument`
  と同じ形の, 入出金一覧の1件を表すフラットな型です. `amount` (収入: 正の数/
  支出: 負の数. `MoneyTransactionActivity` と同じ約束) と, 表示用に整形済みの
  金額文字列 (絶対値+円, 符号無し. 例: `"8400円"`) を持つ `title` フィールドを
  別々に持たせています — `title` はソート (`TransactionSortField.Title`)
  や一覧の見出し表示に `OrganizationDocument.title` と全く同じコードパスで
  使うためのもので, 符号 (収入/支出) の表現は一覧側の +/- アイコンに任せています.
  決済手段は `PaymentMethod` (`erasableSyntaxOnly` 対応の const オブジェクト
  + union 型, 現金/銀行振込/引き落し) です. `TransactionSortField`/
  `TransactionSortDirection` も `DocumentSortField`/`DocumentSortDirection`
  と同じ形 (`EditedAt`/`CreatedAt`/`Title`, `Asc`/`Desc`) で独立して定義しています
  — 別ドメインの型を流用せず, 各機能が自分の型を持つという既存の方針
  (`OrganizationDocument` と `DocumentChangeActivity` が別の型であるのと同じ考え方)
  に揃えています.
- **`TransactionFilterSidebar`**: `DOCUMENT_FILTERS` の9件と違い, 依頼文で明示された
  5件 (`IconHome` 全て/`IconBinaryTree` 組織内のみ/`IconMoneybagMinus` 支出
  (`query: "種別: 支出 有効: true"`)/`IconMoneybagPlus` 収入
  (`query: "種別: 収入 有効: true"`)/`IconArchive` 無効化済) だけを持ちます —
  支出/収入の2件は当初 `有効: true` を含めていませんでしたが, 依頼により
  `DOCUMENT_FILTERS` の「管理下」等と同じ形式 (属性の後ろに `有効: true`
  を付ける) に揃えています. 構造 (menuItemBase ベース, `searchText`
  との完全一致で選択中判定) は `DocumentFilterSidebar` と同一です.
- **`TransactionListRow`**: `DocumentListRow` の3列構成 (太字タイトル/概要/
  末尾のアイコン+ラベル) を踏襲しつつ, 依頼された3点を変更しています —
  (1) 行の先頭に `transaction.amount >= 0` で `IconMoneybagPlus`/
  `IconMoneybagMinus` (サイドバーの収入/支出フィルターと同じアイコン.
  当初は `IconPlus`/`IconMinus` でしたが, 依頼により差し替えました) を追加
  (収入/支出を示す. 色は他のアイコンと揃えて `--color-body-subtext`
  のままにしています — 依頼に無い緑/赤などの色分けは追加していません),
  (2) 太字タイトルを文書名ではなく `transaction.title` (整形済みの金額文字列),
  (3) 末尾を `IconFile` + ファイル種別ではなく `IconCoinYen` + 決済手段ラベル
  (`PAYMENT_METHOD_LABEL`, コンポーネント内定義) にしています. リンク先は
  `DocumentListRow` と同様まだ実装していない想定のページ
  (`/orgs/:orgId/book/:transactionId`) です.
- **`TransactionListBox`**: `DocumentListBox` と全く同じ構造 (ページ切り替え時の
  一覧への自動フォーカス, 矢印キーでの行移動, `role="listbox"` +
  `tabIndex={-1}` を含む) をそのまま複製しています. 上部の件数表示は
  「n本の文書」ではなく「n件の入出金」にしています (文書は「本」, 入出金の
  記録は「件」で数える方が自然だろうという判断で, 明示的な依頼ではありません).
  さらに「"n件の入出金" のとなりに "計: n円" としてフィルター後の金額を
  示してほしい」という依頼により, `totalAmount: number` prop
  (`OrganizationBookSection` が `sorted` — 絞り込み後・ページ分割前の集合,
  `totalCount` と同じ母集合 — の `amount` 合計として算出) を追加し,
  `.summary` (`.count`+`.totalAmount` を並べる横並び) として表示しています.
  収入-支出の純額のため負の値になり得ますが, 符号付きの数値をそのまま表示する
  だけにしています (`-1200円` のように, JS の数値→文字列変換が自然に付ける
  負符号にまかせ, 正の値には `+` を前置しません).
- **`TransactionSortDropdown`**: `DocumentSortDropdown` と同じ3種類の並び替え
  (最新編集日時/作成日/名称相当) ですが, `Title` フィールドのラベルは「名称」
  ではなく「金額」にしています — `title` の中身が金額の整形済み文字列である
  ことを踏まえた, 表示ラベルだけの変更です (ソートの実装/フィールド構成自体は
  `DocumentSortDropdown` と同一).
- **`TransactionSearchBar`**: `DocumentSearchBar` と同一構造で, プレースホルダーの
  みを「入出金を検索」にしています (「文書を検索」のまま流用すると内容と
  食い違うため).
- **モックデータ**: `MOCK_ORGANIZATION_TRANSACTIONS` (`features/organization/mockData.ts`)
  は支出の理由 (`TRANSACTION_EXPENSE_REASONS`, 10種)/収入の理由
  (`TRANSACTION_INCOME_REASONS`, 5種) をそれぞれ用意し, `index % 3 === 0`
  のときだけ収入 (それ以外は支出, 部活動は支出の方が多いだろうという想定の比率)
  として50件を機械的に生成しています (`MOCK_ORGANIZATION_DOCUMENTS` の300件より
  少なめですが, ページネーション (20件/ページで3ページ) の動作確認には十分な件数
  です). 収入は3000〜30000円, 支出は500〜8500円程度の範囲にそれぞれ収まるよう
  振れ幅を持たせています.

## 組織の構成員一覧 (`OrganizationMembersSection`)

`src/features/organization/components/OrganizationMembersSection.tsx` は
`/orgs/:orgId/members` (「組織プロフィールページ」参照) の本文です. 文書一覧/
入出金一覧と同様「基本的な構造は文書一覧と同じで, そこからの変更点」という
依頼文の通り, `Document*` 系のコンポーネント一式を `Member*` として並行複製し,
以下の差分だけを反映しています (レイアウトは `OrganizationBookSection`
のような全幅の summary box を挟まない, `OrganizationDocumentsSection`
と同じ1段のグリッドです — 依頼に無いため追加していません).

- **`type OrganizationMember` の拡張**: 元々 `OrganizationSidebar`
  (概要タブのアバター一覧) だけが使っていた `{ id: string; name: string; }`
  という簡素な型に, 構成員一覧に必要な `organizationId`/`role`/`email`/
  `grade` (学年, 1-3)/`class` (学級, "A"-"D") を追加する形で拡張しました
  — `OrganizationDocument`/`OrganizationTransaction` のように別の型を
  新設しなかったのは, 「構成員」という同一の実体を指しており, 概要タブ側は
  拡張後の型のうち `id`/`name` だけを引き続き使えば済む (構造的部分型なので
  そのままコンパイルが通る) ためです. `class` はフィールド名として
  (TypeScript の予約語ですが, プロパティ名としては問題無く使えます) そのまま
  採用しています. フィルター (子組織/参加状態など) はまだ実装しないため,
  対応するフィールドは持たせていません.
- **`MemberFilterSidebar`**: 依頼文で明示された3件 (`IconHome` 全て/
  `IconBinaryTree` 組織内のみ/`IconUserOff` 退出済 (`query: "参加: false"`))
  だけを持ちます. 構造は `DocumentFilterSidebar`/`TransactionFilterSidebar`
  と同一です.
- **`MemberListRow`**: 「1つの項目を2行にする」という依頼のため,
  `DocumentListRow`/`TransactionListRow` (横一列3列) とは構成が異なります
  — 先頭に `Avater size="medium"` (40px), 中央に名前 (`.title`, 太字)/
  役職 (`.description`) を縦に並べた `.info`, 右端に右揃えでメールアドレス/
  学年学級を縦に並べた `.meta` を配置し, `.info`/`.meta` がそれぞれ2行
  になることで行全体が2行の高さになります. アイコンは
  `IconMail` (メールアドレス) と `IconUserSquare`
  (学年学級. 当初 `IconChalkboardTeacher` でしたが依頼により変更) です.
  リンク先は `DocumentListRow`/`TransactionListRow` (組織に紐付く独自の
  未実装ページ) とは異なり, 依頼により実在するユーザープロフィールページ
  (`/users/:userId`, `member.id` をそのまま `userId` として使う) にしています
  — `currentUser.id` と一致しない構成員 (現状ほぼ全員) は「ユーザーが
  見つかりません」になりますが, これは `/users/:userId` 自体の既存の仕様
  (他ユーザーの実データが無い) によるもので, `MemberListRow` 側の実装は
  単純に `to={`/users/${member.id}`}` とするだけです.
- **`MemberListBox`**: `DocumentListBox`/`TransactionListBox` と全く同じ構造
  (ページ切り替え時の自動フォーカス, 矢印キーでの行移動, `role="listbox"`
  + `tabIndex={-1}` を含む) です. 上部の件数表示は「n人の構成員」にしています
  (`OrganizationHeaderBox` の「所属人数: n人」と同じ, 人を数える単位).
- **`MemberSortDropdown`**: 依頼文で明示された3種類, 学年/学級/名前
  (`MemberSortField.Grade`/`Class`/`Name`) です — `DocumentSortDropdown`
  の日付2種+名称という構成とは全く異なる (共通点が無い) ため, 型
  (`MemberSortField`/`MemberSortDirection`) も含めて独立して定義しています.
  ソートの実装は `field === Name` なら `localeCompare("ja")`, `field ===
  Class` なら学級を `localeCompare("ja")` (A<B<C<D の文字コード順で十分),
  それ以外 (`Grade`) は数値の引き算です. **別フィールドを選び直した際の既定方向は
  昇順 (`Asc`) にしています** — `DocumentSortDropdown`/`TransactionSortDropdown`
  は日付の「新しい順」が自然な既定だったため降順でしたが, 学年/学級/名前は
  「1年→3年」「A→D」「あ→ん」のような昇順が自然な既定だろうという判断です
  (同じフィールドを選び直した場合に昇順/降順をトグルする挙動自体は同じです).
  一覧の初期ソートも同じ理由で学年昇順 (`MemberSortField.Grade`/
  `MemberSortDirection.Asc`) にしています.
- **`MemberSearchBar`**: `DocumentSearchBar` と同一構造で, プレースホルダーの
  みを「構成員を検索」にしています.
- **モックデータ**: 「構成員」タブのバッジ (`MOCK_TAB_COUNTS.members`) が
  `MOCK_ORGANIZATION.memberCount` と意図的に揃えてある (documents/book の
  バッジとは異なり, 実際の人数を表す値として扱われている) 既存の設計方針を
  踏まえ, 文書/入出金のように件数を大きく水増しした別データセットは作らず,
  既存の `MOCK_MEMBERS` (12件, 元々 `OrganizationSidebar` 用) 自体を
  `role`/`email`/`grade`/`class` を持つよう拡張して, 構成員一覧ページからも
  同じ配列をそのまま使っています. 12件のみのためページネーションは
  (`showPagination = pageCount > 1` の判定により) 表示されません — これは
  「実際の所属人数と一致させる」ことを優先した結果で, ページネーションの
  動作確認自体は文書一覧/入出金一覧の300件・50件で既に行っているため,
  ここで改めて大きなダミーセットを作る必要は無いという判断です. 学年は
  `(index % 3) + 1`, 学級は `["A","B","C","D"][index % 4]`, 役職は先頭2件を
  「委員長」「副委員長」, 残りを「委員」としています.

`src/pages/NotFoundPage.tsx` は `App.tsx` の `path="*"` (`/users/:userId` の次, 一番最後の
`<Route>`) に紐づく catch-all です. `AppLayout` 配下なので `Header` (上部の1行) は
表示されますが, `HeaderBottomPortal` を使わないため下部ヘッダーのスロットは空のまま —
「上部ヘッダーのみを残す」という要件はこの構造で自然に満たされます. 本文
(`NotFoundPage.module.css` の `.root`) は `OverviewSection` と同様 `max-width: 1280px;
padding: 24px 16px; margin: 0 auto;` で, 中身は `text-align: center` の「404」
(`.code`, `width: 100%` を明示) と説明文の2行だけです.

パンくずを空にする指示への対応として, `getBreadcrumb.ts` の最終フォールバック
(`SPECIAL_ROOT_LABELS` にも `currentUser`/`/users/:userId` パターンにも一致しない場合)
を, 従来の `segments.slice(0, 2)` (生のパス文字列を最大2階層表示) から `[]`
(何も表示しない) に変更しました. **注意**: `SPECIAL_ROOT_LABELS` に登録済みのパス
(`/issues`/`/documents` など) は, 対応する実ページがまだ無く実際には `NotFoundPage`
が表示される場合でも, パンくず自体は登録済みの日本語名 (「指摘事項」等) を引き続き表示します
— 未登録の完全に未知なパスのときだけパンくずが空になる, という判断です (`/:userId` が
まだ分離されていなかった頃, 同様に「ユーザーが見つかりません」の裏でパンくずだけ表示され
続けていたのと同じ考え方です). 「`NotFoundPage` が表示されている間は常にパンくずを空にする」
という, より厳格な解釈が必要であれば実装を変更してください.

## アイコン・emblem パイプライン

関連はしていますが別々の, 2つの SVG の仕組みがあります.

1. **Emblem (ロゴマーク)**: 原本の `.af` (Affinity) ファイルは `design/emblems/` にあり, git LFS
   で管理されています (`.gitattributes` の `*.af`). これらは手作業で `emblems/exported/*.svg`
   に書き出され, `npm run emblems` を実行すると `svgo` (設定は `svgo.config.js`) が
   `emblems/optimized/` (gitignore 対象, ローカルのみ) に出力し, `scripts/build-sprite.mjs`
   がそれらを1つのスプライトとして `public/emblems.svg` にまとめ, あわせて
   `src/components/ui/emblem-names.ts` に `EmblemName` のユニオン型を生成します.
   `emblems/optimized/` と `public/emblems.svg` は自動生成物なので直接編集しないでください. emblem
   を使う際は `<Emblem name="..." />` (`src/components/ui/Emblem.tsx`) を使用し, これは内部で
   `<use href="/emblems.svg#name">` を参照します.
2. **UIアイコン**: `@tabler/icons-react` から取得し, `src/components/ui/Icon.tsx`
   でラップして使用します (`<Icon icon={IconXyz} />`).

ファビコン (`public/favicon.svg`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`,
`apple-touch-icon.png`) は `design/favicon/*.af` の原本から手作業で書き出され,
そのままコミットされています (`npm run emblems` のパイプラインには含まれません).

## `header-src/` について

Header コンポーネントツリーの独立したリファレンス/プロトタイプ実装です (`src/` からも,
ビルドからも参照されていません — 実際に使われているコードだと決めつける前に確認してください). Header
のサブコンポーネント (`Left`/`Center`/`Right`/`Bottom`) をどう分割し得るかの設計上の参考には
なりますが, 正としては扱わず, あくまで試作/参考資料として扱ってください. `export function Foo()`
スタイルなど, 上記の `src/` 向けの規約 (export の方法など) も対象外です.
