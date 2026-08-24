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
  `/orgs/:orgId/book` (会計タブ)/`/orgs/:orgId/members` (構成員タブ)/
  `/orgs/:orgId/meetings` (会議タブ) も実装済みです (詳細は「組織プロフィールページ」
  「組織の文書一覧 (`OrganizationDocumentsSection`)」「組織の入出金一覧
  (`OrganizationBookSection`)」「組織の構成員一覧
  (`OrganizationMembersSection`)」「組織の会議一覧
  (`OrganizationMeetingsSection`)」を参照) — この5つは `OrganizationLayout`
  (`src/pages/`) という共通の親ルートの下にネストしたルートとして実装しており,
  組織の存在チェックと `OrganizationTabs` の表示はそちらに集約されています.
  `path="*"` の catch-all として `NotFoundPage`
  (`src/pages/`, 詳細は「404 ページ (`NotFoundPage`)」を参照) も実装済みで,
  `/users/:userId`/`/orgs/:orgId` 以外のどのパスにもマッチしない URL は 404 ページに
  なります (以前はここが完全な白紙になっていました).
  `/orgs/:orgId/documents/:documentId` (概要/版/指摘事項/修正提案/編集者の5タブ,
  詳細は「文書詳細ページ」を参照)/`/orgs/:orgId/book/:transactionId`
  (詳細は「会計処理詳細ページ」を参照)/`/orgs/:orgId/meetings/:meetingId`
  (詳細は「会議詳細ページ」を参照) の3つの個別詳細ページと, 組織/文書に紐付かない
  グローバルな `/notifications` (詳細は「通知ページ (`NotificationsPage`)」を参照)
  も実装済みです. さらに `/documents`/`/book`/`/meetings`/`/issues`/`/pulls`
  (それぞれ対応する `/orgs/:orgId/...` ページと同じ構造で, 内容だけ組織を
  横断した全件にしたもの. 詳細は「組織を横断した一覧ページ」を参照)/`/orgs`
  (組織一覧, 詳細は「組織一覧ページ (`OrgsPage`)」を参照)/`/materials`・
  `/materials/:documentKey` (規則・資料, 詳細は「規則・資料ページ
  (`MaterialsPage`/`MaterialDetailPage`)」を参照)/`~` (ホーム, 詳細は
  「ホーム画面 (`HomePage`)」を参照)/`~/documents/new` (文書作成フォーム,
  詳細は「文書作成ページ (`NewDocumentPage`)」を参照)/`~/book/new`
  (会計申請作成フォーム — 支出/予算執行/寄付の3種類, 詳細は「会計申請作成ページ
  (`NewTransactionSection`)」を参照) も実装済みです.

現状できていないこと (着手する際は要確認):

- **指摘事項/修正提案の個別詳細ページ**
  (`/orgs/:orgId/documents/:documentId/issues/:issueId`/
  `/orgs/:orgId/documents/:documentId/pulls/:pullRequestId`) — 文書詳細ページの
  実装時に「詳細な指摘事項を表すものは後で実装します」という依頼だったため,
  一覧 (`IssueListRow`/`PullRequestListRow`) は既にこれらの URL へリンクを
  貼っていますが, 実ページが無いため `NotFoundPage` (404) になります.
- **`/`/`/users/:userId`/`/orgs/:orgId`/`/orgs/:orgId/documents`/`/orgs/:orgId/book`/
  `/orgs/:orgId/members`/`/orgs/:orgId/meetings` (と上記の各詳細ページ)/
  `/notifications`/`/documents`/`/documents/new`/`/book`/`/book/new`/`/meetings`/
  `/issues`/`/pulls`/`/orgs`/`/materials`・`/materials/:documentKey` 以外の実ページ**は依然として
  存在しません — Header/Drawer 内のリンク先の一部, および組織プロフィールページの
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
- **リストの角 (一覧 Box/`<table>` など)・フォーカスの枠の角・ボタンの角は,
  特に指示が無い限り既定で `--borderRadius-medium` を使って丸めてください**
  (「今後特に指示が無い場合は, リストの角やフォーカスの枠の角, ボタンの角を
  丸めるようにしてほしい」という依頼による標準方針です — 上記の「新しい指定が
  あった場合は質問する」ルールとは別に, これ自体は既に確立した既定挙動として
  扱ってください. `border-collapse: collapse` の `<table>` は border-radius
  が効かない既知の挙動があるため, `border-collapse: separate; border-spacing: 0;`
  + `overflow: hidden;` に置き換える必要があります — `TransactionItemsList`
  で実際に踏んだ不具合です).
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
    `tabBase`/`selectFieldBase`, 「UI コンポーネントの共通パターン」を参照).
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
  `OrganizationMembersSection`/`OrganizationMeetingsSection`/`Document*`
  (文書詳細ページ)/`Issue*`/`PullRequest*` など, 同じく
  `components/` を挟む配置. 詳細は「組織プロフィールページ」「組織の文書一覧
  (`OrganizationDocumentsSection`)」「組織の入出金一覧
  (`OrganizationBookSection`)」「会計処理詳細ページ」「組織の構成員一覧
  (`OrganizationMembersSection`)」「組織の会議一覧
  (`OrganizationMeetingsSection`)」「会議詳細ページ」「文書詳細ページ」を参照),
  `features/notifications/components/` (`NotificationsSection`/`NotificationListRow`
  など, 組織/文書に紐付かないグローバルな機能のため独立させています.
  詳細は「通知ページ (`NotificationsPage`)」を参照), `features/materials/components/`
  (`MaterialsHomeSection`/`MaterialsExplorer`/`MaterialBreadcrumb` など, 通知と
  同じ理由で独立させています. 詳細は「規則・資料ページ (`MaterialsPage`/
  `MaterialDetailPage`)」を参照), `features/home/components/`
  (`HomeSection`/`HomeSidebar`/`HomeFeed`/`HomeFeedCard`/`HomeEditedDocumentItem`/
  `HomeInProgressTransactionItem` など, 同じ理由で独立させています. 詳細は
  「ホーム画面 (`HomePage`)」を参照) が存在.
- `src/pages/` — ルートと1対1で対応するコンポーネント. 現状 `HomePage` (`/`,
  詳細は「ホーム画面 (`HomePage`)」を参照), `NewDocumentPage` (`/documents/new`,
  詳細は「文書作成ページ (`NewDocumentPage`)」を参照), `NewTransactionPage`
  (`/book/new`, 詳細は「会計申請作成ページ (`NewTransactionSection`)」を参照),
  `UserProfilePage`
  (`/users/:userId`), `NotificationsPage` (`/notifications`, 詳細は「通知ページ
  (`NotificationsPage`)」を参照), `DocumentsPage`/`BookPage`/`MeetingsPage`/
  `IssuesPage`/`PullsPage` (`/documents`/`/book`/`/meetings`/`/issues`/`/pulls`,
  組織を横断した一覧. 詳細は「組織を横断した一覧ページ」を参照), `OrgsPage`
  (`/orgs`, 組織一覧. 詳細は「組織一覧ページ (`OrgsPage`)」を参照),
  `MaterialsPage`/`MaterialDetailPage` (`/materials`/`/materials/:documentKey`,
  詳細は「規則・資料ページ (`MaterialsPage`/`MaterialDetailPage`)」を参照),
  `OrganizationLayout` (`/orgs/:orgId` の親ルート,
  「組織が見つかりません」
  判定と `OrganizationTabs` の表示を担う) とその子ルート `OrganizationOverviewPage`
  (`/orgs/:orgId`, index route)/`OrganizationDocumentsPage`
  (`/orgs/:orgId/documents`)/`OrganizationBookPage` (`/orgs/:orgId/book`)/
  `OrganizationMembersPage` (`/orgs/:orgId/members`)/`OrganizationMeetingsPage`
  (`/orgs/:orgId/meetings`), さらにその子として `OrganizationDocumentLayout`
  (`/orgs/:orgId/documents/:documentId` の親ルート, 「文書が見つかりません」
  判定と上部の要約+タブの表示を担う, 詳細は「文書詳細ページ」を参照)
  とその子ルート `OrganizationDocumentOverviewPage` (index route)/
  `OrganizationDocumentVersionsPage` (`/versions`)/
  `OrganizationDocumentIssuesPage` (`/issues`)/
  `OrganizationDocumentPullsPage` (`/pulls`)/
  `OrganizationDocumentEditorsPage` (`/editors`), `OrganizationTransactionLayout`
  (`/orgs/:orgId/book/:transactionId` の親ルート, 「会計処理が見つかりません」
  判定と上部の状態表示+タブの表示を担う, 詳細は「会計処理詳細ページ」を参照)
  とその子ルート `OrganizationTransactionBreakdownPage` (index route)/
  `OrganizationTransactionProcedurePage` (`/procedure`)/
  `OrganizationTransactionReceiptPage` (`/receipt`), 同様に
  `OrganizationMeetingLayout` (`/orgs/:orgId/meetings/:meetingId` の親ルート,
  「会議が見つかりません」判定と上部の要約+タブの表示を担う, 詳細は
  「会議詳細ページ」を参照) とその子ルート `OrganizationMeetingAgendaPage`
  (index route)/`OrganizationMeetingMaterialsPage` (`/materials`)/
  `OrganizationMeetingAttendeesPage` (`/attendees`)/
  `OrganizationMeetingMinutesPage` (`/minutes`), `NotFoundPage`
  (`path="*"`) が存在.
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
- `src/index.css` の `:root` に `scrollbar-gutter: stable;` を指定しています —
  縦スクロールバーの有無に関わらず常にその分の余白を確保するためで, これが
  無いと, ページ (や, 会議一覧のリスト/カレンダー表示切り替えのように同じ
  ページ内のモード) によってスクロールバーの有無が変わるたびに, `max-width`
  + `margin: 0 auto` で中央寄せしているコンテンツ全体がその分だけ左右に
  わずかにずれて見える不具合になります (「モードを切り替えた際に全体が
  若干左右にずれる」という指摘で追加しました).
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

`NavDrawer` 内の「規則･資料」(`/materials`)/「組織一覧」(`/orgs`, 元は「組織」— 「メニュー
ドロワーの文言について」の依頼で NavDrawer 内のラベルだけ「〜一覧」を付ける形に
統一した際に変更. 詳細は「組織一覧ページ (`OrgsPage`)」を参照) は, 以前は実際の
ドメインが未確定のため `https://<subdomain>.io/{documents,organizations}` という
外部URLのプレースホルダーでしたが, 内部ルーティングへ差し替え済みです.
どちらも実装済みです (「規則･資料」の詳細は「規則・資料ページ
(`MaterialsPage`/`MaterialDetailPage`)」を参照).
「規則･資料」は「文書」(`/documents`, `PrimaryNavLinks` の「全ての文書」/
`CreateButton` の「文書を作成」が指す, 組織が作成する文書の機能) とは別物である
点に注意してください — 当初 `getBreadcrumb.ts` の `documents` に「規則・資料」を
割り当てていましたが, これは「規則･資料」がまだ外部URLだった頃の名残りで,
実際には「文書」の方を指すべき値だったための誤りでした. 現在は `documents: "文書"`/
`materials: "規則・資料"`/`orgs: "組織"` (`/orgs/:orgId` の判定より後に評価されるため,
`/orgs` 単体のときだけ使われます) とそれぞれ独立させています.

「"印刷状況"/"新館予約状況"/"備品貸出状況" の項目をメニュードロワーの "会議一覧" と
"規則･資料" の間に, 分割線で上下を区切って挿入してほしい」という依頼により,
`NavDrawer` の「会議一覧」と (既存の) 区切り線+「規則･資料」の間に, もう1本
区切り線を追加してこの3項目を挟んでいます. リンク先の URL は, 印刷/備品貸出の2つは
「適切な名前」という依頼から `/print-queue`/`/equipment-loans` と推測しましたが,
新館予約だけは後から「`~/room-reservations` にしてほしい」と明示的な指定を受けています
(当初は同様に推測して `/new-building-reservations` としていましたが変更).
それぞれ `CreateButton` の「印刷を依頼」/「新館の使用を申請」/「備品貸出を申請」
(動作はのちほど実装, 詳細は上記) の状況確認ページに相当する想定で, アイコンも
対応する `CreateButton` の項目と同じもの (`IconPrinter`/`IconBuildingEstate`/
`IconPackage`) を再利用しています. **いずれも対応する実ページはまだ無いため
`NotFoundPage` (404) になります** — `getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS`
には他の未実装スタブ (`settings` など) と同様に追加済みのため, 404 表示中も
パンくずには「印刷状況」等の日本語名がそのまま表示されます.

**「メニュードロワーの最下部に分割線を入れ, その下に "組織名/文書名" として
直近で編集した文書を画面に収まる限り入れてほしい」という依頼**により,
「組織一覧」の下に `Divider` を挟んで, `getDocumentsEditedByCurrentUser`
(「ホーム画面」の `MY_EDITED_DOCUMENTS` と同じ関数, `features/organization/
mockData.ts` で共有) の結果を並べています. `.recentDocuments`
(`flex: 1 1 auto; min-height: 0; overflow: hidden;`) が `.drawer` 自体の
スクロール (`overflow: hidden auto`) とは別に, この一覧だけを画面に入りきる
分だけ表示してクリップします (「問題を報告」ボタンを最下部に押し出す役割も
兼ねます). 各行は `MenuLink` ではなく `menuItemBase.root` を直接 `<Link>`
に適用した独自実装で, 先頭のアイコンは文書の組織アバター (`Avater
shape="square" size={20}`, 当初は `IconFileText` でしたが「アイコン部分を
組織のアバターに変更してほしい」という依頼で差し替え), ラベルは「組織名/
文書名」を `overflow: hidden; white-space: nowrap; text-overflow:
ellipsis; min-width: 0;` (「折り返しを無効化してはみ出した部分は3点リーダで
見切れていることを示してほしい」という依頼のため) で1行に収め, `title`
属性 (前述「見切れた文言をホバーで全体表示」を参照) で全体を見せます.

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
全般 (状態, カテゴリなど) に使う想定です. 既定は色を持たず `--color-body-subtext`
のままですが, `color?: "sky" | "mauve"` prop で Catppuccin のアクセントカラー
(`--color-label-sky`/`--color-label-mauve`, `theme.css` に追加) に切り替えられます
— `MeetingListRow`/`MeetingCalendarCard` の延会 (mauve)/流会 (sky) ラベルで使用.
新しい色が必要になったら, 既存の `--ctp-*` パレット (`theme.css` の `:root` に
全色定義済み) から同様に `--color-label-*` を追加してください.

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
  区切りが要る場合は `Divider` を挟みます. `CreateButton` の「会計申請を作成」の
  ように, まだ対応するルートが無い項目は `MenuLink` ではなく素の `<button
  onClick={close}>` にしています — 「印刷を依頼」/「備品貸出を申請」/「新館の
  使用を申請」(依頼により「会議を作成」と「組織を作成」の間に追加, 動作は
  のちほど実装) も同じ理由でこの形にしています.
- トリガーが `IconButton` の場合は `hideTooltip={open}` を渡してください (「正方形アイコン系」参照).
- `UserMenuButton` のプロフィール行 (`.userName`/`.userEmail`) は `white-space: nowrap`
  にしています — `.menu` は `min-width: 240px` (最小値のみで `width`/`max-width`
  は指定していない) なので, 折り返しさえ起きなければ内容が長いときにパネル自体が
  自然に (block/flex の shrink-to-fit で) 広がります. 折り返しを許すと, 長いメール
  アドレスなどが `min-width` の範囲内で複数行に割れてしまうため, 折り返さずパネルの
  幅で吸収する方針にしています.

**フォーム内のドロップダウン選択欄** (`OrganizationSelectField`/
`BudgetLineItemSelectField`, いずれも `features/organization/components/`.
詳細は「会計申請作成ページ (`NewTransactionSection`)」を参照) も同じ
`useDismissablePopover` + `menuItemBase` の構成の亜種です — トリガーが
`IconButton`/`MenuLink` ではなく, `requestFormBase.module.css` の `.input`
と同じ見た目 (枠線+角丸+背景) のボタンである点が異なります. この見た目は
`src/components/ui/selectFieldBase.module.css` (`.wrapper`/`.trigger`/
`.triggerContent`/`.triggerLabel`/`.menu`/`.group`/`.groupLabel`) に
共有の土台として切り出してあります. 「予算項目のドロップダウンを組織の
ドロップダウンと同じ形式にしてほしい, 今後ドロップダウンを実装する場合も
そうしてほしい」という依頼による標準方針です — **フォームにドロップダウンを
追加する際は, ネイティブ `<select>` ではなく今後もまずこのパターンを
検討してください.** グループ分け (所管→組織など, ネイティブ `<optgroup>`
相当) が要る場合は `.group`/`.groupLabel` を使い, グループ見出し自体は
クリックできない non-interactive な行にしてください (`BudgetLineItemSelectField`
が実例).

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
  表示しますが, `settings`/`documents`/`materials`/`orgs`/`meetings`/`book` は階層に関わらず
  1階層目だけを日本語の表示名で表示します (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` に列挙—
  同様の性質を持つルートを新設したらここに追加). `/users/${userId}` (ユーザーのプロフィール
  ページ) も同様に1階層だけの特別扱いですが, `SPECIAL_ROOT_LABELS` とは別ロジックです —
  `userId` が `currentUser.id` と一致すればパス文字列ではなく `currentUser.name` を,
  一致しなければ (実データが無いためどのみち「ユーザーが見つかりません」になりますが)
  `userId` をそのまま表示します.
  `issues`/`pulls`/`notifications` も同様に追加済みで, それぞれ「指摘事項」「修正提案」「通知」
  です — `issues`/`pulls` は他の特殊パスと違い, パンくずだけでなく `PrimaryNavLinks`/`NavDrawer`
  のラベル (ヘッダーのツールチップ/ドロワーの表示文言) もこの表記に揃えるようユーザーから
  指定されたため, そちらも変更済みです (`CreateButton` の「改善点を指摘」は動詞句のため
  対象外としています — NavDrawer/PrimaryNavLinks が「〜一覧」のような名詞句なのに対し,
  `CreateButton` は「これから新しく作る操作」を表す動詞句のまま, という区別は
  「メニュードロワーの文言について」の依頼で NavDrawer 側だけ「一覧」を付けた際も
  そのまま踏襲しています). `logout` はユーザー確認の結果, 専用画面になる想定のため
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
  - リンク先は文書詳細ページ (`/orgs/${organizationId}/documents/${documentId}`,
    実装済み. 詳細は「文書詳細ページ」を参照) の形にしています (`/${userId}/...`
    ではなく組織に紐付く点に注意. こちらも組織プロフィールページ実装時に
    `/orgs/` 配下へ差し替えています). ただし `MOCK_DOCUMENTS`
    (`features/user/mockData.ts`) の `documentId` は組織側の
    `MOCK_ORGANIZATION_DOCUMENTS` とは別の ID 空間のため (「組織プロフィール
    ページ」の「データモデリング」を参照), `bunkasai-plan` など大半の ID は
    一致する文書が無く実際には 404 のままです. カード自体の `border`/
    `border-radius` は指定が無かったため `--borderWidth-thin`/
    `--borderRadius-medium` を流用しています.

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
  設定 `/orgs/:orgId/settings`) です — 概要/文書/会計/会議/構成員は実装済みですが,
  設定タブだけはまだ実ページが無いため, 選択すると `NotFoundPage` (404) が表示されます
  (ヘッダーの下部スロットも失われます). **「設定」のリンク先は
  依頼文に明記が無かったため, 他のタブと同じ `/orgs/:orgId/設定パス` の形で
  `/orgs/:orgId/settings` と推測しています** — 別のパスにしたい場合は
  `OrganizationTabs.tsx` の `tabs` 配列を修正してください. 各タブはラベルの左に
  `Icon` (`size={16}`, `aria-hidden="true"`) を表示します — 概要 `IconHome`/文書
  `IconFileText`/会計 `IconReceiptYen`/会議 `IconCalendarTime`/構成員 `IconUsers`/
  設定 `IconSettings` (`ProfileTabs` の項も参照. 依頼文の `IconRecipientYen`/
  `IconSetting` は `@tabler/icons-react` に存在しない名称だったため, それぞれ
  実在する `IconReceiptYen`/`IconSettings` に読み替えています — 前者は
  `CreateButton` の「会計申請を作成」, 後者は `DocumentFilterSidebar`
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
    (`/orgs/:orgId/meetings/:meetingId` など) に対応するページ自体は
    実装済みですが, `Activity` 側の `meetingId`/`transactionId`/
    `documentId` は下記「データモデリング」のとおり一覧側とはあえて別の
    ID 空間のままにしているため, 実際にクリックすると (一致する `id`
    が無く) 404 になります.
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
  **`position: fixed` + `useFixedSidebarPosition`
  (`src/features/organization/useFixedSidebarPosition.ts`) でスクロールしても
  画面上部を基準として留まるようにしています** — 「文書･会計･会議･構成員の
  サイドバーはスクロールした際に画面上部を基準として留まるようにしてほしい」
  という依頼のためで, `TransactionFilterSidebar`/`MemberFilterSidebar`/
  `MeetingFilterSidebar` も同じフックを使う同一の構造です. JSX は
  「グリッドのセル位置 (幅) だけを保持する空のプレースホルダー `<div>`
  (`ref` を `useFixedSidebarPosition` に渡す) の中に, 実際の見た目を持つ
  `.root` (中身は `position: fixed`, `top`/`left`/`width` はフックの戻り値を
  inline style で適用) を入れる」という入れ子構造にしています.
  - **`position: sticky` ではなく `position: fixed` にしている理由**: sticky
    には2つの構造的な弱点がありました — (1) 親 (CSS Grid, 既定は
    `align-items: stretch`) がこの要素の高さをメイン側の一覧と同じ高さまで
    引き伸ばしてしまうと, 要素の高さが最初からコンテナとほぼ同じ大きさになり
    `top: 0` に貼り付かずそのまま素通りしてしまう (`align-self: start` で
    打ち消せますが), (2) それでも一覧の末尾に近づくと, sticky の containing
    block (グリッドのセル, メイン側の内容量で高さが決まる) の下端をサイドバー
    自身が超えてしまい, 上端が画面外へ押し出されて見えなくなる (会議一覧では
    ミニカレンダーの下端の位置もそれに伴ってずれる) — これは containing block
    の残り高さより sticky 要素自身の高さの方が大きくなる終盤で単純に押し
    出されてしまう, sticky 自体の弱点で `align-self` では解決できません.
    `position: fixed` はスクロール量にも祖先要素の高さにも一切影響されない
    ため, この種の不具合が構造的に起こり得ません.
  - **`useFixedSidebarPosition`** はプレースホルダーの `getBoundingClientRect()`
    から `left`/`width` をそのまま使い, `top` は
    **`Math.max(rect.top, SIDEBAR_TOP_GAP)` (`SIDEBAR_TOP_GAP = 24`)** です —
    「サイドバーのボタンはサイドバー上部に配置された要素か window 上端の
    どちらか近い方から24pxの位置に配置してほしい」という依頼のため.
    ポイントは, **`rect.top` (プレースホルダー自身の, fixed 化する前の通常の
    フロー上での自然な位置) を直接使っている**ことです — プレースホルダーは
    実際の中身を持たない (`position: fixed` にしない) ため, 「今 fixed で
    なかったら本来どこにあるか」= 直前の要素の下端 + そのページの
    `padding-top`/`gap` をそのまま表します. 各ページの `.root`
    (または `OrganizationBookSection` の `.body`) は, サイドバーの直前に
    何が来るか (グローバルヘッダーだけの場合と, 会計タブのように
    `TransactionSummaryBox`+`Divider` が追加で挟まる場合の両方) に関わらず
    **常に `padding-top: 24px` に揃えている**ため, `rect.top` は常に
    「直前の要素の下端 + 24px」と一致し, これを24px未満に縮めないよう
    `Math.max` でクランプするだけで, 個別の要素をページごとに探して測る
    必要なく「直前の要素か window 上端のどちらか近い方から24px」がそのまま
    実現できます. スクロールすると `rect.top` は画面上端に近づいていく
    (viewport 相対の座標が小さくなる) ため, `top` を追従させるには **`resize`
    に加えて `scroll` でも再計算しています** (`scroll` は1回の操作で連続して
    大量に発火するため, `requestAnimationFrame` で1フレームにつき最大1回の
    再計算になるよう間引いています — `MeetingFilterSidebar` の高さ計測で
    確立した手法と同じ考え方です).
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
  `<Link to={`/orgs/${document.organizationId}/documents/${document.id}`}>`
  になっているボタンです. リンク先の文書詳細ページは実装済み (詳細は
  「文書詳細ページ」を参照) で, `MOCK_ORGANIZATION_DOCUMENTS`
  の `id` (`test-org-doc-N`) をそのまま使っているため実際に遷移できます —
  `OverviewSection` の `DocumentCard` (別の ID 空間の `MOCK_DOCUMENTS`
  を参照するため大半が 404 のまま) とはこの点が異なります.
  **`Pagination` はこの Box の内部ではなく,
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
  との完全一致で選択中判定, `useFixedSidebarPosition` によるスクロール追従.
  詳細と注意点は `DocumentFilterSidebar` の項を参照) は
  `DocumentFilterSidebar` と同一です.
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

## 会計処理詳細ページ (`/orgs/:orgId/book/:transactionId`)

GitHub の Pull Request ページを参考にした, 入出金一覧の1件の詳細ページです.
`TransactionListRow` (一覧の各行) は既にこの URL (`/orgs/${organizationId}/book/${id}`)
へリンクしていたため, 実装対象は詳細ページ側のみでした.

- **データモデリング**: 「一覧の1件」と「その詳細」は同一の実体を指すという
  判断で (`OrganizationMember` が構成員一覧の実装時に別の型を新設せず
  フィールド追加で拡張されたのと同じ考え方), `OrganizationTransaction`
  (`features/organization/types.ts`) に `status`/`proposerName`/`items`/
  `procedure`/`receipt` を追加する形で拡張しています — 別の型
  (`TransactionDetail` 等) は新設していません. 一覧側 (`TransactionListRow`
  など) は引き続き既存のフィールドしか参照しないため, この拡張によるコンパイル
  上の影響はありません. 名称 (上部の `<名称>`) は新しいフィールドを追加せず,
  既存の `description` (一覧側で「概要」として使っている, 元々
  "装飾用の布地" のような短い名詞句だったフィールド) をそのまま流用しています.
  なお `MoneyTransactionActivity.transactionId` (組織の「直近の動向」側,
  `transaction-N`) とはあえて別の ID 空間のままです (「組織プロフィールページ」の
  「データモデリング」を参照) — `ActivityCard` の金銭の出納カードからは
  このページへは (一致する `id` が無いため) まだ遷移できません.
- **ルーティング**: `/orgs/:orgId` (`OrganizationLayout`) の子ルートとして
  `book` (一覧, `OrganizationBookPage`) とは別に `book/:transactionId`
  (`OrganizationTransactionLayout`) を並べ, その配下にさらに index
  (`OrganizationTransactionBreakdownPage`, 金額内訳)/`procedure`
  (`OrganizationTransactionProcedurePage`, 手続状況)/`receipt`
  (`OrganizationTransactionReceiptPage`, 証憑) をネストしています.
  `OrganizationTransactionLayout` が `transactionId`
  (`organizationId` と合わせて) の存在チェックと, 上部の状態表示+タブの表示を
  まとめて担い (`OrganizationLayout` と同じ役割分担), 見つかった
  `OrganizationTransaction` を `<Outlet context={transaction} />`
  (react-router) 経由で3つの子ページへ渡します — 子ページ側は
  `useOutletContext<OrganizationTransaction>()` で受け取るだけの薄い
  ラッパーで, 自分では検索/存在チェックを行いません. `OrganizationTabs`
  (概要/文書/会計/…) は `end` 指定の無い `NavLink` (`/orgs/:orgId/book`)
  のため, `/orgs/:orgId/book/:transactionId` 配下でも「会計」タブは
  引き続きアクティブに見えます (前方一致).
- **上部2段 (`TransactionHeaderBox`)**: 1段目は「支出/収入 (太字):
  名称 (太字) 金額 (subtext1, regular)」, 2段目は状態ラベル
  (`TransactionStatusBadge`, 後述) + `IconUser` + 「起案者: 名前 (太字)」です.
  `margin: 24px 0` は `OrganizationHeaderBox`/`TransactionSummaryBox`
  と同じ値を踏襲しています. **1段目 (`.titleRow`) の文字サイズは
  `1.25rem`** — 「`~/orgs/組織ID/book` のメイン上部にある残金の表示
  (`TransactionSummaryBox` の `.balance`) と同じ大きさにしてほしい」
  という依頼のため, その値をそのまま踏襲しています.
- **`TransactionStatusBadge`**: 承認待 (blue)/支払待 (green)/清算待 (peach)/
  完了済 (mauve)/否認済 (red) を, 左右が半円 (`border-radius: 999px`) の
  塗りつぶし背景+太字で表現する専用コンポーネントです. `Label`
  (`components/ui/`, 背景透過+細ボーダー) とは視覚的に別物のため, variant
  として統合せず独立したコンポーネントにしています. 文字色は塗りつぶし色に
  依らず一律 `--color-status-text` (Catppuccin base) — Catppuccin は
  Latte (light) のアクセントカラーが濃いめ, Mocha (dark) のアクセントカラーが
  明るいパステル調という設計のため, base (light は明るい, dark は暗い)
  との組み合わせでどちらのテーマでも十分なコントラストが出ます (`--color-status-*`/
  `--color-status-text` は `theme.css` に追加. 新しいトークンのため
  light/dark 両ブロックに追加済みです).
- **タブ (`TransactionDetailTabs`)**: 金額内訳 (`IconListSearch`, 当初
  `IconChartPie4` でしたが依頼により変更)/手続状況
  (`IconArrowMoveRight`)/証憑 (`IconCertificate`) の3タブです. 見た目は
  `OrganizationTabs`/`ProfileTabs` と同じ `tabBase.module.css`
  を使っていますが, **ヘッダー下部のスロット (`HeaderBottomPortal`) には
  差し込んでいません** — このページは `OrganizationLayout` の子ルートのため,
  ヘッダー下部のスロットは既に `OrganizationTabs` (会計タブなど) が使っており,
  1つのスロットに2段のタブを同時に差し込むことはできません. そのため
  `TransactionDetailTabs` は `TransactionHeaderBox` の下, ページ本文側に
  普通に描画し, `OrganizationTransactionLayout.module.css` の
  `.tabsWrapper` に `border-bottom` を持たせることで, ヘッダー自身の
  `border-bottom` を借りられない代わりの区切り線にしています. 金額内訳
  (index route) のみ他タブの祖先パスに一致するため `end` 指定が必須です.
- **金額内訳 (`TransactionItemsList`)**: 名称/概要/金額/個数/計 の5列の
  `<table>` です (他の一覧が div+flex の「カード風の行」なのに対し, ここは
  実際に列が揃った表形式のデータのため, 素直に `<table>` を使っています).
  各列見出しは `<button>` + `IconCaretUpFilled`/`IconCaretDownFilled`
  (選択中の列, 昇順/降順. 当初は塗りつぶし無しの `IconCaretUp`/`IconCaretDown`
  でしたが依頼により変更) または `IconArrowsSort` (非選択の列, 「並び替え可能」であることを示す
  中立アイコン) で, クリックすると並び替わります — 同じ列をもう一度押すと
  昇順/降順がトグルし, 別の列を押すとその列の昇順から始まります (学年/学級/
  名前と同じ理由で, 金額内訳の各列も「新しい順」のような強い既定が無いため
  昇順を既定にしています. `MemberSortDropdown` の項を参照). 計は
  `unitPrice × quantity` の場で算出し, `TransactionLineItem`
  自体には持たせていません (`OrganizationTransaction.title`
  が整形済み文字列を持つのとは対照的に, こちらは算出元の数値2つをそのまま
  持つ方が自然なため). 最下部の合計行 (名称列を「合計」とし, 計列に全項目の
  計の合計を表示) は `--color-secondary1` の背景で通常の行より暗くしています.
  **`.table` は `border-collapse: separate; border-spacing: 0;` +
  `overflow: hidden;`** — `border-collapse: collapse` だと `border-radius`
  が効かない (角が丸まらない) ブラウザの既知の挙動があり,「金額内訳のリストの
  角を丸めてほしい」という依頼を機にこの構成へ変更しました (「今後特に指示が
  無い場合は, リストの角やフォーカスの枠の角, ボタンの角を丸めるようにして
  ほしい」という標準方針も参照 — 「作業の進め方」参照). 各列見出しの
  `<button>` (`.headerButton`) にも `border-radius: var(--borderRadius-medium)`
  + `:focus-visible` の outline を追加しています — 追加前はフォーカス時の
  見た目が無い状態でした.
- **手続状況 (`TransactionProcedureTimeline`)**: 縦のタイムラインです.
  `.root` に `padding: 0 24px;` (「手続き状況のboxについて, 左右のpaddingを
  24pxとってほしい」という依頼のため) を持たせていますが, **border/
  border-radius は付けていません** — 当初はボーダー付きの Box にしていま
  したが「内容を囲う枠を消してほしい」という依頼により外し, padding
  だけ残しています. **上下は 0** — 当初 `padding: 24px;` (四方) にして
  いましたが, 親 (`OrganizationTransactionLayout.module.css` の `.content`,
  上下 `padding: 24px 0;`) と縦方向の padding が二重にかかり内容が二重に
  囲われて見える (48px の間隔になる) 不具合になっていたため, 上下は
  `.content` 側に任せて 0 にしています (「内側のboxの内, 上下の24pxの
  paddingは0にしてほしい」という依頼のため). その中に, 各手順「円+専用の矢印 (アイコンではなく
  CSS で描いた線+矢頭) を並べた `.rail`」+「ラベル/日時+担当者
  (`IconUser`) の `.stepBody`」を横並びで縦に積んでいます. 未完了の手順は
  ただの円 (`--color-overlay1` の枠線のみ, 塗りつぶし無し, 16px), 完了済は
  `IconCircleCheckFilled`, 否認 (`denied`) だけは別の円 `IconCircleXFilled`
  です. 手順の並び (起案→承認→支払→清算→完了) と, 状態ごとにどこまで完了
  しているかの対応は `mockData.ts` の
  `generateTransactionProcedure`/`COMPLETED_STEP_COUNT_BY_STATUS`
  を参照してください. **否認済の場合は起案の直後に否認ステップで打ち切り,
  それ以降の手順 (承認/支払/清算/完了) 自体を生成していません** — 全手順を
  表示した上で否認された手順だけ×にする案もありましたが, 依頼により起案の
  直後で打ち切る形にしています.
  - **「直近 (現在の状態)」だけを強調する表示**: 「最後の完了のチェックマーク
    以外はsubtext0色に」「チェックマークは最近のもの以外大きさを24pxに」
    「最近のものは30px x 30pxに」という一連の依頼により, 手順のうち時系列で
    最後に完了した1件 (`denied` を含む — `TransactionProcedureTimeline.tsx`
    の `lastCompletedIndex`) だけを通常の色+30pxで強調し, それより前の
    完了済の手順は円 (色/24px)・ラベル・日時+担当者のすべてを
    `--color-body-subtext0` (`theme.css` に新規追加 — 既存の
    `--color-body-subtext` = subtext1 とは別のトークンです. これを直接
    変更すると他の (既に subtext1 を使っている) 箇所すべてに影響が及んで
    しまうため) に落として背景に退かせています. 未完了の手順の見た目
    (ただの円, ラベルは通常色) はこの対象外です.
  - **`.circle` は常に固定 30px のボックス**: 中のアイコンは16/24/30pxと
    可変ですが, ボックス自体は固定サイズで, アイコンをその中で中央寄せ
    しています — 可変にしていた当初, `.rail` (円+矢印の列) は行ごとに
    独立したフレックスコンテナのため, 円のサイズがそのまま `.rail` の実効幅
    を決めてしまい, 30px の行と24pxの行とで中心の横位置が3pxずれる不具合が
    ありました (「最近のチェックマークの中心と他のチェックマーク・矢印の
    中心がズレている」という指摘はこれです) — 固定サイズにすることで
    `.rail` の実効幅が常に同じになり, `align-items: center` による中央寄せが
    全行で同じ横位置になります.
  - **円の縦方向の中心をラベル〜日時+担当者の中心に一致させる**: 「チェック
    マークの縦方向の中心は, 手順の名称の上端から実行者の名前の下端までの
    中心と同じにしてほしい」という依頼のため, `.rail` を
    [前の円からの矢印 (無ければ透明なスペーサー `.connectorSpacer`) / 円 /
    次の円への矢印 (無ければスペーサー)] の3つを縦に並べる構成にし,
    `.rail` 自体を `.step` (行全体, `.stepBody` の高さで決まる) いっぱいに
    伸ばしています. 前後の矢印/スペーサーはどちらも `flex: 1 1 0`
    (basis を明示的に 0 にする — 後述) なので均等に伸び, 結果として円は
    自動的に `.rail` の縦方向中央 = `.stepBody` の縦方向中央 (`padding: 8px
    0;` が上下対称なため, パディング込みの中央とラベル〜日時+担当者だけの
    中央は一致する) に来ます.
  - **円を繋ぐ矢印 (`.connector`)**: 汎用の矢印アイコンではなく, 縦線
    (`.connectorLine`, `background: currentcolor` の1px幅) + CSS の
    border トリックで描いた矢頭 (`.connectorArrowhead`) で繋いでいます —
    「専用の矢印で繋いでほしい, タイムライン表示を縦にしたような表示に
    してほしい」という依頼のため. **1本の矢印を隣り合う2行に分けて描画**
    しています — 前の行の `.rail` 後半 (次の円への矢印, 線のみ) と, 次の行の
    `.rail` 前半 (前の円からの矢印, 線+矢頭) の2つの要素が, 行同士に隙間が
    無いためつながって見た目には1本の連続した矢印になります (矢頭は
    「これから到達する円」側にだけ付けています). これにより「矢印は
    前段階の円の縁から次の円の縁まで隙間なく伸びる」が実現できます
    (円を rail の中央に置きつつ, かつ矢印が両隣の円の縁ちょうどで途切れる,
    という2つの要件を同時に満たすための構成です). **`.connector`/
    `.connectorSpacer` の `flex-basis` は `auto` ではなく明示的に `0`
    にしています** — 矢頭が付く側 (前の円からの矢印) は矢頭の高さ (5px)
    の分だけ `auto` だと初期サイズが大きくなり, 矢頭の無い側 (次の円への
    矢印) との間で最終的な高さが5pxずれ, 結果として円の中心が2.5px
    ずれる不具合になっていました — `flex-basis: 0` で純粋に `flex-grow`
    の比率 (どちらも1) だけで分配することで, 矢頭の有無に関わらず前後が
    正確に半分ずつになります. **色は既定で `--color-overlay1`, 直近の
    手順に繋がる矢印だけ `--color-body-subtext0`** (「最近のチェック
    マークに伸びる矢印もsubtext0色にしてほしい」という依頼のため, 当初の
    緑/赤から変更) にしています — それ以外 (まだ完了していない手順同士を
    繋ぐ矢印など) は overlay1 のままです (否認ステップの後ろに矢印は
    存在しません — 手順自体がそこで打ち切られるため).
- **証憑 (`TransactionReceiptBox`)**: 「1項目だけのリストのような見た目の
  Box」として, `DocumentListBox` の `.toolbar` と同じ考え方の行 (背景
  `--color-secondary1`) に文書ID (太字)+アップロード者+アップロード日を表示し,
  その下にプレビュー領域を配置しています. **実ファイルの保存先が無いため,
  プレビューは本物らしく見せるダミー画像ではなく, それとわかる破線枠+
  ファイル種別アイコン (`IconPhoto`/`IconFileTypePdf`) のプレースホルダーに
  しています** — 実データのように誤解されるリスクを避けるための意図的な判断
  です (ユーザーに確認済み).
- **日付の扱い**: 手続状況の日時/証憑のアップロード日は, `createdAt`/
  `editedAt` と同じ UTC 起点の日数 (`MOCK_TRANSACTION_LIST_BASE_DAY` からの
  経過日数) を元に, `mockData.ts` 内の専用ヘルパー
  `formatEpochDayTime` で組み立てています. `calendarUtils.formatDateTime`
  (ローカルタイムゾーン基準, 会議のように `setHours` などローカルに構築した
  `Date` 向け) は意図的に使っていません — 混在させると `calendarUtils.dateKey`
  で以前踏んだのと同種のタイムゾーンずれの不具合になるためです.
- **モックデータの整合性**: `generateTransactionItems` は, 金額内訳の各項目の
  計の合計が, その会計処理自体の金額 (`amountAbs`) と必ず一致するように
  生成しています (`splitAmount` で合計を保ったまま分割した上で, 割り切れる
  場合だけ個数2-3を採用し, それ以外は1個 = 単価が壊れないようにしています) —
  金額内訳タブの合計行と, 上部の金額表示が食い違わないようにするためです.

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
  だけを持ちます. 構造 (`useFixedSidebarPosition` によるスクロール追従含む) は
  `DocumentFilterSidebar`/`TransactionFilterSidebar` と同一です.
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

## 組織の会議一覧 (`OrganizationMeetingsSection`)

`src/features/organization/components/OrganizationMeetingsSection.tsx` は
`/orgs/:orgId/meetings` (「組織プロフィールページ」参照) の本文です. 他の一覧と
同様「基本的な構造は文書一覧と同じで, そこからの変更点」という依頼文の通り
`Document*` 系を `Meeting*` として並行複製していますが, 依頼内容自体がリスト/
カレンダーモードの切り替えという大きな追加機能を含むため, 他の一覧より新規
コンポーネントが多くなっています.

- **`type OrganizationMeeting`/`MeetingStatus`** (`types.ts`) — `status`
  (`Normal`/`Postponed` (延会)/`Canceled` (流会)) を持ちます. 日付は
  `startsAt` (開催日時)/`scheduledAt` (登録日時, ソート用の2本目の日付として
  `DocumentSortField` の `editedAt`/`createdAt` に相当) をどちらも
  ISO 形式 (`"YYYY-MM-DDTHH:mm"`, タイムゾーン無し — ローカルタイムとして
  `new Date(...)` でそのまま解釈させるため) の文字列で持たせています.
  `MeetingSortField` (`StartsAt`/`ScheduledAt`/`Title`, ラベルは「開催日時」/
  「予定日時」/「会議名」) も他と同じ3フィールド構成です.
- **`src/features/organization/calendarUtils.ts`** — カレンダー表示 (ミニ
  カレンダー/2週間カレンダー) で共通して使う日付計算をまとめた, `types.ts`/
  `mockData.ts` 同様 feature 直下のユーティリティです (ドメインにもコンポーネント
  にも依存しない汎用処理ですが, このカレンダー機能でしか使わないため `src/lib/`
  ではなくここに置いています). 週の始まりは日曜日で統一. **`dateKey(date)`
  (年月日から `"YYYY-MM-DD"` を組み立てる, カレンダーの日付グルーピング用のキー)
  は `Date.toISOString().slice(0, 10)` を使わないよう注意してください** —
  `toISOString()` は UTC 変換を伴うため, ローカルタイムゾーンが UTC からずれて
  いると `getDate()` 等 (ローカル基準) ベースの表示日と1日ずれる不具合になります
  (実装中に実際に発生し, `MeetingCalendarView` の日付セルとその中の会議カードの
  日付が食い違うというかたちで表面化しました — 修正の経緯は git 履歴を参照).
  ローカルの年月日 (`getFullYear()`/`getMonth()`/`getDate()`) から文字列を
  組み立てる形にしています.

以下は最終的な仕様のみを記載しています (この機能は依頼が何度も細かく往復した
経緯があります — 試行錯誤の過程は git 履歴を参照してください).

- **`MiniCalendar`**: `MeetingFilterSidebar` の下部, 分割線 (`Divider`, 横線) の
  下に表示する, macOS のカレンダーアプリ左下のような月表示です. `.calendarSection`
  (`MeetingFilterSidebar.module.css`, `Divider`+`MiniCalendar` をまとめた
  `margin-top: auto` の `<div>`) に包まれており, サイドバー (`MeetingFilterSidebar`
  の `.root`, 高さの決め方は後述) の**最下部に貼り付きます**.
  - `highlightWeekStart: Date` prop に `MeetingCalendarView` の `weekStart`
    state をそのまま渡し (`OrganizationMeetingsSection` → `MeetingFilterSidebar`
    → `MiniCalendar` のバケツリレー), その週から `HIGHLIGHT_WEEK_COUNT` (= 2,
    `MeetingCalendarView.tsx` の `WEEK_COUNT` と同じ数を維持する定数) 週分を
    青枠で囲んでメイン側と連動していることを示します. `showHighlight: boolean`
    prop (`viewMode === ViewMode.Calendar`) が偽のとき (リスト表示中) はこの枠を
    非表示にします.
  - 自身の表示月は独立した `useState<Date>` (`monthAnchor`, 既定は今日を含む月)
    で管理し, ヘッダーの `<IconChevronLeft/Right>` (1回で1か月移動) と「今日」
    ボタンで手動でも移動できますが, `highlightWeekStart` が変わったタイミングで
    レンダー中に `monthAnchor` を追従させます (React 公式の
    ["props に応じて state を調整する" パターン](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes) —
    `useEffect` + `setState` だとカスケードする再レンダーになるため, 前回の
    `highlightWeekStart` を保持した `useState` と比較し, 変化していたらレンダー中に
    直接 `setMonthAnchor` する形にしています) — 手動で別の月に移動していても,
    メイン側の週が変わった時点でそちらが優先されます.
  - **`resolveHighlightMonthAnchor(highlightWeekStart)`**: `highlightWeekStart`
    が属する月をそのまま使うと, ハイライトする2週間の末尾が6行グリッドの6行目に
    かかって見切れることがあります (例: 月末最終週の日曜が起点になる場合).
    **7行目を追加して回避するのではなく, その場合は翌月を返します** — 月末に
    近い週は翌月グリッドの1行目 (前月末の前詰め) として必ず収まるため, これだけで
    確実に回避できます. **この回避処理は自動追従のときだけ**適用され, 手動の
    前月/翌月ボタンは単純な±1か月のままです — 手動ボタンにも適用すると, 見切れる
    月に向かって「前月」を押したときに翌月へ弾かれ, その方向にはそれ以上進めなく
    なるためです.
  - ヘッダー行 (`.header`) は年月ラベル (0.9rem, サイドバーの他の文字と同じ
    大きさ) を左に, `[<][今日][>]` を右寄せで並べます. この `[<][今日][>]`
    (`MeetingCalendarView` のメイン側ナビゲーションも同様) は3つの `<button>`
    がそれぞれ個別の border を持つのではなく, **`calendarNavGroup.module.css`
    (`.root`: 外枠の border+border-radius, `.item`: 隣接ボタンとの間の
    `border-left`) という共有 CSS Module** で「1つの罫線付きボックスの中に
    区切り線で仕切られた3ボタン」という見た目を実現しています. `.root` は
    `overflow: hidden` を使わず, 最初/最後の子要素にだけ `:first-child`/
    `:last-child` で角丸を個別指定しています — サイドバーの `<`/`>` に付けた
    `.tooltip` (`content: attr(aria-label)` の CSS のみのホバー時ツールチップ,
    `controlBase.module.css` と同じ仕組み) が `position: absolute; top: 100%;`
    で下にはみ出すため, `overflow: hidden` があるとそれごと切り取られてしまう
    ためです. **`.navButton`/`.todayButton` 自身に `border: none;` を書かない
    よう注意してください** — import 順序の都合で `.item` の `border-left`
    (区切り線) を上書きしてしまいます (button の border は `src/index.css`
    のグローバルなベースラインで既に none のため, 再指定は不要かつ有害です).
  - 週の行は `<div>` ではなく **`<button type="button">`** です — `onWeekSelect:
    (weekStart: Date) => void` prop (クリックした行の先頭日曜日を渡す) で行全体を
    クリック可能にしています. 実際に何をするか (メインの週を切り替えるか, 検索欄に
    期間を入力するか) は呼び出し元 (`OrganizationMeetingsSection`, 後述) が判断
    します. **`border-radius` は `:hover` に付けていません** —
    `.weekHighlightTop`/`.weekHighlightBottom` (角だけを丸める指定) と衝突し,
    ハイライト中の行をホバーした際に四隅すべてが丸まってしまうためです.
  - 日付セルは「外側 `.day` (33px 四方) が内側 `.dayInner` (24px の円) を中央に
    包む」二重構造です — 円の半径を枠 (行の `border`) より一回り小さくして
    接触を避けています. `.weekdayRow`/`.weeks` は `align-self: center;` で
    内容の幅ぴったりに収めた上で中央寄せにしています — これが無いと (幅いっぱいに
    引き伸ばされてしまい) 週の枠線 (`.weekHighlighted`) がサイドバーの余白領域
    まで囲んでしまいます. 今日は `.dayInner` に `--color-link` の背景+白文字+
    `font-weight: 700` を適用します.
- **`MeetingFilterSidebar`**: 依頼文で明示された7件 (`IconHome` 全て/
  `IconBinaryTree` 組織内のみ/`IconCalendarEvent` 開催予定/`IconUsers`
  要参加/`IconCalendarRepeat` 延会/`IconCalendarOff` 流会/`IconArchive`
  過去の会議) + `.calendarSection` (`Divider` + `MiniCalendar`, 上記) という
  構成です. フィルター一覧自体の構造 (menuItemBase ベース) は他と同一です.
  `viewMode`/`onWeekSelect` を受け取り, そのまま `MiniCalendar` に渡すだけの
  中継点です.
  - **サイドバーの縦幅**: 他3つのサイドバーと同じ `useFixedSidebarPosition`
    (`position: fixed` + プレースホルダー, 詳細は `DocumentFilterSidebar`
    の項を参照) を使い, `top`/`left`/`width` はフックの戻り値をそのまま適用
    しています. それに加えて **`height` だけ, フックが返す `top` と
    `div#root` (`index.html` の React マウント先) の下端から
    `MeetingFilterSidebar.tsx` 側で追加で算出**しています
    (`Math.max(0, rootBottom - position.top)`) — 「ミニカレンダーの最下部は,
    windowの最下部ではなくdiv#rootの最下部に合わせてほしい」という依頼のため
    (当初は `window.innerHeight` を使っていました). `#root` の下端は
    `document.getElementById("root")!.getBoundingClientRect().bottom` で,
    `document.body.getBoundingClientRect().bottom` と同様 (詳細は
    `MeetingCalendarView` の項を参照) `position: fixed` な子孫 (このサイドバー
    自身を含む) の分だけ膨張しないため, 自分自身の高さの算出に使っても
    循環参照にはなりません. `window.innerHeight` (常に一定) と異なり `#root`
    の下端は viewport 相対の位置が scroll のたびに変わるため, レンダーの
    たびに都度実測しています — `position` (`useFixedSidebarPosition` が
    scroll のたびに再計算して返す state) が変わるたびにこのコンポーネントも
    再描画されるため, scroll/resize に対しては専用のリスナーを別途持たなくても
    追従できます. ただし `#root` の高さは `MeetingCalendarView` 側の JS
    (マウント後の `requestAnimationFrame` で高さを実測・確定する非同期処理)
    によっても変わるため, **`ResizeObserver` で `#root` 自体のサイズ変化も
    別途検知して再描画しています** — これが無いと, サイドバーが自身の
    position/height を最初に計算した時点ではまだメイン側の高さが確定しておらず,
    古い `#root` の下端を元にした高さのまま取り残される不具合になっていました
    (実装中に実際に発生し, Playwright で `sidebarBottom` と `rootBottom`
    の実測値がずれることで確認しました). **`MeetingCalendarView`
    (カレンダーモードのメイン側) の高さもこの `#root` の下端と一致させる
    必要がありますが, それは `MeetingCalendarView` 自身が別途 JS で実測して
    います** (詳細はそちらの項を参照) — サイドバーが `position: fixed`
    になったことで CSS Grid の行の高さ計算に一切寄与しなくなったため,
    「メイン側がサイドバーの高さに `flex` で便乗する」という以前の方式は
    使えなくなっています.
- **`ViewModeToggle`**: 検索バーの隣に配置する, リスト/カレンダー表示の
  切り替えトグルです. 常に両方のアイコン (`IconCalendarWeek`/`IconMenu2`) を
  表示したまま, 選択中を示す `.indicator` を `transform: translateX()` で
  スライドさせます. **既定はカレンダー表示** (`ViewMode.Calendar` — 「カレンダー
  表示が標準になるようにしてほしい」という依頼のため. 当初はリスト表示が既定
  でした). `.indicator` は独立した
  `border`/`background: var(--color-background)`/`box-shadow` を持つ「トラック
  (`.root`, `--color-surface0` の少し沈んだ背景) の上に浮いたボタン」に見える
  ようにしています (`z-index: 1` の `.indicator` の上に `z-index: 2` の
  `<button>` が重なる2層構成). ボタン間の区切り線 (`.divider`) は indicator と
  重なって見づらかったため削除しています. **ツールチップ**: `aria-label`
  (「週間表示に切り替え」/「リスト表示に切り替え」) を `calendarNavGroup` と
  同じ `content: attr(aria-label)` ベースの CSS で `.button` に直接表示します
  (両方のボタンが対象なので `calendarNavGroup` の `.tooltip` のような opt-in
  クラスに分ける必要はありません).
- **`MeetingListRow`**: `MemberListRow` と同じ2行構成ですが, 先頭がアバターでは
  なく (会議に写真は無いため) 直接テキストから始まります — タイトル行に会議名
  (太字) + 状態に応じた `Label` (`Postponed` → `color="mauve"` の「延会」,
  `Canceled` → `color="sky"` の「流会」, `Normal` は何も表示しない), 概要行に
  議題をコンマ区切りにした文字列 (`meeting.agenda.join(", ")`) を表示します.
  右詰め2段は `IconCalendarTime` + 開催日時 (`YYYY/MM/DD HH:mm`)/`IconDoor` +
  教室名です.
- **`MeetingListBox`/`MeetingSortDropdown`/`MeetingSearchBar`**: 他の一覧
  (特に `MemberListBox` — ページ切り替え時の自動フォーカス, 矢印キーでの
  行移動, `role="listbox"` + `tabIndex={-1}` を含む) と同一構造の複製です.
  件数表示は「n件の会議」, 検索欄のプレースホルダーは「会議を検索」.
- **週選択時の挙動の切り替え (`OrganizationMeetingsSection`)**: `MiniCalendar`
  の週ボタンをクリックしたときの実際の挙動は, 状態を一元管理する
  `OrganizationMeetingsSection` の `handleCalendarWeekSelect` が
  `viewMode` を見て判断します — **カレンダーモードならその週を `calendarWeekStart`
  (= メインの表示期間の先頭) にする**, **リストモードなら** 他のサイドバー
  フィルターと同じ「ラベル: 値」形式 (`` `期間: ${formatDate(weekStart)}-
  ${formatDate(weekEnd)}` ``, 例: `期間: 2026/08/09-2026/08/15`) の文字列を
  検索欄に入れます (フィルター自体はまだ実装しないため, 他のフィルターと同様に
  実際には一覧は絞り込まれません).
- **`MeetingCalendarView`**: カレンダーモードのメイン表示です. リストモードの
  ページネーションと同じ位置に, 見出し + `[<][今日][>]` のナビゲーション
  (`calendarNavGroup`, 上記) を表示します. 本体は7列×2行の `display: grid`
  で, `WEEK_COUNT = 2` (`MiniCalendar` の `HIGHLIGHT_WEEK_COUNT` と揃える定数)
  週分, `calendarUtils.getWeeksGridDays(weekStart, WEEK_COUNT)` が返す14日分を
  並べています. **グリッドに `overflow: hidden` を使っていません** — 角丸の
  見た目のためだけに付けると, 日付セル内のカードのホバーポップオーバー (セルの
  外, 隣接する行にまではみ出して表示される) まで一緒に切り取られてしまうため,
  4隅のセルだけ `:nth-child(1)`/`:nth-child(7)`/`:nth-child(8)`/`:nth-child(14)`
  で個別に `border-*-radius` を指定しています (`MeetingCalendarCard` の項も参照).
  - **上段 (今週) は下段 (次週) の2倍程度の高さ**: `grid-template-rows: 2fr
    1fr;` に加え, `.dayCellTopRow { min-height: 200px; }`/`.dayCellBottomRow
    { min-height: 100px; }` で表現しています. 上段の日付 (`index < 7`) だけ
    `MeetingCalendarCard` に `expanded` prop を渡します (下記).
  - **ナビゲーションは上下矢印 (`IconChevronUp`/`IconChevronDown`) で, 1週間
    ずつ**移動します (`addDays(weekStart, ±7)`) — 表示している週数
    (`WEEK_COUNT` = 2週間分) とナビゲーションの移動量 (1週間) は独立しており,
    矢印を押すたびに表示がスライドウィンドウのように1週ずつずれます.
  - **見出しの年月は「表示中の2週間のうち日数の多い方の月」**:
    `calendarUtils.getDominantMonthAnchor(weekStart, days)` が, 14日分を
    月ごとに集計し最多の月を返します (同数の場合は `weekStart` — 上段の週 —
    の月を優先. 実装は `topWeekKey` の集計数を初期値にして, より多い月が
    見つかったときだけ上書きする形でこの優先順位を表現しています).
  - **見出しの月と異なる日付は `MM/DD` 表示**: 各日付セルの数字は,
    `isSameMonth(day, displayMonthAnchor)` が偽の場合
    `calendarUtils.formatMonthDay(day)` (`"MM/DD"`) を, 真の場合は
    `day.getDate()` を表示します. `.dayNumber` は `MM/DD` (5文字) も収まる
    よう `min-width: 24px; padding: 0 6px; border-radius: 999px;` のピル形状
    です (1-2桁の通常の日付は実質的に円に見えます).
  - 休日 (土日) の欄は `.dayCellWeekend { background: var(--color-secondary1);
    }` (Catppuccin `mantle`) で背景のトーンを落としています. 今日の日付
    (`.dayNumberToday`) は `font-weight: 700` です.
  - **縦幅は window の下端に一致するよう JS で実測しています** —
    「メインがカレンダー表示の場合には, その最下部がミニカレンダーの最下部に
    来るようにしてほしい」という依頼のため. `.grid` の
    `getBoundingClientRect().top` から `window.innerHeight - top`
    を計算し, `.grid` に inline style として直接適用しています
    (`MIN_GRID_HEIGHT = 300` を下限としてフォールバックします. マウント直後の
    1回だけだと window の実際のビューポートが確定しきっておらず, わずかに
    ずれた高さで測ってしまうことがあったため, 次のフレームでもう一度
    測り直しています — `MeetingFilterSidebar` の位置計測で確認済みの不具合
    と同種です). **意図的に `window.innerHeight` を使い続けており,
    `MeetingFilterSidebar` (後述) のように `div#root` の下端は使っていません**
    — `.grid` は通常のフロー上の要素のため, その高さ自体が `#root`
    の下端を決める側の要因の1つです. もし `.grid` の高さの目標を `#root`
    の下端から逆算すると, 「今の高さを反映した `#root` の下端」を目標に
    して次の高さを決め, それがまた `#root` の下端を押し広げ…という循環
    (実測するたびに `OrganizationMeetingsSection` の `.root` の
    `padding-bottom` (24px) 分だけ際限なく伸び続けてしまう不具合) になるため,
    ここだけは `.grid` 自身の高さに依存しない `window.innerHeight`
    を目標にする必要があります. 一方 `MeetingFilterSidebar` は
    `position: fixed` で通常のフローから外れており `#root`
    の下端の算出に一切寄与しないため, 同じ問題が起きず `#root`
    の下端をそのまま目標にできます (詳細はそちらの項を参照). **この結果,
    `.grid` の下端は `MeetingFilterSidebar`/ミニカレンダーの下端より
    `padding-bottom` の分 (24px) だけ浅い位置で止まります** — 「メイン
    最下部とミニカレンダー最下部を一致させる」という当初の依頼に対しては
    厳密には一致しなくなりましたが, 上記の循環を避けるための意図的な
    トレードオフです. ページ全体は依然として window よりわずかに (24px)
    高くなり縦スクロールバーが出ます — これは, サイドバー側が
    `position: fixed` で常にこの高さちょうどに固定されているのに対し,
    メイン側 (`.main`) は通常のフロー上の要素のままである, という
    非対称な構造上避けられないトレードオフです. **当初は親の `.main` が
    CSS Grid の行の高さとしてサイドバーと揃って伸びるのに便乗する
    (`flex: 1 1 auto`) 方式でしたが, サイドバーを `position: fixed`
    (`useFixedSidebarPosition` を参照) にしたことでサイドバーがグリッドの
    行の高さ計算に一切寄与しなくなり, この便乗方式が効かなくなったため**
    (「サイドバーにはミニカレンダーも含めてください」という指摘はこの
    不具合を指しています), 上記の JS 実測方式に戻しています.
  - **土日の列で会議が無ければ幅を70%に圧縮**: `.grid`/`.weekdayRow` の
    `grid-template-columns` は CSS 上は `repeat(7, 1fr)` のままですが, 実際には
    JS が計算した文字列を inline style で上書きします. 列 (0=日曜/6=土曜) に
    ついて, 上段・下段どちらの日にも会議が無ければその列だけ `"0.7fr"`,
    それ以外は `"1fr"` として結合し, `.grid` と `.weekdayRow` の**両方に同じ値**
    を適用しています (fr 単位のため圧縮した分の余白は他の列に自動的に
    再分配されます. `.weekdayRow` にも同じ列幅を渡すことで, 曜日ラベルが
    圧縮後の列の中央からずれないようにしています).
  - **`.dayCell` に `min-width: 0`** を指定しています — CSS Grid の既定
    (グリッドアイテムの自動最小サイズは中身の min-content 幅) により,
    これが無いとカード内の長い文字列がその日の列を押し広げてしまいます.
- **`MeetingCalendarCard`**: 日付セル内のカードで, `expanded: boolean` prop
  (上記の通り上段の週だけ true) によって2つの見た目に分かれます.
  - **`expanded: false` (下段の週, 既定)**: 「HH:mm 会議タイトル」のみを
    `.cardLabel` (1行, 省略記号) として表示し, ホバー (または
    `:focus-visible`) すると, リスト行と同じ情報 (ラベル/議題/開催日時/教室)
    を JS を使わない CSS のみのポップオーバー (`opacity`/`pointer-events`
    を `:hover`/`:focus-visible` で切り替えるだけ) で表示します.
  - **`expanded: true` (上段の週)**: ポップオーバーを使わず, 同じ情報を
    カード自身に常時表示します — タイトル行「HH:mm タイトル」(`.expandedTime`
    + `.expandedTitle`, 時刻はアイコン無しでタイトルの左横. `.expandedTime`
    は固定色ではなく `opacity: 0.75` — 固定色にすると `.card:hover` で背景色が
    反転した際 `color: inherit` を経由しないぶん読みにくくなり得るためです),
    議題 (`.expandedAgenda`, 2行で省略), 教室 (`.expandedMeta` + `IconDoor`)
    の順です. **延会/流会の `Label` (状態タグ) は expanded カードには表示しません**
    — `statusLabel` 自体は compact 版のポップオーバーでは引き続き使っています.
    `.expandedTitle` には **ネイティブの `title` 属性**
    (`title={meeting.title}`) を付けています — 会議名が省略記号になった場合に
    ホバーで全体を見せるためで, ボタン類の `aria-label` ベースの独自 CSS
    ツールチップとは異なり, 可変長の実データにはブラウザ標準の `title` の方が
    単純だと判断しました.
  - どちらの見た目でも, **カード自身に `overflow: hidden` を付けないよう
    注意してください** — テキストの省略記号は内側の要素 (`.cardLabel`/
    `.expandedTitle`) だけに付けており, カード自身 (ポップオーバーの
    `position: absolute` の基準/containing block) に `overflow: hidden`
    を付けると, カードからはみ出て表示されるはずのポップオーバーごと
    切り取られてしまいます (実装中に実際に踏んだ不具合です — 「ホバーしても
    何も表示されない」ように見えたため, 一見 `opacity`/`pointer-events`/
    `z-index` の設定ミスを疑いましたが, 原因は祖先要素の `overflow: hidden`
    によるクリップでした).
  - **ポップオーバーの左右寄せ** (compact 版のみ): 既定は左揃え (`left: 0`)
    ですが, グリッド右寄りの列 (木/金/土, `MeetingCalendarView` が
    `columnIndex % 7 >= 4` で判定し `popoverAlign="right"` を渡す) では
    右揃え (`right: 0; left: auto;`) に切り替え, ポップオーバーが画面右に
    はみ出して横スクロールバーが出てしまう不具合を避けています
    (`useTooltipAlign` のような実測ベースの動的判定ではなく, 列位置による
    静的な判定です — このカレンダーは列数・列幅が固定のため, この簡易な
    方法で十分と判断しました).
- **`Label` の `color` prop**: 延会 (mauve)/流会 (sky) のラベル表示のため
  `Label` (前述の「UI コンポーネントの共通パターン」を参照) に色指定を
  追加しました. 詳細はそちらを参照してください.
- **モックデータ**: `MOCK_ORGANIZATION_MEETINGS` (`features/organization/mockData.ts`)
  は今日を基準に -10日〜+9日の20日間, 1日2件ずつ (カレンダーモードで1つの
  日付セルに複数件が積み上がる見た目も確認できるように) 40件を機械的に
  生成しています. `MEETING_ANCHOR` はモジュール読み込み時の `new Date()`
  (時刻は 0:00 にリセット) を基準にしているため, **モックデータの日付範囲は
  実行時の実際の日付に追従します** (documents/book/members のような固定の
  過去日付起点ではありません — カレンダーの「今日」との位置関係を常に
  確認できるようにするための意図的な設計です). 9件に1件を延会,
  11件に1件を流会 (両方に該当する場合は延会が優先されます) にしています.

## 会議詳細ページ (`/orgs/:orgId/meetings/:meetingId`)

会計処理詳細ページ (`/orgs/:orgId/book/:transactionId`) と基本的に同じ構成
(存在チェック+上部要約を担う親レイアウト, ページ本文側のタブバー
(`MeetingDetailTabs`, `TransactionDetailTabs` と同じくヘッダー下部の
スロットではなく本文側に描画), `<Outlet context={meeting} />` +
`useOutletContext` で子ページへ受け渡す薄いラッパーページ) です — 差分の
みここに記載します. `MeetingListRow` (一覧の各行) は既にこの URL
(`/orgs/${organizationId}/meetings/${id}`) へリンクしていたため, 実装対象は
詳細ページ側のみでした.

- **データモデリング**: 会計処理詳細ページと同じ考え方 (「一覧の1件」と
  「その詳細」は同一の実体を指す) で, `OrganizationMeeting`
  (`features/organization/types.ts`) に `attendees`/`materials`/`minutes`
  を追加する形で拡張しています. **`attendees: OrganizationMember[]`
  は ID 参照ではなく実体を直接埋め込んでいます** — 出席者タブの表示に
  そのまま使う値のため, 構成員一覧の `MemberListRow` にそのまま渡せる形が
  自然だと判断しました (`documentId`/`meetingId` 等, 「組織とは分離して
  考える」ために意図的に ID 参照+フラットな別テーブル相当にしている
  `Activity` 系のフィールドとは異なる設計判断です). `minutes:
  MeetingMinutes[]` (議事録タブ用, 後述) も配列にしており, 「同じ会議が
  複数回に分けて開催されることがある」という想定を表現しています.
- **上部要約 (`MeetingHeaderBox`)**: `TransactionHeaderBox` と同じ構成
  (1段目 太字1.25rem+2段目メタ情報) です. 1段目は会議名 (太字)+開催日時
  (subtext, regular), 2段目は状態ラベル (延会/流会, `MeetingListRow`
  と同じ `Label` — 新しいバッジ (`TransactionStatusBadge` のような塗り
  つぶし) は作らず既存のものをそのまま再利用しました. 通常は何も表示しません)
  +開催場所 (`IconDoor`)+出席者数 (`IconUsers`) です.
- **タブ (`MeetingDetailTabs`)**: 議題 (`IconListDetails`)/資料
  (`IconFolders`)/出席者 (`IconUsers`)/議事録 (`IconNotes`, 「出席者の隣に
  議事録というタブを増やしてほしい」という依頼のため出席者の次, 末尾に
  追加) の4タブです.
- **議題タブ (`MeetingAgendaList`)**: 「リスト形式」という依頼のため,
  `meeting.agenda` を採番付きのボーダー付き Box (角丸は「リストの角は
  既定で丸めてほしい」という標準方針のため) で表示するだけの単純な
  コンポーネントです. **「議題の各項目を, 資料タブの対応する議題の
  一番上の資料を開くリンクにしてほしい」という依頼により**, その議題に
  資料が1件以上あれば `/orgs/:orgId/meetings/:meetingId/materials?material=<資料ID>`
  へのリンクにしています (資料が無い議題は従来通り plain text). クエリ
  文字列 (`?material=`) で資料を指定しているのは, `MeetingMaterialsExplorer`
  側の選択状態がページ内の `useState` (URL に紐付かない) だったため —
  別ルートである議題タブから「資料タブの特定の資料を開いた状態」を
  指定するには, 何らかの形で URL に載せる必要があったための対応です.
  `MeetingMaterialsExplorer` は `useSearchParams` (react-router) でこの
  クエリを読み, 指定があればその資料を初期選択+所属する議題グループを
  展開した状態でマウントします (無ければ従来通り先頭の議題グループ+
  その最初の資料). 議題タブ→資料タブは別ルート (別コンポーネント) の
  ため, クエリが変わるたびに `MeetingMaterialsExplorer` は素直に
  再マウントされ, `useState` の初期化関数がそのたびに正しく再評価されます.
  - **議決結果アイコン/提出者**: 「議題の各項目に議決結果アイコンを, 右端に
    提出者の名前と役職を表示してほしい」という依頼に伴い, `meeting.agenda`
    の型を `string[]` から `MeetingAgendaItem[]`
    (`{ label, voteResult?, submitterName, submitterRole }`) に変更して
    います — 議題名だけでなく議決結果/提出者という付随情報を持つように
    なったため, 単純な文字列配列では表現できなくなったことによる型変更
    です. この変更に伴い `MeetingListRow`/`MeetingCalendarCard`
    (`meeting.agenda.join(", ")` は `Array.prototype.join` が要素を
    `String()` で暗黙変換してしまうため, 型エラーにはならず
    `"[object Object]"` になる不具合を実際に踏みました — `.map((item) =>
    item.label).join(", ")` に修正)/`MeetingMaterialsExplorer`
    (`groupMaterialsByAgenda` の議題名比較を `item.label` に) /
    `mockData.ts` の `generateMeetingMaterials` (`agenda[i % agenda.length]`
    → `.label`) も合わせて修正しています. **議決結果 (`AgendaItemVoteResult`)**
    は 否決 (`Rejected`)/延会 (`Postponed`)/可決 (`Approved`) の3種類ですが,
    **アイコンを表示するのは否決 (赤い `IconX`, `--color-status-red`)/延会
    (subtext1 色の `IconTriangle`, `--color-body-subtext` — 依頼で明示的に
    「subtext1」と指定されたため, より控えめな `--color-body-subtext0`
    ではなくこちらを使用) の2つだけです** — 可決および `voteResult` が
    `undefined` (「そもそも議決の概念が無い」報告事項など) の場合はどちらも
    アイコンを表示しません (依頼で明示的にアイコンが指定されたのは否決/延会
    の2つだけだったため, 可決も無表示扱いにしています — 要望と異なる場合は
    `VoteResultIcon`@`MeetingAgendaList.tsx` に緑のアイコン等を追加してください).
    提出者は `IconUser` + `名前 (役職)` を各行の右端に表示します
    (`.item` を `justify-content: space-between` にし, 番号+アイコン+議題名
    を `.main` としてまとめて左に, 提出者を右に配置). 提出者の役職は
    新しい役職名を作らず, 出席者/構成員一覧と同じ `OrganizationMember.role`
    をそのまま使っています.
- **出席者タブ (`MeetingAttendeeListBox`)**: 「`../../members` にあるものと
  同じリスト形式」という依頼のため, 構成員一覧の行 (`MemberListRow`)
  をそのまま再利用しています. `MemberListBox` 自体 (ソート状態やページ
  切り替え時のフォーカス制御など, 一覧専用の複雑さを持つ) は使わず,
  見出し (「n人の出席者」)+行の並びだけの簡潔な Box にしています —
  会議1件あたりの出席者は数人程度で, 並び替え/ページネーションの必要が
  薄いと判断したためです.
- **資料タブ (`MeetingMaterialsExplorer`)**: GitHub のファイルビューワを
  参考に, 左にサイドバー (議題ごとのディレクトリツリー, 開閉可能)/右に
  メイン (選択中の資料のプレビュー) を配置しています.
  - **サイドバーのツリー**: `meeting.materials` を `meeting.agenda`
    の順序で議題ごとにグルーピングし (資料が無い議題はサイドバーに
    出しません), フォルダ行 (`IconFolder`/`IconFolderOpen`+シェブロン)
    をクリックすると配下のファイル行が開閉します. フォルダ/ファイル
    行はどちらも `menuItemBase` (NavDrawer 等と同じ土台) を使い,
    ファイル行だけ追加の `padding-left` でインデントすることで
    ディレクトリの階層を表現しています. 初期状態は先頭の議題グループ
    だけ展開し, その中の最初の資料を選択済みにしています.
  - **資料の種別 (`MeetingMaterialFileType`)**: PDF/Markdown/テキスト/動画/
    会計処理の5種類です. PDF/動画は実ファイルの保存先が無いため, 証憑タブ
    (`TransactionReceiptBox`) と同じ考え方でそれとわかる破線枠+アイコンの
    プレースホルダーにしています. **Markdown は `MarkdownFileViewer`
    (GitHub 風プレビュー+ソース切り替え, 詳細は「Markdown ドキュメントの
    プレビュー」を参照) で描画し, テキストのみ従来通り等幅フォントの
    `<pre>` でそのまま表示します** (テキストは Markdown ではないため対象外).
  - **会計処理を資料として埋め込む (`EmbeddedTransactionView`)**:
    「`../../book/会計処理ID` のページをリンクではなく, メインの中に
    同じ内容を表示してほしい」という依頼のため, 会計処理詳細ページの
    「中身」(上部要約+タブ切り替え+3つの本文) を, ルーティングに依存しない
    形で切り出した専用コンポーネントを新設しました. `OrganizationTransactionLayout`/
    `TransactionDetailTabs` (実際の URL の子ルート + `NavLink` でタブを
    切り替える) とは異なり, ここには対応する URL が無いため, `ProfileTabs`
    と同じ考え方 (`tabBase` の見た目を `<button>` + `useState` の内部状態で
    切り替える) にしています. 上部の `TransactionHeaderBox` と, 3つの本文
    コンポーネント (`TransactionItemsList`/`TransactionProcedureTimeline`/
    `TransactionReceiptBox`) はページ版とそのまま共有しているため, 見た目
    や挙動の変更は自動的に両方に反映されます. 参照先の `OrganizationTransaction`
    は `MeetingMaterial.transactionId` から `MOCK_ORGANIZATION_TRANSACTIONS`
    を検索して解決しています (`OrganizationMeetingMaterialsPage` が全件を
    `MeetingMaterialsExplorer` へ渡し, 選択中の資料が変わるたびに探索する形.
    件数が少ないため配列探索のままにしています).
- **議事録タブ (`MeetingMinutesExplorer`)**: 「資料と同じ形式で示してほしい」
  という依頼のため `MeetingMaterialsExplorer` と同じ左サイドバー+右メインの
  構成を土台にしていますが, ディレクトリツリー (議題ごとのグルーピング/
  開閉) は無く, 開催回 (`MeetingMinutes`) をそのまま縦一列に並べるだけの
  単純なリストです. **「会議が1度のときはサイドバーを表示せず, 2回以上
  開催されたときにサイドバーが出現するようにしてほしい」という依頼**
  のため, `meeting.minutes.length` に応じて構成そのものを (サイドバーを
  CSS で隠すのではなく) 出し分けています — 1件のときは選ぶ必要が無いため,
  サイドバー無しの単一 Box (`.singleRoot`) で本文をそのまま表示します.
  各開催回の本文 (`content`) は「議事録のmdファイル」の書式 (frontmatter+
  発言者形式, 詳細は「Markdown ドキュメントのプレビュー」を参照) のため
  `MarkdownFileViewer` で描画します — frontmatter 自体がタイトル/日時/
  場所/議長/記録などを表示するため, サイドバーの「第N回 日時」ラベル以外に
  メイン側で改めて見出しを重ねて表示していません.
- **モックデータ**: `generateMeetingAttendees`/`generateMeetingMaterials`
  (`mockData.ts`) が各会議ごとに出席者3〜6人・資料2〜4件を機械的に
  生成します. 資料の種別は5種類 (Markdown/PDF/テキスト/動画/会計処理)
  を順番に割り当てており, 会計処理種別のときは `MOCK_ORGANIZATION_TRANSACTIONS`
  から実在する取引を1件参照させています (資料名も参照先の
  `description` から `会計処理: ○○` として生成). `generateMeetingMinutes`
  は大半の会議を1回開催 (`minutes` 配列1件) にしつつ, 一部 (index が4の
  倍数/8の倍数) を2〜3回開催として生成し, サイドバー有り/無しの両方の
  見た目を実際に確認できるようにしています — 各回の日付はその会議自体の
  `startsAt` (最終回) から1週間おきに遡って算出しています. `buildMinutesContent`
  が出席者 (`OrganizationMember[]`) をそのまま発言者 (frontmatter の
  `speakers`) として使い, 議題 (`MeetingAgendaItem[]`, 詳細は上記「議決結果
  アイコン/提出者」を参照) の `voteResult` を議事録本文の `[決定]`/`[宿題]`
  タグに反映しています (`Approved`/`Rejected`/`Postponed` → `[決定]`,
  `undefined` → `[宿題]`) — 議題タブのアイコンと議事録の内容が矛盾しない
  ようにするための対応です.

## Markdown ドキュメントのプレビュー (`MarkdownDocument`/`MarkdownFileViewer`)

会議詳細ページの資料タブ (Markdown 種別)/議事録タブの両方で共有している,
Markdown ファイルの GitHub 風プレビュー機構です. 「議事録のmdファイルを
GitHubのようにレンダリングして表示してほしい, レンダリングは他にmdファイルを
表示する場所でも行ってほしい」という依頼のため, 特定のページに紐付けず
`features/organization/` 直下の汎用ロジック (`minutesMarkdown.ts`) +
2つのコンポーネントとして切り出しています.

- **パーサーは自前実装 (`minutesMarkdown.ts`)**: `react-markdown`/`marked`
  や `js-yaml` のような Markdown/YAML ライブラリは追加していません — 依頼で
  共有された議事録の書式 (frontmatter の `speakers`/`attendees` などの
  項目, 本文側の `@id [HH:MM]`/`@id: 発言`/`- [決定]`/`- [宿題]` といった
  独自記法) は標準の Markdown/YAML の範囲を超えており, 汎用ライブラリを
  導入してもこれらは結局自前でパースする必要があること, かつこのアプリの
  Markdown コンテンツはすべて自分たちが生成するダミーデータ (任意の外部
  入力を安全に扱う必要が無い) であることから, 依存を増やさず必要な範囲
  だけを実装する方針にしています.
  - **frontmatter**: `extractFrontmatter`/`parseFrontmatterYaml` が
    `---` で挟まれたブロックを解析します. 汎用 YAML ではなく, このアプリの
    議事録が実際に使う形 (トップレベルの `key: value`, `"..."` によるクォート
    文字列, `true`/`false`, `[a, b]` のインライン配列, `speakers:` の
    直後だけ2段インデントの `id: { name: ..., role: ... }` というインライン
    マップ) に絞った簡易パーサーです. `# コメント` (行末の `" #"` 以降)
    も取り除きます.
  - **本文**: `parseBlocks`/`parseBlock` が空行区切りのチャンクごとに
    見出し (`#`〜`######`)/箇条書き (`- ...`, `- [決定]`/`- [宿題]`
    ならタグ付き)/引用 (`> ...`)/発言者の発言 (`@id [HH:MM]` 単独行+
    続く段落 = `speakerTurn`, `@id: 発言` の1行 = `speakerInline`)/
    それ以外は通常の段落, に分類します. **frontmatter/独自記法が無い
    一般的な Markdown 資料 (資料タブの他のダミーコンテンツなど) も
    同じパーサーを通ります** — 該当するパターンに一致しないだけで,
    見出し/段落/箇条書き/引用としては自然に解釈されるため, 議事録専用
    ロジックとは別にもう1つパーサーを用意する必要はありませんでした.
- **描画 (`MarkdownDocument.tsx`)**: `frontmatter` があれば
  `FrontmatterHeader` を描画し, 無ければスキップします.
  **タイポグラフィ (行間/文字サイズ/余白) は GitHub の markdown-body 相当の
  値に揃えています** — 「見た目を全てgithubのそれに合わせてほしい」という
  依頼のため, 基準 `line-height: 1.5`, 見出しごとのサイズ (h1: 2em〜h6:
  0.85em) + `font-weight: 600` + margin (24px 0 16px) + h1/h2 だけ
  `border-bottom`, リストは (独自の "・" ではなく) 実際の `list-style: disc`,
  blockquote は左ボーダー+灰色文字, インラインコードは背景+角丸+85%サイズ,
  という具合に GitHub の実際の値に合わせています (色のみ本アプリの
  テーマトークンに置き換え, 明暗両対応). `.body`/`.frontmatter`
  は (以前の `flex + gap` ではなく) 各要素自身の margin で間隔を作る
  素の block flow にしています — GitHub 自身がこの方式のため, 見出しと
  段落の margin の相殺のされ方まで含めて忠実になります.
  **`FrontmatterHeader` は「開催場所や出席者, 文書の種別についてもバッジ
  ではなく箇条書きで示してほしい」という依頼により, `Label`/チップを
  やめて1つの `<ul>` (`.metaList`) にまとめています** (日時/開催場所/
  議長/記録/出席者/欠席者/種別 (逐語録・要約録) を箇条書きの各行として
  列挙. 議長/記録は `speakers` から解決した名前のみ表示). **「公開範囲は
  メタデータに記載しないでほしい」という依頼により, frontmatter の
  `visibility` はパース自体はしますが `FrontmatterHeader` では描画して
  いません.** 本文ブロックは見出し/段落/引用/箇条書き/発言者の発言として
  描画します — **「本文内には"決定"のようなラベルを表示しないでほしい」
  という依頼により, `[決定]`/`[宿題]` はもう `Label`
  (バッジ) にせず, `[決定] 本文...` のように生の角括弧付きテキストとして
  そのまま表示しています** (`Label` の green/peach バリアント自体は
  `components/ui/Label.tsx`/`theme.css` に残していますが, 現状この用途
  では使っていません — 他の用途で必要になれば再利用できます).
  **「発言時刻･委員の立場については本文中に記載せず, 名前だけを記載して
  ほしい」という依頼により, `speakerTurn`/`speakerInline` はどちらも
  `block.time`/`speaker.role` を参照せず, 解決した名前だけを表示して
  います** (パーサー自体は引き続き time/role を解析します — 描画側だけが
  参照をやめています). **本文中の `@id` (発言者の発言以外の, 段落/リスト
  項目内に登場するものも含む) は `renderInline` が正規表現でトークン化し,
  frontmatter の `speakers` に一致すれば名前に置き換えます** (一致しなければ
  `@id` のままフォールバック表示) — `[宿題] @sato ...` の `@sato`
  もこの仕組みで解決されます. `renderInline` は `**太字**`/`` `コード` ``
  も併せてサポートしています (依頼の例には無い記法ですが, 「GitHub の
  ように」という要望に沿った一般的な Markdown 記法として追加しました).
- **プレビュー/ソース切り替え+文書名 (`MarkdownFileViewer.tsx`)**: 「書類の
  上部に `IconEye`/`IconCode` を『プレビューを表示』『ソースを表示』という
  ツールチップ付きのトグルボタンとして表示し, プレビューを標準としてほしい」
  という依頼どおり, 会議一覧の `ViewModeToggle` (リスト/カレンダー切り替え)
  と同じ「選択中の側にボタン型のオーバーレイがスライドする」見た目+
  `aria-label` を CSS でツールチップ表示する仕組みをそのまま踏襲しています
  — ドメインも役割も異なる (会議一覧の表示モード切り替え vs. Markdown
  プレビュー/ソース切り替え) ため, 共通コンポーネントとして切り出さず
  並行コンポーネントとして複製しています (Document*/Transaction*/Meeting*
  系で確立した「機能ごとに似た構成でも別コンポーネントとして持つ」方針を
  踏襲). 既定は `MarkdownViewMode.Preview`, ソース表示は整形前の生の
  Markdown 文字列を等幅フォントの `<pre>` でそのまま表示するだけです.
  **「トグルスイッチの左横には左詰めで文書名を記載してほしい, トグル
  スイッチがある部分は本文と分割線で隔ててほしい」という依頼により**,
  `title: string` prop を追加し `.toolbar`
  (`justify-content: space-between`) の左に文書名, 右にトグルを配置した上で
  `.toolbar` に `border-bottom` を付けています — `MeetingMaterialsExplorer`
  (資料タブ) では Markdown 種別のときだけ, 他の種別 (PDF/動画/テキスト) が
  使う外側の見出し (`.materialName`) の代わりにこの `title` prop
  (`selectedMaterial.name`) で文書名を示すようにしました (二重表示を避ける
  ため). `MeetingMinutesExplorer` (議事録タブ) は
  `` `議事録_${sessionLabel}.md` `` という組み立てたファイル名を渡しています
  (`MeetingMinutes` 自体に実ファイル名の概念が無いため).
- **利用箇所**: `MeetingMaterialsExplorer` (資料タブ, Markdown 種別のみ.
  PDF/動画/テキストは対象外) と `MeetingMinutesExplorer` (議事録タブ,
  全件), `DocumentContentViewer` (文書詳細ページの概要/版タブ, 詳細は
  「文書詳細ページ」を参照) の3箇所です — 依頼の「他にmdファイルを表示する
  場所でも」を満たすため, 特定の画面に結合させず `source`/`title`
  を受け取るだけの汎用コンポーネントにしています.
- **`bordered`/`onEdit`**: `bordered?: boolean` (既定 `true`) は false のとき
  外枠のボーダー/角丸/背景を描画しない — `MeetingMaterialsExplorer`/
  `MeetingMinutesExplorer` のように呼び出し側が既に外枠を持っていて二重に
  囲われてしまう場合 (`MeetingMinutesExplorer` の複数開催回ケースで実際に
  踏んだ「議事録が2重に囲われてしまっている」不具合の修正で追加) に使います
  — ツールバーと本文の分割自体はこの場合も維持されます. `onEdit?: () =>
  void` は指定するとトグルスイッチの左横に `IconButton` (`icon={IconPencil}
  label="編集する"`) を表示します — 「トグルスイッチの左横に編集する
  ボタンを追加してほしい, 動作はのちほど実装する」という依頼のため, 現状は
  `DocumentContentViewer`/`DocumentOverviewSection` から渡すハンドラーは
  何もしないスタブです (`MeetingMaterialsExplorer`/`MeetingMinutesExplorer`
  からは渡していないため, それらのツールバーには表示されません).

## 文書詳細ページ (`/orgs/:orgId/documents/:documentId`)

会計処理詳細ページ/会議詳細ページと基本的に同じ構成 (存在チェック+上部要約を
担う親レイアウト, ページ本文側のタブバー, `<Outlet context={document} />` +
`useOutletContext` で子ページへ受け渡す薄いラッパーページ) です —
「../../meetings/会議ID を参考とし」という依頼のため, `OrganizationMeetingLayout`
とほぼ同じ形で `OrganizationDocumentLayout`
(`src/pages/`, 「文書が見つかりません」判定+`DocumentHeaderBox`+
`DocumentDetailTabs`+`Outlet` を担う) を実装しています. `DocumentListRow`
(一覧の各行) は既にこの URL (`/orgs/${organizationId}/documents/${id}`)
へリンクしていたため, 実装対象は詳細ページ側のみでした.

- **上部要約 (`DocumentHeaderBox`)**: 1段目は文書名 (太字)+公開/非公開バッジ
  (`DocumentCard` と同じ `Label`, 色指定は無し), 2段目は `IconUser`+作成者名です.
- **タブ (`DocumentDetailTabs`)**: 概要 (`IconHome`)/版 (`IconTag`)/指摘事項
  (`IconFileAlert`)/修正提案 (`IconFileTextSpark`)/編集者 (`IconUsers`)
  の5タブです. 他の詳細ページと同じくヘッダー下部のスロットではなく本文側に
  描画します (`OrganizationTabs` が既にそのスロットを使っているため).
  URL のパス部分は既存の `getBreadcrumb.ts`/`SPECIAL_ROOT_LABELS`
  で「指摘事項」「修正提案」に対応付け済みの `issues`/`pulls`
  をそのまま使っています (`/orgs/:orgId/documents/:documentId/issues`/`/pulls`).
- **データモデリング**: 会計処理詳細ページ/会議詳細ページと同じ考え方
  (「一覧の1件」と「その詳細」は同一の実体を指す) で, `OrganizationDocument`
  (`features/organization/types.ts`) に `authorName`/`visibility`/`versions`/
  `editors`/`resolution` を追加する形で拡張しています — 別の型は新設していません.
  - `visibility: DocumentVisibility` — 公開/非公開バッジ用に新設した型です.
    `features/user/types.ts` の `DocumentVisibility` (`DocumentSummary` 用)
    とは別の実体 (「組織の文書一覧」の1件 vs 「ユーザーの概要タブ」の1件)
    のため, 「各機能が自分の型を持つ」という既存の方針
    (`DocumentSortField`/`TransactionSortField` が同じ形でも別々なのと
    同じ考え方) に揃えて独立して定義しています.
  - `type DocumentVersion` (`id`/`editedAt`/`editor: OrganizationMember`/
    `content?: string`) — 版タブ用. `editor` は概要タブの「編集者(管理者は)」
    の判定にも `role` を使うため, 名前の文字列ではなく `OrganizationMember`
    をそのまま持たせています. `content` は Markdown/Text のときだけ持ち,
    PDF/MP4 のときは無い (会議の資料タブと同じ考え方) ため任意にしています.
  - `type DocumentResolution` (`meetingId`/`meetingTitle`/`agendaLabel`/
    `voteResult`) — 「議決されていればその会議と可決･否決の情報」用.
    `voteResult` は `AgendaItemVoteResult` (会議の議題の議決結果) を再利用
    しますが, `Approved`/`Rejected` の2値だけに絞っています (「可決･否決」と
    明示されていたため `Postponed` は使いません). `meetingId` は実在する
    `MOCK_ORGANIZATION_MEETINGS` の会議を指す実際に機能するリンクにしています
    (`EmbeddedTransactionView` が実在する会計処理を参照するのと同じ考え方
    — `MoneyTransactionActivity.transactionId` 等とは異なり, こちらは
    あえて別の ID 空間にする理由が無いため実在の ID をそのまま使っています).
  - `type DocumentIssue`/`type DocumentPullRequest` (指摘事項/修正提案タブ用)
    — `id`/`documentId`/`title`/`posterName`/`postedAt` の同じ形ですが,
    「指摘事項と修正提案は別の実体」という判断で型は分けています (`Activity`
    系と同じ「組織/文書とは分離して考える」設計 — 組織の直下ではなく,
    `documentId` を外部キーとして持つフラットな配列です). ソート用の型
    (`DocumentIssueSortField`/`DocumentPullRequestSortField` など) も
    同じ形ですが独立して定義しています.
- **概要タブ (`DocumentOverviewSection`)**: 「GitHubのリポジトリのページを
  参考に」という依頼のため, `OrganizationOverviewSection` と同じ 3fr/1fr
  (メイン:サイドバー) の列比率にしています (依頼文の「左側にメインの資料
  右側に資料の情報」に対応). メインは `DocumentContentViewer`
  (概要/版タブ共通, 後述). サイドバー (「資料の情報」見出し+`<dl>`) は
  作成日時/版 (`第${versions.length}版`)/編集者/議決 (あれば) の4項目です.
  - **「編集者(管理者は)」**: 依頼文の意図をユーザーに確認したところ「編集者名
    + 管理者なら付記」とのことだったため, 最新版 (`versions` の末尾) の
    `editor.name` を表示し, その `role` が `"委員"` (既定の役職) 以外
    (`isAdminRole`, 委員長/副委員長などの特別な役職) であれば末尾に
    「(管理者)」を付記します — 新しいフィールドは増やさず, 既存の
    `OrganizationMember.role` の値で判定しています.
  - **議決情報**: `document.resolution` があれば,
    `` `${meetingTitle}にて「${agendaLabel}」が${可決/否決}されました` ``
    を表示し, 会議名部分は実在する `/orgs/:orgId/meetings/:meetingId`
    へのリンクにしています.
  - **`DocumentContentViewer`** (概要タブ/版タブ共通の切り出し) は
    `fileType`/`title`/`content`/`onEdit?` を受け取り, `fileType` に応じて
    Markdown → `MarkdownFileViewer` (`onEdit` があれば「編集する」ボタンを
    表示)/Text → 等幅プレビュー/それ以外 (PDF/MP4) → プレースホルダー,
    を出し分けます (`MeetingMaterialsExplorer` と同じ分岐ロジック) —
    概要タブ/版タブの両方から同じコンポーネントとして呼び出すため
    (「タイムラインの左横に概要画面と同じビューワを配置し」という依頼を
    素直に満たすため), 依頼されていませんが重複を避けてこの1コンポーネントに
    切り出しています. 「編集する」ボタン (`IconPencil`, 動作はのちほど実装)
    は概要タブから呼ぶときだけ `onEdit` を渡し, 版タブ (過去の版を見ている
    ときに「編集する」は意味が通らないため) では渡していません.
- **版タブ (`DocumentVersionsSection`/`DocumentVersionTimeline`)**: 左に
  `DocumentContentViewer` (選択中の版の内容, 既定は最新版), 右にタイムライン
  (概要タブと同じ 3fr/1fr 比率) という構成です. タイムラインは
  「../../book/会計処理ID/procedureのタイムラインを逆転させ, アイコンを
  塗り潰しの丸にしてほしい」という依頼のため, `TransactionProcedureTimeline`
  と同じ土台 (rail+円+矢印+stepBody の縦タイムライン) を踏襲した新規
  コンポーネント `DocumentVersionTimeline` として実装しています (「機能ごとに
  似た構成でも別コンポーネントとして持つ」という既存の方針を踏襲 —
  完了/否認/未完了の区別が無い分ロジックも簡略化されるため, 直接
  `TransactionProcedureTimeline` を拡張するより新規のほうが素直でした).
  - **逆転**: `versions` (`OrganizationDocument` 側は古い順で保持) を表示直前に
    `.reverse()` して新しい順 (最新版が上) にしています — データ自体は
    古い順のまま保つ設計です.
  - **塗り潰しの丸**: 完了済 (チェック)/未完了 (枠線のみ)/否認 (バツ)
    の3種類だった `TransactionProcedureTimeline` と異なり, 版は全て
    確定済みの事実 (未来/未完了の概念が無い) なので `IconCircleFilled`
    1種類だけを使います.
  - **タイトル/選択状態**: タイトルは手順名ではなく版の編集日時, 下に
    `IconUser`+編集者名です. 各行は `<button>` にして版を選択できるように
    しており (`onSelect`), 選択中の版だけ `TransactionProcedureTimeline`
    の「直近 (lastCompletedIndex)」と同じ強調 (30px, 通常色) にし,
    それ以外は同じ控えめな表現 (24px, `--color-body-subtext0`) にしています
    — 選択すると左側の `DocumentContentViewer` の表示内容がその版の
    `content` に切り替わり, 「その版の状態を再現する」という依頼を
    満たします (`MeetingMinutesExplorer` のサイドバー選択と同じ考え方).
- **指摘事項/修正提案タブ (`DocumentIssuesSection`/`DocumentPullRequestsSection`)**:
  「../../meetingsのリスト形式で」という依頼のため,
  `OrganizationMeetingsSection` のリスト表示部分 (検索バー+フィルター
  サイドバー+ソート+ページネーション付き一覧 Box, カレンダー表示関連は
  対象外) と同じ構造です. `IssueListRow`/`IssueListBox`/
  `IssueFilterSidebar`/`IssueSearchBar`/`IssueSortDropdown` を実装した後,
  「指摘事項と同じ形式にしてほしい」という依頼どおり `PullRequest*`
  として並行複製しています (`Document*`/`Transaction*`/`Meeting*`
  系で確立した「機能ごとに似た構成でも別コンポーネントとして持つ」方針の
  踏襲). 一覧の各行はタイトル (太字)+投稿者/投稿日 (右詰め2段,
  `MeetingListRow` と同じ考え方) です. サイドバーのフィルターは
  他のフィルター同様まだ実装しない (選択すると検索欄に文字列を入れるだけ)
  ため, 具体的な選択肢は依頼に無い箇所を判断で補っています — 指摘事項は
  全て/自分の投稿/未解決/解決済み, 修正提案は全て/自分の投稿/マージ待ち/
  マージ済みです. 詳細な指摘事項/修正提案自体 (`/issues/:issueId`/
  `/pulls/:pullRequestId`) はまだ実装していないため, 一覧の各行から
  遷移すると 404 になります (「プロジェクトについて」の
  「現状できていないこと」を参照). **`IssueListRow`/`PullRequestListRow`
  は `issue`/`pullRequest` だけを受け取り, リンク先の組織 ID は
  `issue.documentId`/`pullRequest.documentId` から `MOCK_ORGANIZATION_DOCUMENTS`
  を検索して自分で解決します** (`organizationId`/`documentId` を props で
  受け取る設計だと, ある文書に紐付いた指摘事項という前提を崩せないため) —
  `DocumentIssuesSection`/`DocumentPullRequestsSection`/`IssueListBox`/
  `PullRequestListBox` も同じ理由で `issues`/`pullRequests` の配列だけを
  受け取ります. この設計のおかげで, 特定の文書の指摘事項だけに絞り込んだ
  配列を渡す (このタブ) のと, 全件をそのまま渡す (`~/issues`, 詳細は
  「組織を横断した一覧ページ」を参照) のを, 同じコンポーネントの
  そのままの再利用で両立できています.
- **編集者タブ (`DocumentEditorListBox`)**: 「../../meetings/会議ID/membersの
  リストと同じものを配置してほしい」という依頼のため, `MeetingAttendeeListBox`
  と全く同じ構造 (構成員一覧の行 `MemberListRow` をそのまま再利用する,
  ソート/ページネーションは持たない簡潔な Box) です.
- **モックデータ**: `MOCK_ORGANIZATION_DOCUMENTS` (300件) の各文書に
  `authorName`/`visibility` (4件に1件を非公開)/`versions` (2〜4件, 版ごとに
  `MOCK_MEMBERS` から機械的に選んだ編集者)/`editors` (3〜5人) を生成時に
  追加しています. `resolution` だけは `MOCK_ORGANIZATION_MEETINGS`
  (このファイルの後方で定義) を参照する必要があり, 文書生成の `Array.from`
  内では組み立てられないため, `MOCK_ORGANIZATION_MEETINGS` の定義後に
  可決/否決の議題を持つ会議を集めて (`RESOLVABLE_AGENDA_ENTRIES`) 4件に1件の
  文書へ後付けで代入しています. `MOCK_DOCUMENT_ISSUES`/
  `MOCK_DOCUMENT_PULL_REQUESTS` はそれぞれ5件に1件/7件に1件の文書にだけ
  1〜3件/1〜2件を割り当てる `flatMap` で生成しています (全件に持たせると
  件数が膨らみすぎるため).

## 通知ページ (`NotificationsPage`)

`~/notifications` — Header/`NavDrawer` の「全ての通知」/「通知」ボタンが
指す, 組織/文書のいずれにも紐付かないグローバルな一覧ページです.
「これ (指摘事項/修正提案のリスト形式) と同じ形式で実装してほしい」という
依頼のため, `OrganizationDocumentsSection` と同じ構造 (検索バー+フィルター
サイドバー+ソート+ページネーション付き一覧 Box) を土台にしていますが,
「既読/未読の区別も追加してほしい」という確認への回答を受けて未読の視覚的な
区別を追加しています.

- **配置**: 組織/文書に紐付かないため, 既存の `features/organization/`
  ではなく新しい `features/notifications/` (`types.ts`/`mockData.ts`/
  `components/`, `features/user/` と同じ構成) として独立させています.
  ルーティングも `/orgs/:orgId` 配下のネストしたルートではなく, `App.tsx`
  の `<Route path="/notifications" element={<NotificationsPage />} />`
  として `/users/:userId`/`/orgs/:orgId` と同じ階層のトップレベルルートに
  しています (`OrganizationLayout` のような親レイアウト+存在チェックは
  不要 — 「組織が見つかりません」に相当する概念が無いため).
- **`type Notification`** (`id`/`title`/`senderName`/`occurredAt`/`read`/
  `targetUrl`) — `DocumentIssue`/`DocumentPullRequest` と近い形ですが,
  組織/文書に紐付かない別の実体のため独立した型にしています. `targetUrl`
  は通知の対象ページへの絶対パスをそのまま持たせており (`documentId`
  のような ID 参照+ リンク先を都度組み立てる形にはしていません — 通知の
  対象が文書/会議/入出金など複数の種類にまたがるため, 種類ごとの分岐を
  `NotificationListRow` 側に持たせるより単純です), `Link to={notification.targetUrl}`
  でそのまま遷移します.
- **`NotificationListRow`**: `IssueListRow`/`PullRequestListRow` と同じ
  構成 (タイトル+送信元/日時を右詰め2段) に加え, 未読のときだけ左に
  ドット (`--color-link`) を置きタイトルを太字にします (既読は通常の太さ.
  ドット自体は既読でも同じ幅を確保したままにし, タイトルの開始位置が
  既読/未読で揃うようにしています).
- **`NotificationFilterSidebar`**: 「既読/未読の区別も追加してほしい」
  という回答のため, 全て/未読のみの2件だけです. 他の一覧サイドバー
  (`DocumentFilterSidebar`/`MeetingFilterSidebar` など) と違い
  `useFixedSidebarPosition` (スクロール追従) は使っていません —
  依頼されておらず, 汎用フックとはいえ `features/organization/` 配下に
  あるものを機能をまたいで再利用するかどうかは判断が分かれるため,
  ひとまず素朴な通常フローの配置にしています. スクロール追従が必要になれば
  `useFixedSidebarPosition.ts` を `src/lib/` 等の共有場所へ移してから
  使うことを検討してください.
- **モックデータ**: `MOCK_NOTIFICATIONS` は文書/会議/入出金それぞれ実在する
  `MOCK_ORGANIZATION_DOCUMENTS`/`MOCK_ORGANIZATION_MEETINGS`/
  `MOCK_ORGANIZATION_TRANSACTIONS` (`features/organization/mockData.ts`)
  の先頭15件ずつを参照し, 対象ページへの実際に機能するリンクとして生成して
  います (`EmbeddedTransactionView`/文書詳細ページの議決情報と同じ,
  「実在するデータを参照できる場合はそうする」という考え方). 日時は会議一覧
  の `MEETING_ANCHOR` と同じ考え方で実行時の実際の日付を起点にしており
  (固定の過去日付ではない — 「最近の通知」として常に新しく見えるようにする
  ため), 3件に1件を未読にしています.

## 組織を横断した一覧ページ (`/documents`/`/book`/`/meetings`/`/issues`/`/pulls`)

「`~/orgs/組織ID/{issues, pulls, documents, book, meetings}` のページと
同じ構造とし, 内容は組織を横断したものとしてほしい」という依頼による,
5つのグローバル (`/orgs/:orgId` に属さないトップレベル) な一覧ページです.
Header/`NavDrawer` の「全ての文書」/「全ての会計申請」/「予定されている会議」/
「指摘事項」/「修正提案」ボタン (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS`
にも `documents: "文書"`/`book: "帳簿"`/`meetings: "会議"`/`issues: "指摘事項"`/
`pulls: "修正提案"` として以前から用意されていた) が指す, 従来は 404 だった
5つのルートです.

- **「同じ構造」の実現方法**: 新しいコンポーネントは1つも作らず, 既存の
  `OrganizationDocumentsSection`/`OrganizationBookSection`/
  `OrganizationMeetingsSection`/`DocumentIssuesSection`/
  `DocumentPullRequestsSection` をそれぞれ単に別の配列 (組織で絞り込まない
  全件) で呼び出すだけで実現しています. これが成立するのは, 各一覧行
  (`DocumentListRow`/`TransactionListRow`/`MeetingListRow`/`IssueListRow`/
  `PullRequestListRow`) がリンク先の組織 ID を props ではなく**項目自身から
  (`document.organizationId` など) 解決する設計**に元々なっていたためです
  — `OrganizationDocumentsSection`/`OrganizationBookSection`/
  `OrganizationMeetingsSection` は元々 `documents`/`transactions`/`meetings`
  の配列だけを受け取る設計だったため無改修でそのまま使えましたが,
  `IssueListRow`/`PullRequestListRow` は元々 `organizationId`/`documentId`
  を呼び出し元 (特定の文書のページ) から props で受け取る設計だったため,
  このページを作るタイミングで「`issue.documentId` から
  `MOCK_ORGANIZATION_DOCUMENTS` を検索して組織 ID を自己解決する」形に
  リファクタリングしています (詳細は「文書詳細ページ」の「指摘事項/
  修正提案タブ」を参照) — `documentId` prop 自体も `issue.documentId`
  と重複していたため, この整理で不要になり削除しています.
- **`DocumentsPage`/`BookPage`/`MeetingsPage`**: それぞれ
  `OrganizationDocumentsSection`/`OrganizationBookSection`/
  `OrganizationMeetingsSection` (すでに自身で `max-width: 1280px;
  margin: 0 auto;` を持つ, トップレベルページとして単独で使える設計) に
  `MOCK_ORGANIZATION_DOCUMENTS`/`MOCK_ORGANIZATION_TRANSACTIONS`/
  `MOCK_ORGANIZATION_MEETINGS` の全件をそのまま渡すだけの薄いラッパーです.
  `OrganizationBookSection` の `TransactionSummaryBox` (残高/収入/支出) も
  全件から算出されるため, 組織を横断した合計になります.
- **`IssuesPage`/`PullsPage`**: `DocumentIssuesSection`/
  `DocumentPullRequestsSection` に `MOCK_DOCUMENT_ISSUES`/
  `MOCK_DOCUMENT_PULL_REQUESTS` の全件を渡すだけの薄いラッパーですが,
  この2つのセクションは (`/orgs/:orgId/documents/:documentId` 配下に
  ネストされる前提のため) 自身では `max-width` を持たないので,
  `IssuesPage.module.css`/`PullsPage.module.css`
  (`max-width: 1280px; padding: 24px 16px; margin: 0 auto;`,
  `OrganizationDocumentsSection.module.css` の `.root` と同じ値) で
  ページ側から中央寄せしています.
- **`MOCK_ORGANIZATIONS` (組織一覧ページ用, 詳細は「組織一覧ページ
  (`OrgsPage`)」を参照) は複数件ありますが, 詳細データ (文書/入出金/会議など)
  を実際に持つ組織は `MOCK_ORGANIZATION` (`test-org`) の1件のみ**のため,
  「組織を横断」の実際の効果 (複数組織の文書/入出金/会議が実データとして
  混ざって表示される) はまだ確認できません — 上記の設計 (各項目が自分の
  `organizationId` を持ち, 一覧側がそれを使ってリンクを組み立てる) により,
  他の組織にも実データが増えたときも一覧側の実装を変更せずに自然に横断
  できる想定です.

## 組織一覧ページ (`OrgsPage`)

`~/orgs` — NavDrawer の「組織一覧」が指すページ. 「`./組織ID/documents`
(= `OrganizationDocumentsSection`) を参考にして, 組織のアイコン, 種類などを
要素として持つリストを作成してほしい」という依頼のため, 新規コンポーネント
(`OrgListRow`/`OrgListBox`/`OrgFilterSidebar`/`OrgSearchBar`/
`OrgSortDropdown`/`OrgsSection`) を `OrganizationDocumentsSection` 一式と
同じ構造 (検索バー+フィルターサイドバー+ソート+ページネーション付き一覧 Box,
グリッド比率 `1fr auto 3fr`, `.root` 自身が `max-width: 1280px;
margin: 0 auto;` を持つ独立ページ) で実装しています — 「組織を横断した
一覧ページ」の5つとは異なり, 既存コンポーネントの再利用ではなく新規実装です
(文書/入出金/会議/指摘事項/修正提案とは違い, 組織一覧はどの組織にも属さない
別階層の一覧のため, 既存の `Organization*` 系コンポーネントを流用できる
形にはなっていません).

- **`OrgListRow`**: `MemberListRow` と同じ構成 (先頭にアバター, 中央に
  名前 (太字)+種別ラベル/概要, 右詰めで所属人数) — 「アイコン」は
  `Avater` (`size="medium" shape="square"`, `OrganizationHeaderBox`
  と同じ形状. 実体は無く常に同じプレースホルダー画像) で表現し, 「種類」は
  `OrganizationHeaderBox` と同じ `Label`+`ORGANIZATION_TYPE_LABEL`
  (学級/執行機関/議決機関/独立委員会/クラブ/有志) です. リンク先は
  `/orgs/${organization.id}` (組織プロフィールページ, 実装済み).
- **`OrgFilterSidebar`**: 全て+`OrganizationType` の6種別, 計7件のフィルターです
  (他のフィルターと同じく実装はまだ無く, 選択すると検索欄に文字列を入れる
  だけ). `DocumentFilterSidebar` と同じ `useFixedSidebarPosition` を使います.
- **`OrgSortDropdown`**: 組織には文書/入出金のような一貫した日付フィールドが
  無いため, 名前/所属人数の2種類です. 「1年→3年」のような強い既定が無いため,
  `MemberSortDropdown` と同じく別フィールドを選び直した際の既定方向は昇順
  にしています (`OrgSortField.Name`/`OrgSortDirection.Asc` が初期値).
- **`type OrgSortField`/`OrgSortDirection`** (`features/organization/types.ts`)
  — 名前/所属人数の2種類. 既存の `DocumentSortField` 等と同じ形ですが,
  フィールド構成が異なる (組織固有) ため独立して定義しています.
- **モックデータ (`MOCK_ORGANIZATIONS`)**: 実データを持つのは
  `MOCK_ORGANIZATION` (`test-org`) の1件だけで, それ以外
  (1〜3年A〜D組の12クラス, 生徒会執行部, 代表委員会, 委員会4件, クラブ6件,
  有志3件の計27件, あわせて28件) は一覧の見た目 (絞り込み/並び替え/
  ページネーション) を確認するためのダミーです — `MOCK_DOCUMENTS`
  (features/user/mockData.ts) と同じく, 一覧側とプロフィールページ側で
  あえて別の ID 空間にする設計のため, `test-org` 以外の行をクリックすると
  「組織が見つかりません」になります.

## 規則・資料ページ (`MaterialsPage`/`MaterialDetailPage`)

`~/materials` (ホーム, `MaterialsPage`) / `~/materials/:documentKey`
(文書詳細, `MaterialDetailPage`) — NavDrawer の「規則･資料」が指すページです.
当初「~/documents のページを, GitHub Docs を参考に規則/資料セクション+
お知らせで作成してほしい」という依頼でしたが, 内容 (会則・規則・協定, 新入生の
方々へ等の立場別案内) が「文書」(`/documents`, 組織が作成する文書の一覧) では
なく「規則･資料」を指すと判断し, ユーザーに確認のうえ `/materials` 側に
実装しています (詳細は「NavDrawer 内の「規則･資料」...」を参照 — 「文書」と
「規則･資料」は元々別物として扱われています). 組織にもドキュメント一覧にも
依存しないため, 新しい feature `features/materials/` (`types.ts`/
`mockData.ts`/`components/`, `features/notifications/` と同じ構成) として
独立させています.

- **`MaterialsHomeSection` (ホーム)**: 「レイアウトはGitHub Docsを参考とし」
  という依頼のため, GitHub Docs のカテゴリ一覧を参考に, 「規則」「資料」の
  2セクションが並ぶ Box (`.sectionsBox`, 縦の `Divider` で区切った2列) の
  下に「お知らせ」を配置する構成にしています.
  - **セクションの中身**: 「規則」は会則/規則/協定の3件, 「資料」は新入生の
    方々へ/会計担当者の方々へ/部長の方々へ/執行部役員に立候補する方々へ/
    常設委員会に入りたい方々へ/行事を行う方々へ/有志の方々へ の7件, 依頼で
    列挙された名称のままリンクにしています (`MenuLink` を再利用, アイコンは
    規則側 `IconGavel`/資料側 `IconUsers` で統一). リンク先は
    `/materials/${document.key}`.
  - **お知らせ**: 「変更点など過去10個分表示する部分を設けてほしい」という
    依頼のため, `MOCK_MATERIAL_CHANGES` (`MaterialChangeLogEntry[]`, 各文書に
    対する変更点を模したダミー) の先頭10件を, 日付の新しい順に並べた状態で
    (モックデータ自体を新しい順に定義することで実現. 実装を簡潔にするための
    割り切りで, 実際のソート処理は行っていません) 一覧表示します. 各行は
    変更点の要約+対象の文書名+日付で, クリックすると対象の文書詳細ページへ
    遷移します.
- **`MaterialBreadcrumb` (文書詳細ページ上部)**: 「上部に "ホーム/セクション名/
  文書名" のパンくずを表示してほしい」という依頼のため, グローバルヘッダーの
  パンくず (`Breadcrumb.tsx` — `/materials` 配下はどの深さでも
  `SPECIAL_ROOT_LABELS` により「規則・資料」の1階層表示のまま) とは別に,
  ページ本文側にこの機能専用の3階層パンくずを実装しています
  (`OrganizationHeaderBox` の祖先組織名パンくずと同じ考え方) — 「ホーム」は
  `/materials` (このページ自身) へのリンク, 「セクション名」はプレーンテキスト
  (対応する一覧ページが無いため), 「文書名」は太字の現在地です.
- **`MaterialsExplorer` (文書詳細ページ下部)**: 「下部に
  `~/orgs/組織ID/meetings/会議ID/materials` の文書閲覧及び選択画面が出る
  ようにしてほしい」という依頼のため, `MeetingMaterialsExplorer` と同じ構造
  (開閉できるディレクトリツリーのサイドバー+選択中の文書のプレビュー) にして
  います. 「ディレクトリを模した部分にはホームでの各リンク名を入れてほしい」
  という依頼のため, サイドバーは「規則」「資料」の2フォルダ (ホームの
  2セクションと対応) の下に, 各セクションの文書 (ホームでの各リンク名と同じ)
  をファイルとして並べています. `MeetingMaterialsExplorer` のファイル行は
  内部 state を切り替えるボタンでしたが, ここでは選択状態が URL の
  `:documentKey` 由来のため実際の `<Link>` にしています — 文書をクリックする
  たびに `MaterialDetailPage` ごと (パンくず含め) 再描画され, サイドバーの
  展開状態は選択中の文書が属するセクションだけを初期状態で開く形にしています
  (以後の開閉は通常どおり手動).
  - 資料は全件 Markdown 相当のため, PDF/動画/テキストのような種別分岐は無く,
    常に `MarkdownFileViewer` (`bordered={false}` + `.markdownContent` の
    負の margin で外枠を二重にしない, `MeetingMaterialsExplorer` と同じ手法)
    で表示しています. `MarkdownFileViewer`/`MarkdownDocument` は
    `features/organization/components/` に置かれたままですが, ドメインに
    依存しない汎用コンポーネントのためこの機能からもそのまま import して
    再利用しています (`features/notifications/` が `features/organization/`
    のモックデータを参照するのと同じ, 既存の踏襲済みの割り切りです).
- **`type MaterialDocument`/`MaterialSectionKey`/`MaterialChangeLogEntry`**
  (`features/materials/types.ts`) — 独立した新規の型です. `MaterialDocument.key`
  はそのまま URL の `:documentKey` として使う英語スラッグ (`bylaws`/
  `new-students` など). モックデータ (`MOCK_MATERIAL_DOCUMENTS`, 10件/
  `MOCK_MATERIAL_CHANGES`, 10件) は `features/materials/mockData.ts` に
  それぞれの文書用の短い Markdown 本文とあわせて用意しています.

## ユーザー名のプロフィールへのリンク化 (`UserNameLink`/`resolveMemberId`)

「ユーザー名が表示されているところは全て, そのユーザーのprofileへのリンクになるように
してほしい. 表示は変化させず, ホバーすると下線が現れるようにしてほしい」という依頼のため,
`ActivityCard`/`DocumentHeaderBox`/`DocumentOverviewSection`/`DocumentVersionTimeline`/
`TransactionHeaderBox`/`TransactionReceiptBox`/`TransactionProcedureTimeline`/
`MeetingAgendaList`/`IssueListRow`/`PullRequestListRow`/`MarkdownDocument`
(議事録の議長/記録/出席者/欠席者/発言者/`@mention`)/`ProfileSidebar` (自分自身の
名前) にある名前の表示箇所をプロフィールページ (`/users/:userId`) へのリンクに
変更しています.

- **`UserNameLink`** (`src/components/ui/`) — ユーザー名表示を共通で扱う部品です.
  `userId`/`name`/`className`/`onClick`/`nested` を受け取り, `userId` が無ければ
  (下記 `resolveMemberId` が逆引きできなかった場合) リンクにせずそのまま `name`
  を表示します. **「表示は変化させず」を実現するため, `UserNameLink.module.css`
  の `.root` は `:where()` で包んで詳細度を 0 にしています** — `<a>` は既定で
  ブラウザ固有の色/下線を持つため, 呼び出し側の見た目を変えないようにするには
  それらを打ち消して親から色/フォントを継承する必要がありますが, 単純にクラス
  として定義すると, `ActivityCard` の `.actorName` や `MarkdownDocument` の
  `.mention` (青文字) のような呼び出し側が独自に持つ色指定と詳細度が同じになり,
  バンドル後の CSS の読み込み順によって勝敗が変わってしまいます. `:where()`
  で詳細度を 0 にすることで, 呼び出し側の指定が (className を渡していても
  渡していなくても) 常に優先されます. `color: inherit; font: inherit;
  text-decoration: none; cursor: pointer;` を基本とし, hover 時だけ
  `text-decoration: underline;` を追加しています.
- **`resolveMemberId`** (`src/features/organization/`) — `actorName`/
  `proposerName`/`authorName`/`uploaderName`/`submitterName`/`posterName` など,
  id を持たない名前の文字列表示箇所から `userId` を逆引きするヘルパーです.
  `currentUser.name` との完全一致, または `MOCK_MEMBERS` の名前との完全一致
  でのみ解決でき, どちらにも一致しない場合 (`NotificationListRow` の
  `senderName` = 組織名など, そもそも個人を指さない文字列) は `undefined`
  を返し, `UserNameLink` はリンクにせずそのまま表示します — このため
  `NotificationListRow` は意図的に変更対象から外しています (組織名を
  ユーザーとして解決しようとしても常に `undefined` になるだけで無意味なため).
  `OrganizationMember` を直接持っているフィールド (`DocumentVersion.editor`
  など) は `resolveMemberId` を経由せず, `editor.id` をそのまま使っています.
- **`nested` prop と `<a>` の入れ子問題**: `IssueListRow`/`PullRequestListRow`
  は行全体が既に1つの `<Link>` (`<a>`) のため, `posterName` をそのまま
  `<Link>` にすると `<a>` の中に `<a>` を入れ子にすることになります. これは
  無効な DOM で, 実際に React が開発コンソールへ
  `In HTML, <a> cannot be a descendant of <a>. This will cause a hydration
  error.` という警告を出すことを Playwright で確認しました (`stopPropagation`
  だけでは解決しません — 詳細は後述). `UserNameLink` の `nested: boolean`
  prop はこれを避けるため, `<a>` の代わりに `role="link"` + `tabIndex={0}`
  の `<span>` と `useNavigate()` (react-router) による命令的な遷移で同等の
  挙動を実現します (biome の `lint/a11y/useSemanticElements` は
  `biome-ignore` コメントで抑制 — 親が `<a>` のため `<a>` を使えない事情を
  コメントに明記). クリックハンドラでは **`event.preventDefault()` と
  `event.stopPropagation()` の両方を呼ぶ必要があります** —
  `stopPropagation()` だけでは親の `<a>` 自身のクリック時デフォルト動作
  (`href` への遷移) を止められないためです (デフォルト動作の抑制には
  `preventDefault` が必要で, これは `stopPropagation` とは独立した仕組み
  ―― `<span>` (それ自身は既定の動作を持たない) 上でクリックが発生しても,
  そのクリックイベントが `preventDefault` されないまま伝播し終えると, 親の
  最も近い `<a>` 祖先の既定動作 (遷移) が実行されてしまいます. 実装当初
  `stopPropagation` だけを呼んでいたところ, 名前をクリックしても行全体の
  リンク先に遷移してしまう不具合を Playwright で実際に踏んで修正した経緯です).
  一方, **`DocumentVersionTimeline` (`<button>` の中に版の編集者名の
  `<Link>` を置く) では, この入れ子は React の DOM 検証エラーにはならない
  ことを確認済みです** (`<button>` は `<a>` と異なり React の
  `validateDOMNesting` の特別扱い対象ではなく, また `<button>` 自身の
  `onClick` はブラウザの既定動作ではなく単なる JS のイベントリスナーのため,
  `event.stopPropagation()` だけで版の選択操作への伝播を止められます) —
  そのため `DocumentVersionTimeline` は `nested` を使わず, 通常の `<a>`
  (`UserNameLink` の既定) + `onClick={(event) => event.stopPropagation()}`
  のままにしています. 同様の「既にリンク/ボタンの中にユーザー名を置く」
  ケースが増えたら, 親要素が `<a>` かどうかで `nested` の要否を判断してください.
- **`OrgNameLink`** (`src/components/ui/`) — 組織名版. `UserNameLink`
  と全く同じ構造 (`:where()` による詳細度0, `nested` prop, `resolveOrganizationId`
  @`features/organization/` による名前→id逆引き) です.
- **見切れた文言をホバーで全体表示 (`title` 属性)**: 「全てのページにおいて,
  3点リーダーが表示されている文言にカーソルを当てると全体が見えるように
  してほしい」という依頼のため, `UserNameLink`/`OrgNameLink` はどちらも
  `userId`/`organizationId` が無い (プレーンテキストのまま表示する)
  場合も含め, 内部で常に `title={name}` をレンダリングします (「表示は
  変化させず」の方針どおり見た目には影響しません — ブラウザ標準のホバー
  ツールチップが増えるだけです). この2つ以外にも, `text-overflow: ellipsis`
  を使っている箇所 (一覧行のタイトル/概要, `PurchaseItemsInput` の名称/
  概要セル, `Breadcrumb`, `MarkdownFileViewer` の文書名など, サイト全体で
  20箇所以上) には同様に呼び出し側で `title={表示している文字列そのもの}`
  を付けています — 新しく `text-overflow: ellipsis` を使う要素を追加する
  際は, 同じように `title` を付けるのが既定の方針です (例外は
  `MeetingCalendarCard` の `.cardLabel` — 見切れた場合はホバーで
  `.popover` という, 単なる `title` より詳しい情報 (ラベル/議題/日時/教室)
  を表示する独自の仕組みが既にあるため, 二重にツールチップが出ないよう
  意図的に `title` を付けていません).

## ホーム画面 (`HomePage`)

`~` — NavDrawer の「ホーム」(`to="/"`) が指す, ルート直下のページです. 「左の
サイドバーには自身が編集に関わった文書を並べ, メインにはGitHubのダッシュボードの
フィードのように組織の文書の発表情報であったり, 全体向けのメッセージであったりを
表示するようにしてほしい. ヘッダー部分には「ホーム」と入れてほしい」という依頼
どおりの構成です. 組織にもドキュメント一覧にも依存しないため, 新しい feature
`features/home/` (`types.ts`/`mockData.ts`/`components/`, `features/notifications/`
と同じ構成) として独立させています.

- **`getBreadcrumb.ts`**: `segments.length === 0` (= `/`) のときのフォールバックを,
  従来の `[]` (何も表示しない) から **`["ホーム"]`** に変更しています — 「ヘッダー
  部分には「ホーム」と入れてほしい」という依頼を, 他の特殊パス
  (`SPECIAL_ROOT_LABELS`) と同じくパンくず1階層の表示名として実現しています.
- **`HomeSection`**: `OverviewSection` と同じ `1fr 3fr` (サイドバー:メイン) の
  列比率で, 左に `HomeSidebar`, 右に `HomeFeed` を配置します.
- **`HomeSidebar`**: 上から「進行中の会計処理」(下記)/`Divider`/「編集した文書」
  の順です. **「編集した文書」**: `MY_EDITED_DOCUMENTS` (`mockData.ts`, 下記)
  を編集日時の新しい順に並べ, 0件のときは一覧の代わりに「編集に関わった文書は
  まだありません.」を表示します. 各行 (`HomeEditedDocumentItem`) は
  `OrganizationListItem` と同じパターン (`menuItemBase.root` を直接
  `<Link to={`/orgs/${organizationId}/documents/${id}`}>` に適用) で,
  文書の組織アバター (`Avater shape="square" size={20}`, 当初は
  `IconFileText` でしたが「組織のアバターに変更してほしい」という依頼で
  差し替え) + 文書名 (太字) + 最終編集日時 (`editedAt` の `-` を `/`
  に置換して表示) の2行構成です.
- **「進行中の会計処理」(`HomeInProgressTransactionItem`)**: 「編集した文書」の
  上に配置する, 自身が起案した会計処理のうち完了/却下していないものの一覧です.
  0件のときはセクション自体 (見出し+`Divider` ごと) を表示しません.
  `getInProgressTransactionsProposedByCurrentUser`
  (`features/organization/mockData.ts`, `currentUser.name` を一部の
  `MOCK_ORGANIZATION_TRANSACTIONS` の `proposerName` に後付けで割り当てる
  `CURRENT_USER_TRANSACTION_OVERRIDES` を参照) が実データを返します. 各行は
  名目 (`description`)/金額 (整形済みの `title`) + ラベルです. ラベルは
  承認待 (`TransactionStatus.ApprovalPending`) ならいつもの
  `TransactionStatusBadge` (青), 承認済 (支払待/清算待) なら
  `getTransactionAvailabilityLabel` (`features/organization/
  transactionAvailability.ts`) が返す「購入可」(立替)/「仮払可」(仮払)
  という teal (`--color-status-teal`, Catppuccin teal を新規追加) の
  ラベルに切り替わります. **この「可能」ラベルが付いた行が一覧の先頭に
  来るよう, `getInProgressTransactionsProposedByCurrentUser`
  側でソートしています** (承認待より優先度が高い, という判断).
- **`MY_EDITED_DOCUMENTS` の生成 (データモデリング)**: 「自身が編集に関わった
  文書」を表現するため, 実在する `MOCK_ORGANIZATION_DOCUMENTS`
  (`features/organization/mockData.ts`) のうち `editors` に `currentUser` が
  含まれる文書だけを抽出しています. **`currentUser` を一部の文書の `editors`
  に加える割り当て自体は, `features/home/` 側ではなく
  `features/organization/mockData.ts` 側で行っています** —
  `RESOLVABLE_AGENDA_ENTRIES` (文書詳細ページの議決情報) と同じ「生成後に
  一部だけ書き換える」手法で, `CURRENT_USER_AS_MEMBER` (`currentUser` の
  `id`/`name`/`email` を使い, `role`/`grade`/`class` は他の `MOCK_MEMBERS`
  と同様の値を仮に割り当てた `OrganizationMember`) を 30件に1件 (index % 30
  === 0, 300件中10件) の文書の `editors` に追加しています. `features/home/`
  側で独自にモックを作らずこの実在データを参照しているため, ホーム画面の
  サイドバーから遷移した文書の「編集者」タブを開いても実際に「テストユーザー」
  が表示され, 矛盾しません (Playwright で確認済み).
- **`HomeFeed`/`HomeFeedCard`**: 「GitHubのダッシュボードのフィードのように」
  という依頼のため, `IconActivity` + 「最新の情報」見出しの下に `HomeFeedCard`
  (`ActivityCard`/`DocumentCard` と同じ外形 `border`/`border-radius`/
  `padding: 16px` のボーダー付き Box) を並べます. `HomeFeedItem`
  (`features/home/types.ts`) は `ActivityCard` と同じ考え方の discriminated
  union (`HomeFeedItemType`) です:
  - **`DocumentAnnouncementFeedItem`** (「組織の文書の発表情報」) — 実在する
    `MOCK_ORGANIZATION_DOCUMENTS` のうち公開済みで編集日時が新しい6件を
    「{組織名}が文書を公開しました」という体裁で参照します (`organizationId`/
    `documentId` を持ち, 文書名は実在の文書詳細ページへ, 組織名は実在の組織
    プロフィールページへ, それぞれ実際にリンクします). `occurredAt` は
    文書の `editedAt` (`"YYYY-MM-DD"`) を `toDisplayDateTime` で
    `"YYYY/MM/DD 09:00"` (時刻情報を持たないため固定の09:00を補う) に整形して
    います.
  - **`BroadcastMessageFeedItem`** (「全体向けのメッセージ」) — 特定の文書/
    組織に紐付かない, 学校全体からのお知らせ (生徒会本部/図書委員会/保健委員会/
    教務課/情報委員会などを送信元とする6件) です. こちらはリンクを持たず,
    `senderName` (太字, ヘッダー) + `title` (太字, 本文見出し) + `body`
    (説明文) をそのまま表示します.
  - 両方をあわせて `occurredAt` の新しい順にソートして `MOCK_HOME_FEED_ITEMS`
    としてエクスポートしています.
  - **カードヘッダーのアバター+バッジ (`HomeFeedCardAvatar`)**: 「カードの
    左上に組織のアバターを追加し, その右下に16x16px程の塗り潰し円を表示して
    アイコンと色を表示してほしい」という依頼で追加しました. `Avater
    shape="square" size={40}` (当初32pxでしたが「40x40にしてほしい」という
    依頼で拡大) の右下に, box-sizing: border-box+`border: 2px solid
    var(--color-background)` (カード自身は透過のため, ページ背景色) の
    円形バッジ (「枠線を含まない大きさが16x16pxになるように」という依頼のため,
    box-sizing は content-box, `width`/`height` を16pxに — 見た目の合計は
    16+2*2=20px) を重ねます. お知らせ (`BroadcastMessageFeedItem`) は青+
    `IconSpeakerphone`, 文書の発表 (`DocumentAnnouncementFeedItem`) は緑+
    `IconFileTextFilled` です.
  - **投稿者名 (`posterName`)**: 「カードのアバターの横に, 投稿者のユーザー名を
    載せてほしい」という依頼で, ヘッダー行のアバターの直後に
    `UserNameLink`+`resolveMemberId` (太字) を追加しました — 文書の発表
    なら `item.authorName` (文書の作成者, `DocumentAnnouncementFeedItem`
    に追加したフィールド), お知らせなら `item.senderName` (部署/委員会などの
    集団名のため, `resolveMemberId` は解決できず結局リンクなしのプレーン
    テキスト表示になります) です. 元々ヘッダー行にあった「{組織名}が文書を
    公開しました」/`senderName` のテキストはそのまま残しているため,
    文書の発表カードは「{投稿者名} {組織名}が文書を公開しました」という
    見た目になります.

## 文書作成ページ (`NewDocumentPage`)

`~/documents/new` — `CreateButton` の「文書を作成」(`/documents/new`) が指す
ページです. 「GitHubのNew repositoryのページを参考とし, 組織/文書名/文書概要/
公開範囲を入力できるようにしてほしい」という依頼どおり, `NewDocumentSection`
(`src/features/organization/components/`, 文書に関するデータを扱うため既存の
`features/organization/` に配置) が単一カラムのフォームとして実装しています.
バックエンドが無いため送信後の実際の作成処理自体は行いませんが (「動作は
のちほど実装する」という既存のスタブと同じ扱い — `handleSubmit` 内にコメントで
明記), **依頼された各項目のバリデーション自体は実際に機能します**:

- **組織 (`<select>`)**: 「自身が所属している組織からドロップダウンで選択」
  という依頼のため, `features/organization/` 側の全組織一覧
  (`MOCK_ORGANIZATIONS`, 28件) ではなく, **`features/user/mockData.ts` の
  `MOCK_ORGANIZATIONS`** (`Organization[]`, `id`/`name`/`role`. `ProfileSidebar`
  の「所属する組織」で使っているのと同じ, currentUser が実際に所属する3件
  ——生徒会/新聞部/文化祭実行委員会——のリスト) を使っています. 同名の別の
  エクスポートが2つの feature に存在するため, import 時に
  `MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS` としてエイリアスしています.
  - **「デフォルトで最近編集に参加した組織を入力」**: `useState` の初期値を
    `getDocumentsEditedByCurrentUser()[0]?.organizationId` (無ければ
    `MOCK_MY_ORGANIZATIONS[0].id` にフォールバック) にしています.
    **`getDocumentsEditedByCurrentUser`** (`features/organization/mockData.ts`
    で新規に export) は, ホーム画面の `MY_EDITED_DOCUMENTS`
    (`features/home/mockData.ts`) が元々個別に実装していた「currentUser が
    editors に含まれる文書を編集日時の新しい順に返す」ロジックを, この
    ページでも同じ形で必要としたため, 重複を避けて共通関数として
    `features/organization/mockData.ts` 側に切り出したものです — `features/home/`
    はこの関数を呼ぶだけになり, 重複していたフィルタ/ソート処理は削除しています.
- **文書名**: 「文書IDではないので重複しても構わないが, 組織内で重複すると
  人間にとってややこしいのでここでチェックを行う, 重複する場合は弾く」という
  依頼のため, 選択中の組織の `MOCK_ORGANIZATION_DOCUMENTS`
  (`organizationId` で絞り込み) の中に完全一致する `title` が無いかを
  `useMemo` でチェックしています (組織を跨いだ重複は許可 — 依頼どおり
  チェック対象外). 空文字列/重複のいずれかならエラーとして送信を弾きます.
  実際にデータを持つのは `test-org` (文化祭実行委員会) だけのため, 重複判定が
  実際に機能する (弾かれる) のは組織に `test-org` を選んだ場合だけです —
  他の2組織 (生徒会/新聞部) はまだ文書データが無いため, 常に重複無し判定に
  なります.
- **文書概要**: 「16文字以上・必須」のため, `description.length < 16`
  をエラー条件にしています. **`X/16文字` のカウンターは16文字未満の間だけ
  表示**します — 16文字を超えた後もそのまま表示し続けると (例: `37/16文字`)
  上限を超過しているかのように誤解されるため, 条件を満たした時点でカウンター
  自体を消し, ヒント文だけを残す形にしています (実装時に実際に見た目を確認して
  気付いた点で, 依頼には無い改善です).
- **公開範囲**: `DocumentVisibility.Public`/`Private` の2択をラジオボタンで
  提供し (GitHub の Public/Private の選択 UI を参考に, それぞれ短い説明文を
  添えています), 初期値は `Public` です.
- **エラー表示のタイミング**: 各項目は「一度フォーカスを外す (`onBlur`)」か
  「送信を試みる (`submitAttempted`)」までエラーを表示しません — 何も
  入力していない初期状態からいきなり赤枠/エラー文が出ないようにするためです.
  **送信ボタン (`Button`, 後述) はあえて `disabled` にしていません** —
  無効化されたボタンはキーボード操作性/なぜ押せないかの説明という点で
  劣るため, 常に押せる状態にしたうえで, 無効な状態で押された場合は
  `submitAttempted` を立てて全項目のエラーを一斉に表示する (実際の送信処理は
  スキップする) という, 一般的なフォームの実装方針を採っています.
- **`Button`** (`src/components/ui/`) — 塗りつぶしの主要アクションボタンです.
  README.md/CLAUDE.md の「UI コンポーネントの共通パターン」では以前から
  `Button` の存在が前提として書かれていましたが実体が無かったため, この
  フォームの送信ボタンの実装にあわせて新設しました. `type`/`disabled`/
  `onClick`/`className` に加え, `color?: "blue" | "green"` (既定 `"blue"`,
  `--color-link`/文字 `--color-background`. `Pagination` の選択中ページ番号と
  同じ配色) と `variant?: "filled" | "ghost"` (既定 `"filled"`. `"ghost"`
  は背景透過+`--color-border` の枠線のみ) を受け取ります — 会計申請作成
  ページ (後述「会計申請作成ページ」) の確認/キャンセル系ボタンで
  緑色/背景透過が必要になった際に追加した props です.

## 会計申請作成ページ (`NewTransactionSection`)

`~/book/new` — `CreateButton` の「会計申請を作成」が指すページです. 当初は
「支出」(仮払/立替) 専用の単一フォームでしたが, 「申請の最上部に "支出の申請"
"予算執行の申請" "寄付の申請" というラジオボタンを3つ横並びに配置し, それぞれ
別の入力画面を表示してほしい」という依頼で, `NewTransactionSection.tsx`
自体は3つのモードを切り替えるだけの薄いディスパッチャに変わり, 実際の入力画面は
`ExpenseRequestForm`/`BudgetExecutionRequestForm`/`DonationRequestForm`
(いずれも `src/features/organization/components/`) の3コンポーネントに
分割されています. 3フォームとも「送信ボタン押下→確認画面→(送信 or
キャンセルして破棄確認→破棄)」という同じ UX (「会計申請作成ページの送信/
キャンセル UX」を参照) を踏むため, 重複を避けて以下の要素を共通化しています:

- **`requestFormBase.module.css`** (`features/organization/components/`) —
  3フォーム+モード選択 (`NewTransactionSection`) が共通で使うフィールドの
  見た目 (`.root`/`.field`/`.label`/`.required`/`.input`/`.select`/
  `.textarea`/`.error`/`.hints`/`.requestTypeOptions` (縦積みのラジオ選択肢)/
  `.modeOptions` (横並び版, 後述)/`.radio`/`.formActions`/
  `.amountFieldWrapper`+`.currencySuffix` (金額入力欄+右の「円」)/
  `.paymentMethodOptions`+`.paymentMethodOption` (支払方法の横並びラジオ) など)
  をまとめた CSS Module です. 元は支出の申請専用の
  `NewTransactionSection.module.css` でしたが, 予算執行/寄付の申請が
  追加されたタイミングでこの汎用名に切り出しました (中身は「フィールドの
  見た目」であって「購入」固有ではなかったため, リネームだけで転用できました).
- **`RequestConfirmDialog`** (`features/organization/components/`) — 送信
  ボタン押下時の確認モーダルです. `items: { label: string; value: string
  }[]` を受け取り, ラベル+値の並びをそのまま `<dl>` で表示するだけの汎用
  コンポーネントにしています (元は支出専用の `TransactionConfirmDialog`
  でしたが, 予算執行/寄付それぞれの要約内容 (対象組織/対象予算項目/支払方法/
  支払先/購入品目, など) が異なるため, 固定 props ではなく `items`
  配列に一般化しました). 送信する (緑)/修正する (背景透過) を**縦に**並べます
  (元は「送信する/修正する/キャンセル」の3ボタンでしたが,
  「送信の確認モーダルからキャンセルボタンをなくしてほしい」という依頼により
  キャンセルボタン (`onCancel` prop ごと) を削除しています — 入力内容を
  破棄したい場合は「修正する」(またはオーバーレイ/Escape, どちらも同じ
  `onEdit` に割り当て) でいったん入力画面に戻ってから, 入力画面側の
  「入力内容を破棄」ボタンを使う想定です). 見た目の土台 (オーバーレイ+
  画面中央のパネル) は `src/components/ui/Dialog.tsx` (`onClose`+
  `labelledBy`+`children` を受け取るだけの汎用シェル. `RequestConfirmDialog`/
  `DiscardConfirmDialog` の両方がここから切り出されています) を使っています.
- **`DiscardConfirmDialog`** (`features/organization/components/`) —
  「キャンセルボタンが押下された場合は, 確認モーダルでも入力画面でも
  『入力内容が破棄されるが本当にキャンセルするか』を訊くモーダルを作成して
  ほしい」という依頼で追加した, 破棄確認の第2段モーダルです (当時は確認画面
  側にも「キャンセル」ボタンがありましたが, 上記のとおり削除済みのため,
  現在この確認は入力画面の「入力内容を破棄」ボタンからのみ経由します).
  「本当にキャンセルしますか?」の下に, 右側に青で「入力画面に戻る」, 左側に
  背景透過で「入力内容を破棄する」を配置しています (安全な側の操作を右+
  強調色, 破壊的な操作を左+控えめな見た目にする, という判断. オーバーレイの
  クリック/Escape も安全な側 = 「入力画面に戻る」に割り当てています).
- **`useRequestSubmitFlow`** (`features/organization/`) — 送信/確認/
  キャンセル/破棄の一連の状態遷移 (`confirmOpen`/`discardConfirmOpen`/
  `submitAttempted` の3つの state と, それぞれの操作に対応するハンドラ) を
  まとめたフックです. `isValid`/トースト文言 (`pendingMessage`/
  `successMessage`, フォームごとに「会計申請」/「予算執行申請」/「寄付申請」
  と変える) だけをフォーム側から渡します. 「キャンセルした場合, キャンセル
  しましたとトーストに出してほしい」という依頼のため, 破棄確定時
  (`handleDiscard`) は `showToast` (未完了/スピナー表示) を経由せず
  `resolveToast` を直接呼んで完了状態のトーストを即座に表示しています
  (破棄は待つ処理が無い即時完了の操作のため). 送信/破棄いずれの場合も
  最終的に `navigate(-1)` で「入力画面の前に開いていた画面」へ戻ります.
- **`SELECTABLE_ORGANIZATIONS`** (`features/organization/selectableOrganizations.ts`)
  — 「組織から有志は選択できないようにしてほしい」という依頼のため,
  `features/user/mockData.ts` の `MOCK_ORGANIZATIONS` (所属組織) から
  `OrganizationType.Volunteer` を除いたものを3フォーム共通の組織
  ドロップダウンの選択肢にしています. このフィルタのために
  `features/user/types.ts` の `Organization` に `type?: OrganizationType`
  (`features/organization/types.ts` からの再利用) と `hasBankAccount?:
  boolean` (後述の寄付/予算執行フォームの銀行口座選択肢の出し分け用) を
  追加しました — `MOCK_ORGANIZATIONS` (`features/user/mockData.ts`)
  の3件のうち `test-org` (文化祭実行委員会) だけ `hasBankAccount: true`
  にしています.
- **`isValidNaturalNumberInput`** (`features/organization/purchaseItemDraft.ts`)
  — 「金額と個数について, 自然数のみを受けつけるようにし, 0始まりの数字も
  禁止してください」という依頼のため追加した検証関数です (`/^[1-9]\d*$/`
  にマッチするか空文字列かのみ許可). 金額系の `<input>` は `type="number"`
  ではなく `type="text" inputMode="numeric"` にした上で, `onChange`
  でこの関数が false を返す入力はそもそも state に反映しない (=
  不正な文字はそのまま弾かれ, 入力欄に現れない) ことでこの制約を実現して
  います. `PurchaseItemsInput` の金額/個数と, 寄付/予算執行フォームの
  金額入力欄すべてがこの関数を共有しています.

以下, モードごとの差分です.

- **支出の申請 (`ExpenseRequestForm`)** — 従来からある画面です. 組織/購入名目/
  種類 (仮払/立替のみ. 「寄付」は後述のとおりこの種類の選択肢から削除し,
  最上部のモード自体に格上げしました)/購入品目 (`PurchaseItemsInput`, 予算執行
  申請とも共有)/証憑画像 (立替のときだけ) という, 元々の `NewTransactionSection`
  とほぼ同じ構成です.
  - **`PurchaseItemsInput`** (`features/organization/components/`) の主な
    特徴: 名称/概要/金額/個数/計の5列の編集可能な表. 最下段に常に1件だけ
    空白行を保ち, いずれかのフィールドに入力があった瞬間に新しい空白行を
    追加します. 金額/個数は上記の自然数検証を使い, 金額の右には常に「円」
    を表示します (`.amountInputWrapper`/`.currencySuffix`). 金額/個数の
    どちらかが未入力の行の「計」は `0円` ではなく `"- 円"` と表示します
    (「なにも入力されていない場合, 計はハイフン円となるようにしてほしい」
    という依頼のため). 「金額」「個数」列は「計」列と同じ幅
    (`<colgroup>` の `<col>` に `width` を指定) にして, 名称/概要をより
    広く見せています. `isEstimate?: boolean` (仮払選択時に true) を渡すと
    「金額」→「金額 (概算)」/「合計」→「合計 (概算)」に見出しが切り替わります
    (仮払は支払前の見込み額であるため).
  - **`OrganizationSelectField`** (`features/organization/components/`) —
    組織ドロップダウン. 「ヘッダーの作成ボタンと同じ形式にし, 組織名の左に
    アバターを表示してほしい」という依頼のため, ネイティブ `<select>`
    ではなく `useDismissablePopover` + `menuItemBase` の構成 (`CreateButton`
    と同じパターン) のカスタムドロップダウンです. トリガー/パネル内の各項目
    どちらもアバター (`Avater shape="square" size={20}`) を組織名の左に
    表示します. 見た目の土台は `src/components/ui/selectFieldBase.module.css`
    (`.wrapper`/`.trigger`/`.triggerContent`/`.triggerLabel`/`.menu`/
    `.group`/`.groupLabel`) — 元は `OrganizationSelectField` 専用の
    CSS Module でしたが, 「予算項目のドロップダウンを組織のドロップダウンと
    同じ形式にしてほしい, 今後ドロップダウンを実装する場合もそうしてほしい」
    という依頼を機に, `BudgetLineItemSelectField` (後述の「予算執行の申請」
    を参照) とも共有する汎用の土台として `components/ui/` へ切り出しました
    — **フォームにドロップダウンを追加する際は, 今後もまずこのパターン
    (ネイティブ `<select>` ではなく, ボタントリガー+`menuItemBase` のパネル)
    を検討してください.** `.group`/`.groupLabel` はグループ分けが要る
    ドロップダウン (`BudgetLineItemSelectField` など) だけが使う, オプトイン
    のクラスです.
- **予算執行の申請 (`BudgetExecutionRequestForm`)** — 対象組織/対象予算項目/
  支払方法/支払先/購入品目の5項目です.
  - **対象予算項目 (`BudgetLineItemSelectField`)**: `features/organization/
    budgetMockData.ts` の `MOCK_BUDGET_LINE_ITEMS` (所管/組織/項の3階層を
    持つダミーデータ) を「所管 - 組織」でグループ化して表示します. 当初は
    ネイティブ `<select>` + `<optgroup>` でしたが, 「予算項目のドロップダウンを
    組織のドロップダウン (`OrganizationSelectField`) と同じ形式にしてほしい,
    今後ドロップダウンを実装する場合もそうしてほしい」という依頼により,
    `OrganizationSelectField` と同じ `useDismissablePopover` +
    `menuItemBase` のカスタムドロップダウンに置き換えています (詳細・
    共通土台の切り出しは後述の `selectFieldBase.module.css` を参照). 3階層の
    分類は, パネル内でグループ見出し (`selectFieldBase.module.css` の
    `.group`/`.groupLabel`) の下に該当する項を並べる形で表現しています —
    グループ見出し自体はクリックできず, 「項」の行だけが選択可能です
    (ネイティブ `<optgroup>` と同じ役割分担). グループ化のロジック
    (所管→組織のキーで `Map` に集約) は, 呼び出し元ではなくこの選択欄の
    コンポーネント自身が引数の `items` から算出する形にしています —
    以前はネイティブ select 版の実装当時, `BudgetExecutionRequestForm`
    側で `useMemo` していましたが, この関心事は選択欄の内部実装なので
    コンポーネントに閉じ込めました.
  - **支払方法**: 「口座振込･払込票 (ゆうちょ銀行)･現金」の3択ラジオです
    (元は「銀行口座･振り込み用紙･現金」という表示名でしたが依頼により
    改称 — コード上の識別子 `BudgetPaymentMethod.BankAccount`/
    `TransferSlip`/`Cash` (`bank-account`/`transfer-slip`/`cash`) 自体は
    当時のまま変えていません). 実際に完了した会計処理の決済手段を表す
    `PaymentMethod` (現金/銀行振込/引き落し. 一覧/詳細ページ側で使う型) の
    「引き落し」とは別概念 (「払込票」は用紙に記入して提出する方式) のため,
    混同を避けてこのフォーム限定の型として独立させています.
  - **支払先**: 支払方法に応じて表示する入力欄を出し分けます.
    - **口座振込**: 銀行名/銀行コード (4桁)/支店名/支店番号 (3桁)/口座番号
      (自然数, 桁数上限無し)/口座名義 (全角カタカナのみ) の6項目です
      (`.fieldRow`+`.subField`/`.subLabel` で2つずつ横並びに, 個々に
      小さな見出しを添えています). 銀行コード/支店番号/口座番号は数字のみ
      (先頭の "0" も許容 — `purchaseItemDraft.ts` の
      `isValidNaturalNumberInput` とは異なる検証のため, 専用の
      `isValidDigitsInput` を `BudgetExecutionRequestForm.tsx` 内に
      定義), 口座名義は全角カタカナ (+空白) のみを `onChange`
      で弾く形で入力を制限しています (`isValidKatakanaInput`).
    - **払込票 (ゆうちょ銀行)**: 口座記号番号 (記号5桁-検査数字1桁-番号
      最大8桁, 例: `12345-6-78901234`) + 加入者名の2項目です. 「それぞれの
      入力欄が5桁, 1桁, 8桁であることが判るよう, 入力欄を分割し, 桁の間に
      分割線を入れてほしい」という依頼のため, 1つの `<input>` ではなく
      3分割した `<input>` を `-` の区切り文字 (`.postalSeparator`) で
      繋いだ `.postalAccountRow` にしています (各欄の幅は `ch` 単位
      (`calc(Nch + 24px)`, `.input` の左右 padding 分を加算) で桁数どおりに
      見た目でも判るようにしています). 番号欄 (最大8桁) だけは「左詰めで
      入力し, 1桁でも埋まっていればよい」という依頼のため, 他2つ (記号/
      検査数字, 桁数ちょうどでないと無効) と異なり1桁以上あれば有効です.
      元は自由記述の `<textarea>` (「振り込み用紙」名義当時) でしたが,
      この依頼で置き換えています.
    - **現金**: 支払先を書く `<input>` 1つです (ラベル「支払先」を明示的に
      表示 — 依頼を機に他の支払方法と同じ `.subField`/`.subLabel` の見た目に
      揃えています).
    - 支払方法に関わらず, 末尾に「備考 (任意)」の `<textarea>` +
      「参考となる画像 (任意)」の `ReceiptUploadField` (証憑画像
      アップロード欄と同じコンポーネントを再利用) を配置しています —
      「参考画像の上に任意の備考欄を設けてほしい」という依頼で追加しました.
  - **購入品目**: 「支出の申請のものと同じリスト」という依頼のとおり,
    `ExpenseRequestForm` と全く同じ `PurchaseItemsInput` をそのまま
    再利用しています (`isEstimate` は渡していないため常に「金額」「合計」
    の通常表記のままです — 予算執行に「概算」の概念は無いため).
- **寄付の申請 (`DonationRequestForm`)** — 対象組織/支払方法/金額の3項目
  だけの, 他の2つよりずっと単純なフォームです. 支払方法は現金/銀行口座の
  2択ラジオで, 銀行口座は対象組織が `hasBankAccount: true`
  (`SELECTABLE_ORGANIZATIONS`) の場合だけ選択肢に現れます (対象組織を
  切り替えて銀行口座を持たない組織を選ぶと, 選択中だった支払方法が銀行口座
  でも自動的に現金へ差し戻します — `effectivePaymentMethod` を参照).
  金額欄は自然数のみ入力可能で, 右に「円」を表示します (`ExpenseRequestForm`
  の金額入力欄と同じ `.amountFieldWrapper`/`.currencySuffix`).
  - 当初「寄付」は支出の申請の「種類」(仮払/立替と並ぶ3つ目の選択肢, 選択中
    の枠線/ラジオボタンの色を緑にし, 仮払・立替との間隔を広く取って別
    カテゴリだと分かるようにする) として実装されましたが, 後の依頼で
    最上部のモード自体に格上げされ, 「種類」からは削除されています —
    「種類」欄の緑色/間隔を広くする実装 (`requestTypeOptionSelectedGreen`/
    `requestTypeOptionSeparated`, `requestFormBase.module.css`) 自体は,
    現在は最上部の3モードのラジオ (`.modeOptions`, 横並びのため
    `.requestTypeOptionSeparated` は使っていません) ではなく,
    削除済みの旧実装の名残としてクラスだけ CSS に残っています —
    寄付以外の用途で緑の強調色/間隔を広げる選択肢が必要になったら
    再利用してください.

## 会計申請作成ページの送信/キャンセル UX

支出/予算執行/寄付の3フォームすべてが共有する, 送信ボタン押下からの一連の
画面遷移です (`useRequestSubmitFlow` 前述を参照):

1. 送信ボタン押下 → バリデーション NG ならエラー表示のみ (`submitAttempted`
   を立てて全項目のエラーを一斉表示). OK なら `RequestConfirmDialog`
   (確認画面) を表示.
2. 確認画面の「送信する」→ 画面を入力画面の前に開いていた画面に戻し
   (`navigate(-1)`), 右上にトーストで「送信しています…」を表示. 実際の
   送信処理 (API 呼び出し) はまだ無いため, ダミーの遅延 (`setTimeout`,
   1500ms) の後にトーストの表示を緑のチェックマーク+「送信が完了しました」
   に切り替えます (4秒後に自動で消えます — トースト自体の仕組みは
   `src/contexts/ToastContext.tsx` を参照).
3. 確認画面の「修正する」→ 確認画面を閉じて入力画面に戻るだけ (入力内容は
   そのまま). オーバーレイのクリック/Escape もこちらと同じ扱いです.
4. 入力画面の「入力内容を破棄」(元は「キャンセル」— 依頼により改称. 確認画面
   側の同名ボタンは削除済みのため, 現在この操作の入口はここだけです)
   → `DiscardConfirmDialog` (破棄確認) を表示. 確認画面は (もし開いていれば)
   閉じておきます.
5. 破棄確認の「入力画面に戻る」→ 破棄確認を閉じるだけ (常に入力画面へ
   戻る — 確認画面を経由していた場合でも確認画面へは戻さず, 素の入力画面
   まで戻します).
6. 破棄確認の「入力内容を破棄する」→ 送信完了時と同じく `navigate(-1)`
   で画面遷移しますが, 実際には何も送信していないためトーストは
   (成功アイコンではなく) 「キャンセルしました」を即座に表示するだけです
   (`showToast` を経由せず `resolveToast` を直接呼んでいます — 破棄は
   待つ処理の無い即時完了の操作のため).

## 404 ページ (`NotFoundPage`)

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
