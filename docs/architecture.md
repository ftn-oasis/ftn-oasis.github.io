# アーキテクチャ

> 索引: [`docs/README.md`](README.md)

## パスエイリアス

`tsconfig.app.json` で絶対パスのエイリアスが2つ定義されており (`vite-tsconfig-paths` により
Vite にも自動反映されます):

- `@/*` → プロジェクトルート (例: `@/src/components/...`)
- `@src/*` → `./src/*` (例: `@src/components/...`)

どちらも同じファイルを指しますが, `src/` 配下を指す場合は既存のコードの大半に合わせて `@src/*`
を優先してください.

## アプリの構成

`main.tsx` は `<AppProviders><App /></AppProviders>` をマウントします. `AppProviders`
(`src/providers/AppProviders.tsx`) は Context のグローバルなラッパーをまとめる唯一の場所で,
現状は `ThemeProvider`/`ToastProvider` の2つです. 新しいグローバルな Provider を追加する際は,
`main.tsx` に直接ラップするのではなく, ここに追加してください. **ルーティングは `App.tsx`
側にあります** — `createBrowserRouter(createRoutesFromElements(<Route>...))` +
`<RouterProvider>` (react-router のデータルーター) で, ルート定義の JSX 自体は以前の
`<BrowserRouter><Routes>...</Routes></BrowserRouter>` (`AppProviders.tsx` 側にあった構成)
から無変更のまま `createRoutesFromElements` に渡しています. **この移行は
[作成画面の離脱ガード](navigation-guard.md) が使う `useBlocker` がデータルーターでしか
動作しないために必要でした** — 宣言的な `<BrowserRouter>` のままでは `useBlocker`
を呼ぶと実行時エラーになります. `ToastProvider` (`ToastContext.tsx` — ページ遷移をまたいでも
表示され続けるようにするためグローバルな Provider にしている) は元々 `BrowserRouter`
の内側・`Routes` の外側に置いていましたが, 移行後は `RouterProvider` 自体の外側
(`AppProviders`) に置く形になっただけで, 「ページ遷移で再構築されるツリーの外側にある」
という位置関係自体は変わっていません.

### テーマ (`ThemeContext`)

`ThemeContext` (`src/contexts/ThemeContext.tsx`) はライト/ダークテーマの状態と `useTheme()`
フックを保持します.

- 初期値は `getSystemTheme()` (`matchMedia("(prefers-color-scheme: dark)")`) で OS の設定から
  決め, `matchMedia` の `change` イベントも購読しているため, アプリを開いたまま OS 側の設定を
  変えるとサイトのテーマも自動追従します.
- `toggleTheme` で手動切り替えすると `hasManualOverrideRef` が立ち, それ以降は
  (再読み込みするまで) OS 側の変更より手動選択を優先します — 自動追従と手動トグルが
  競合しないためです.
- `theme` state は `useEffect` で `document.documentElement.dataset.theme` に反映しており,
  `src/styles/theme.css` の `[data-theme="light"|"dark"]` セレクタがこれを参照します.
  state を持つだけでは見た目に反映されない点に注意してください.
- 永続化 (localStorage 等) にはまだ対応していません — 手動選択はページ再読み込みで失われます.

## ディレクトリの規約

- `src/components/` — ドメインを知らない汎用部品.
  - `ui/` — `Button`/`Avatar`/`IconLink`/`IconButton`/`MenuLink`/`Divider`/`CurrentContentBar`/
    `Label` などの原子的な部品と, それらが共有するフック (`useTooltipAlign`,
    `useDismissablePopover`, `useEscapeKey`) や CSS Module (`controlBase`/`menuItemBase`/
    `tabBase`/`selectFieldBase`, 詳細は [`docs/ui-common-patterns.md`](ui-common-patterns.md)).
  - `layout/` — `Header` とその内部部品 (`Breadcrumb`, `PrimaryNavLinks`,
    `useHeaderResponsiveLayout`, `getBreadcrumb`, 下部ヘッダーのスロットを提供する
    `HeaderBottomSlotContext`/`HeaderBottomPortal`), 全ページ共通の `AppLayout`
    (`HeaderBottomSlotProvider` + `Header` + `<Outlet />`). 詳細は [`docs/header.md`](header.md).
- `src/features/<feature>/` — 機能ごとにまとまったコード.
  - `features/navigation/` (`MenuButton`, `NavDrawer`, `CreateButton`, `UserMenuButton`,
    フラットに直下へ配置)
  - `features/user/components/` (`ProfileTabs`/`OverviewSection` など, `components/`
    を1段挟む配置 — `features/navigation/` とは階層が異なる点に注意)
  - `features/organization/components/` (`OrganizationTabs`/`OrganizationOverviewSection`/
    `OrganizationDocumentsSection`/`OrganizationBookSection`/`OrganizationMembersSection`/
    `OrganizationMeetingsSection`/`Document*` (文書詳細ページ)/`Issue*`/`PullRequest*` など,
    同じく `components/` を挟む配置. 詳細は `docs/pages/organization-*.md` 各ファイルを参照)
  - `features/notifications/components/`, `features/materials/components/`,
    `features/home/components/`, `features/printQueue/components/`,
    `features/roomReservations/components/`, `features/equipmentLoans/components/` —
    いずれも組織/文書に紐付かないグローバルな機能のため独立させています. 詳細は
    対応する `docs/pages/*.md` を参照.
- `src/pages/` — ルートと1対1で対応するコンポーネント. 一覧・ネスト構造の詳細は
  `docs/pages/*.md` 各ファイルを参照してください. `OrganizationLayout`
  (`/orgs/:orgId` の親ルート, 「組織が見つかりません」判定と `OrganizationTabs`
  の表示を担う) をはじめ, `OrganizationDocumentLayout`/`OrganizationTransactionLayout`/
  `OrganizationMeetingLayout` の3つも同様に「見つかりません」判定+上部の要約/タブ表示を
  それぞれの親ルートに集約する設計です. `NotFoundPage` (`path="*"`) が catch-all として
  存在します.
- `src/lib/` — 機能にもコンポーネントにも依存しない道具置き場
  (`currentUser.ts`, `navigationHistoryStack.ts`, `useNavigationHistoryTracking.ts` など).
- コンポーネントのスタイルは CSS Modules をコンポーネントと同じ場所に配置する方式です
  (`Foo.tsx` + `Foo.module.css`), `clsx` で合成します.

### カラートークン・デザイントークン (`theme.css`/`globals.css`)

Catppuccin ベースのカラートークン (`--color-header-*`, `--color-border`, `--color-focus` など)
は `src/styles/theme.css` に定義されており, `src/styles/globals.css`
(`@import url("./theme.css");` のみの薄いファイル) 経由で `src/index.css` から import
されています. `globals.css` は将来テーマ以外のグローバルスタイルを追加する場合の置き場として
空けてあるので, テーマの内容は `theme.css` に足してください. 新しい部品の色は極力これらの
カスタムプロパティを参照してください — **定義済みだが未使用のトークンが無いか確認してから
新しい色を決めてください** (`--color-header-logo`/`--color-header-body-em`/
`--color-current-content-bar` (`MenuLink` の `.active` の左脇の線) はこうして見つかった例です).

`theme.css` は `:root`/`[data-theme="light"]` (既定) と `[data-theme="dark"]` の2ブロックで
構成され, 後者は前者と同じトークン名を Mocha パレットで1:1に上書きする完全なミラーです —
**新しいトークンは必ず両方のブロックに追加してください** (片方だけだとテーマ切り替え時に
そこだけ色が変わらず残ります).

色以外の共通デザイントークン (テーマに依らず値が変わらないもの) は `globals.css` 自身の
`:root` ブロックに定義します — 現状 `--borderRadius-medium: 0.375rem`/
`--borderWidth-thin: 0.0625rem` の2つ (ユーザーからそのままの表記で指定されたため, 既存の
`--color-*` 系と異なり camelCase を含みます — `stylelint` の `custom-property-pattern`
指摘は意図的なものとして無視してください).

- `--borderRadius-medium` は `controlBase` (`IconButton`/`IconLink`)・`menuItemBase`
  (`MenuLink` など)・`NavDrawer` の閉じるボタン・`ProfileTabs` の `.tab` など,
  「角丸 8px のボタン, またはそのボーダーを取り払ったもの」に適用しています.
- `--borderWidth-thin` はそのうちボーダーが実際に表示されているもの (`controlBase` のみ)
  に適用しています.
- `CreateButton`/`UserMenuButton` の `.menu` (ドロップダウンパネル) や `NavDrawer` の
  `.drawer` (ドロワー全体) は角丸の数値こそ同じ 8px でしたが, ボタンではなくパネル/
  コンテナのため対象外としました — ボタンの見た目のトークンとして導入した経緯を踏まえての
  判断です. パネル類にも広げるかどうかはユーザーに未確認なので, 今後変更する際は先に
  相談してください.

### その他のグローバルスタイル

- `src/index.css` の `body` は `margin: 0` のみで, `padding` は付けません (`Header` が
  画面の上下左右いっぱいに表示されるべきデザインのため).
- `src/index.css` の `:root` に `scrollbar-gutter: stable;` を指定しています —
  縦スクロールバーの有無に関わらず常にその分の余白を確保するためで, これが無いと,
  ページ (や, 会議一覧のリスト/カレンダー表示切り替えのように同じページ内のモード)
  によってスクロールバーの有無が変わるたびに, `max-width` + `margin: 0 auto` で
  中央寄せしているコンテンツ全体がその分だけ左右にわずかにずれて見える不具合になります
  (「モードを切り替えた際に全体が若干左右にずれる」という指摘で追加しました).
- フォントは `src/styles/fonts.css` で `--font-body` ("Noto Sans JP") / `--font-mono`
  ("M PLUS 1 Code") を定義し, `src/index.css` から import した上で `:root` (本文) と
  `code`/`pre`/`kbd`/`samp` (等幅) にそれぞれ適用しています. 実体は `index.html` の
  Google Fonts の `<link>` で読み込んでおり (現状 400/700 のみ), 太さを増やす場合は
  `index.html` の `family=...:wght@...` にも追加してください.
- Vite の React テンプレート由来だったグローバル CSS の残骸 (`src/App.css` の
  `#root { text-align: center; }`, `src/index.css` の `button { padding: 8px 16px; ... }`/
  `nav a { margin-right: 16px; }`) は削除済みです. 経緯・調査内容は
  [`docs/pages/organization-documents.md`](pages/organization-documents.md) の
  「グローバル CSS のクリーンアップ」を参照してください — 「揃えたはずなのに揃わない」
  ことがあれば, まずこの手のグローバルな残骸が無いか (`src/index.css`/`src/styles/` 以下)
  疑ってください.

## export の方法

宣言 (`function`/`const`/`type` など) には `export` を付けず, ファイル末尾にまとめて
`export { Foo, Bar };` (型は `export { type Foo, Bar };`) の形で1箇所に集約します.
`export default` や, 宣言と同時に `export function Foo() {}` のように書くスタイルは
使いません. 自動生成ファイル (`src/components/ui/emblem-names.ts` など) も対象で,
生成元のスクリプト (`scripts/build-sprite.mjs`) の出力テンプレート側を直してください.
