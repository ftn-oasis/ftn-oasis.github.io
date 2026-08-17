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
  (`Header` + `<Outlet />`, 全ページ共通) 配下に `/:userId` → `UserProfilePage`
  (`src/pages/`) を実装済みです. `currentUser.id` と一致しない `userId`
  (未知のユーザーや `/issues` のような他機能の予約パスなど) は「ユーザーが見つかりません」
  という結果になります — 実際のユーザー検索/存在チェックの API が無いための暫定挙動です.
  `UserProfilePage` はアバター+ユーザー名と `ProfileTabs` を表示するのみで,
  タブごとの本文切り替えはまだ実装していません.

現状できていないこと (着手する際は要確認):

- **上記以外のページ**は依然として存在しません. Header/Drawer 内のリンク先の大半は
  「まだページが存在しない」状態です. 新しいページを作る際, URL の命名は既存のリンク
  (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` など) と揃えてください. `/:userId`
  という動的ルートが既に存在するため, 新しいトップレベルのページ (`/foo` 等) を追加する場合は
  それより**前**に `<Route>` を並べてください — でないと `/:userId` に飲み込まれます
  (`/issues` などが「ユーザーが見つかりません」と表示されるのはこのためで, 実際に `/issues`
  ページを作る際に解消します).
- 認証/バックエンド — 存在しません. `src/lib/currentUser.ts` に仮のユーザー情報
  (`id`/`name`/`email`) を置いているだけです. `UserProfilePage` の文書/栞の件数も
  ダミーの数値です (`DUMMY_DOCUMENT_COUNT`/`DUMMY_BOOKMARK_COUNT`).
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
    書くこのプロジェクトの規約と既定設定が衝突しているだけなので無視してください. それ以外
    (ショートハンドの提案, `@import url(...)` の記法, 宣言前の空行など)
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
  - `ui/` — `Button`/`Avatar`/`IconLink`/`IconButton`/`MenuLink`/`Divider`/`CurrentContentBar`
    などの原子的な部品と, それらが共有するフック (`useTooltipAlign`, `useDismissablePopover`,
    `useEscapeKey`).
  - `layout/` — `Header` とその内部部品 (`Breadcrumb`, `PrimaryNavLinks`,
    `useHeaderResponsiveLayout`, `getBreadcrumb`, 下部ヘッダーのスロットを提供する
    `HeaderBottomSlotContext`/`HeaderBottomPortal`), 全ページ共通の `AppLayout`
    (`HeaderBottomSlotProvider` + `Header` + `<Outlet />`).
- `src/features/<feature>/` — 機能ごとにまとまったコード. 現状 `features/navigation/` (`MenuButton`,
  `NavDrawer`, `CreateButton`, `UserMenuButton`, `ToggleThemeButton`, フラットに直下へ配置) と
  `features/user/components/` (`ProfileTabs`, README.md のファイル構造に合わせて `components/`
  を1段挟む配置 — `features/navigation/` とは階層が異なる点に注意) が存在.
- `src/pages/` — ルートと1対1で対応するコンポーネント. 現状 `UserProfilePage`
  (`/:userId`) のみ存在.
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

`NavDrawer`/`CreateButton`/`UserMenuButton` の中の各行が使う, `controlBase` とは別系統の土台です.
正方形ではなく横幅 100%・中身は左揃え・ボーダーは通常時もhover時も常に非表示 (hoverは背景色の
変化のみ) です. `.root` には `box-sizing: border-box` を明示しています (`<a>`/`<Link>` は既定で
`content-box` のため, これがないと `width: 100%` に `padding` が上乗せしてはみ出します).

`MenuLink` (`src/components/ui/MenuLink.tsx`) はこの土台の上にアイコン+可視ラベルを乗せた
リンクです. `to` が `/^https?:\/\//` にマッチすれば `<a href>` (外部リンク), それ以外は
`react-router` の `<NavLink to={...} end>` として描画します — `<Link>` ではなく `<NavLink>`
なのは, 現在のパスと `to` が一致する項目を強調するためです. `end` を付けているのは, 付けないと
`to="/"` が常にどのパスでも一致してしまう (NavLink は既定でプレフィックス一致) ためで,
現状ネストしたサブページが無いこととも合わせ, 完全一致で揃えています. 一致する項目には
`.active` (menuItemBase 側で定義, hover と同じ背景) を付けつつ, `NavLink`
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

`NavDrawer` 内の「規則･資料」「組織」は実際のドメインが未確定のため,
`https://<subdomain>.io/{documents,organizations}` というプレースホルダーの外部URLを
暫定的に使っています (バグではなく意図的な仮置きです — ルーティングを実装する際に
実ドメインへ差し替えてください).

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
  表示しますが, `settings`/`documents`/`organizations`/`meetings`/`books` は階層に関わらず
  1階層目だけを日本語の表示名で表示します (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` に列挙—
  同様の性質を持つルートを新設したらここに追加). `/${currentUser.id}` (ユーザーのプロフィール
  ページ) も同様に1階層だけの特別扱いで, パス文字列ではなく `currentUser.name` を表示します.
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
`src/pages/UserProfilePage.tsx` (`/:userId`) がページの唯一の中身として,
`HeaderBottomPortal` (前述の「Header 固有の実装」を参照) 経由でグローバルヘッダー
(`Header.tsx`) 内部のスロットへ描画しています — アバターやユーザー名などのプロフィール情報は
表示しません. DOM 上でも実際に `<header>` の内側に含まれるため, `ProfileTabs.module.css`
の `.root` 自身は `background`/`border-bottom` を持たず (外側の `.header` が既に持っている
ため二重に線が出てしまう), `padding: 0 16px` (`Header.module.css` の `.top` と揃えた値)
だけを持ちます.

- `documentCount`/`bookmarkCount` prop (件数) が 0 または未指定の場合, 「文書」「栞」タブ
  自体を描画しません — 「概要」タブは常に表示されます. 件数はまだ実データが無いため,
  呼び出し側でダミーの数値を渡す想定です.
- 選択中のタブは `.selected::after` の絶対配置 (`--color-link`, 太さ2px) と
  `font-weight: 700` で強調し, それ以外はレギュラーのままにします. `.tab` 自身の
  `border-bottom` にしていないのは, ボタンの `margin: 6px 0` の分だけ線が
  ヘッダー下部の境界線より上に浮いて見えてしまうためで, `bottom: -6px`
  でボタンの margin の外側 = ヘッダー下部の境界線の位置まで伸ばすことで沿わせています.
  ホバー時は `menuItemBase` の行と同じ背景色 (`--color-header-button-hover`) のみで示し,
  独自の box-shadow などは使っていません.
  `role="tablist"`/`role="tab"`/`aria-selected` を持たせた素朴な ARIA Tabs パターンです (コンテナは
  `<nav>` ではなく `<div role="tablist">` — `<nav>` は landmark role のため `tablist` role
  と併用できません).
- 選択状態は内部の `useState` で完結しており, 実際のページ本文の切り替えとはまだ接続されていません
  (`onChange` prop はあるが `UserProfilePage` からは渡していません — 今のところタブを切り替えても
  「概要」の本文が表示され続けます). タブごとの本文を実装する際に接続してください.

`src/pages/UserProfilePage.tsx` (`/:userId`) は `useParams()` で取った `userId` が
`currentUser.id` と一致しない場合は「ユーザーが見つかりません」を表示します — 他ユーザーの実データが
無いための暫定挙動で, 同時に `/issues` のような (まだページの無い) 他機能の予約パスが誤って
プロフィールページとして表示されてしまうのも防いでいます (詳細は「プロジェクトについて」の
「現状できていないこと」を参照).

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
