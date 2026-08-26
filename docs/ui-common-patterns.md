# UI コンポーネントの共通パターン

> 索引: [`docs/README.md`](README.md)

似た見た目・挙動のコントロールは土台となる CSS Module (`○○Base.module.css`) を共有し,
各コンポーネント自身の `Foo.module.css` にはタグ固有のリセットだけを書く構成にしています.
新しい部品を追加する際はまずこれらのパターンに当てはまらないか検討してください.

## 正方形アイコン系: `controlBase.module.css`

`IconButton`/`IconLink` が使う土台. サイズ・角丸・配色・hover/focus/active・CSS のみの
ホバー時ツールチップを持ちます. 使う側は `clsx(base.root, styles.root, className)` のように
両方のクラスを合成してください.

- **サイズ**: `--control-size` (既定 35px) を高さ・最小幅の両方に使い, 2箇所のハードコードが
  食い違うのを防いでいます. `width: fit-content` は CSS Grid の子要素になったときに既定の
  `justify-items: stretch` で正方形が崩れるのを防ぐためです — 中身が `--control-size` より
  小さければ正方形, 広ければ (ラベルや `dropdown` の追加アイコンなどで) その分だけ横に
  広がります.
- **`dropdown?: boolean`** — `icon` の右隣に `IconCaretDownFilled` (`size={13}`) を並べます.
  開閉の実際の挙動は持たず, 呼び出し側が `onClick` で実装します. 2つのアイコンの合計幅が
  `--control-size` 相当に達し単一アイコン時のようなクリアランスが自然には生まれないため,
  `.dropdown` 修飾クラスで `padding-inline: 5.5px` (6.5px の見た目のクリアランスから border 1px
  を差し引いた値) を明示的に補っています.
- **`text?: string`** — アイコンの右隣に可視のラベルテキストを表示します (例: Header の検索
  ボタン `<IconButton icon={IconSearch} label="検索" text="検索…" stretch />`). `text` がある
  場合は `aria-label` を付けません (可視テキストがアクセシブルネームを兼ねるため) — 結果として
  CSS ツールチップ (`[aria-label]` 依存) も自動的に出なくなります.
- **`stretch?: boolean`** — `controlBase` の正方形・中央寄せを上書きし, `width: 100%`・
  `justify-content: flex-start` の横幅いっぱい・左揃えにします (`.stretch`).
- **`hideTooltip?: boolean`** — CSS ツールチップを非表示にします (`aria-label` 自体は残るので
  アクセシビリティは維持). ボタン直下 (`top: 100%`) に別のポップオーバーを開く場合, クリック
  時点でボタンに `:hover` が乗ったままなのでツールチップとポップオーバーが重なって表示されて
  しまいます — ポップオーバーの `open` state をそのまま `hideTooltip={open}` として渡して
  防いでください (`CreateButton`/`MenuButton` が実例).
- **ツールチップの位置**: 既定は `left: 50%; transform: translateX(-50%)` の中央寄せですが,
  画面端に近いと見切れます. `useTooltipAlign` (`src/components/ui/useTooltipAlign.ts`,
  `label` の文字数からツールチップ幅を概算し, hover/focus 時に `getBoundingClientRect()` で
  画面端との距離を判定 — 疑似要素は直接計測できないため文字数ベースの概算です) が返す
  `ref`/`align`/`onMouseEnter`/`onFocus` をトリガー要素にそのまま渡し, `align` を
  `data-tooltip-align` 属性として設定してください. `controlBase` 側は
  `.root[data-tooltip-align="left"|"right"]::after` で中央寄せを上書きします.
  **戻り値をオブジェクトのまま JSX に展開する (`ref={tooltip.ref}` のようにプロパティ
  アクセスする) と `eslint-plugin-react-hooks` の `react-hooks/refs` が誤検知するため,
  必ず分割代入してから個別に渡してください.** `controlBase` を使わない独自のツールチップ
  (`.homeLink` など) を実装する場合も同じフックと `data-tooltip-align` の仕組みを流用して
  ください.
- **ツールチップの背景色** (`--color-hover-background`, `theme.css` で Catppuccin `overlay2`
  を指す) はツールチップ専用のトークンです — `controlBase.module.css` と
  `Header.module.css` の `.homeLink` の2箇所以外からは参照されていません.

`src/components/ui/Icon.tsx` は `@tabler/icons-react` のアイコンをラップしますが,
`icon`/`size` 以外の props (`aria-hidden` など) はそのまま `<svg>` へ転送されます.
ボタン/リンク側に `aria-label` があるような装飾目的のアイコンには `aria-hidden="true"`
を渡してください.

`IconLink` の `icon` prop は `TablerIcon` 専用です. `Emblem` (`fth-oasis-icon` など,
git LFS 管理の自前 SVG スプライト) のように `TablerIcon` でない中身をリンクにしたい場合は
`IconLink`/`controlBase` を使わず, 同じ見た目のツールチップだけを個別に実装します —
Header のロゴ (`.homeLink`) が実例です. `Emblem` に `label` を渡さなければ自動的に
`aria-hidden` になるので, リンク側の `aria-label` と二重に持たせる必要はありません.
`.homeLink` の `color` は他のヘッダー要素と違い `--color-header-logo` (Catppuccin `text`)
を使っています — `Emblem` の SVG は `fill="currentColor"` なので, この `color`
がそのままアイコンの塗り色になります.

## 横並びリスト行系: `menuItemBase.module.css`

`NavDrawer`/`CreateButton`/`UserMenuButton`/`DocumentFilterSidebar` の中の各行が使う,
`controlBase` とは別系統の土台です. 正方形ではなく横幅 100%・中身は左揃え・ボーダーは
通常時もhover時も常に非表示 (hoverは背景色の変化のみ) です. `.root` には
`box-sizing: border-box` を明示しています (`<a>`/`<Link>` は既定で `content-box` のため,
これがないと `width: 100%` に `padding` が上乗せしてはみ出します). `font-size` は `.root`
自体には持たせず `font: inherit` のままにしています — `NavDrawer.module.css` の `.drawer`/
`DocumentFilterSidebar.module.css` の `.root` (呼び出し側のコンテナ) で `font-size: 0.9rem`
(ヘッダーのパンくず, `Breadcrumb.module.css` と同じ値) を指定し, カスケードで反映させる形に
しています — `CreateButton`/`UserMenuButton` のメニューなど, この指定をしていない呼び出し元
は引き続き既定サイズ (1rem) のままです (「サイドバーとメニュードロワーの文字サイズをパンくずと
揃えてほしい」という依頼が対象を明示していたため, 共有する `menuItemBase.root` 自体を変更せず,
対象の呼び出し元だけスコープする形にしています).

`MenuLink` (`src/components/ui/MenuLink.tsx`) はこの土台の上にアイコン+可視ラベルを乗せた
リンクです. `to` が `/^https?:\/\//` にマッチすれば `<a href>` (外部リンク), それ以外は
`react-router` の `<NavLink to={...} end>` として描画します — `<Link>` ではなく `<NavLink>`
なのは, 現在のパスと `to` が一致する項目を強調するためです. `end` を付けているのは, 付けないと
`to="/"` が常にどのパスでも一致してしまう (NavLink は既定でプレフィックス一致) ためで,
現状ネストしたサブページが無いこととも合わせ, 完全一致で揃えています. 一致する項目には `.active`
(menuItemBase 側で定義. 背景は hover と同じ, 文字は太字+`--color-header-body-em`
(Catppuccin `text`) — 元は背景のみで区別していましたが, 「選択中の項目の文字を太字に,
text色にしてほしい」という依頼で追加しました. `DocumentFilterSidebar`/`DocumentSortDropdown`
も同じ `menuItemBase.active` を使うため, 併せて同じ見た目になります) を付けつつ, `NavLink`
の children-as-function (`{({ isActive }) => ...}`) で `isActive` が真の場合のみ
`CurrentContentBar` (後述) を差し込みます. 外部リンク (`<a href>`) 側は URL がそもそも現在の
パスと一致し得ないため対象外です. `onClick?: () => void` は任意で, ポップオーバー/ドロワーを
閉じる目的で使います.

`CurrentContentBar` (`src/components/ui/CurrentContentBar.tsx`) は「現在選択中/表示中」を
示す, 両端が丸い太さ3pxの青線 (`--color-current-content-bar`) だけを持つ汎用部品です.
`position: absolute; top: 0; bottom: 0;` の独立した `<span>` として重ねる作りで,
`box-shadow: inset` を使わないのは, 親要素の `border-radius` に沿って角が丸まってしまうのを
避けるためです — `menuItemBase.root` (`border-radius: 8px`) の上に乗せてもバー自身の
`border-radius: 999px` だけで丸まり, ボタンの角には影響されません. 使う側は親要素に
`position: relative` を指定した上で配置してください (`menuItemBase.root` は既に指定済み).
`left: -6px` は `menuItemBase.root` の `margin: 0 6px` (バーがボタンと重ならず数px離れて
収まるよう, 左右に用意した隙間) を前提にした値です — 別の場所で使う際, 親要素の左右の余白が
6px 分無い場合はこの値も調整してください. 現状 `MenuLink` の `.active` でのみ使っていますが,
名前の通りリスト行など他の「現在選択中」を示したい箇所でも流用できる想定です.

`icon`+`label` の定型に収まらない行 (`NavDrawer` の「問題を報告」ボタン, `UserMenuButton`
のプロフィール行) は `MenuLink` を使わず `menuItemBase.root` を直接 `<button>`/`<Link>`
に適用して個別実装しています.

### `NavDrawer` 内のリンクの経緯

`NavDrawer` 内の「規則･資料」(`/materials`)/「組織一覧」(`/orgs`, 元は「組織」— 「メニュー
ドロワーの文言について」の依頼で NavDrawer 内のラベルだけ「〜一覧」を付ける形に統一した際に
変更. 詳細は [`docs/pages/orgs-list.md`](pages/orgs-list.md)) は, 以前は実際のドメインが
未確定のため `https://<subdomain>.io/{documents,organizations}` という外部URLのプレース
ホルダーでしたが, 内部ルーティングへ差し替え済みです. どちらも実装済みです (「規則･資料」の
詳細は [`docs/pages/materials.md`](pages/materials.md)). 「規則･資料」は「文書」
(`/documents`, `PrimaryNavLinks` の「全ての文書」/`CreateButton` の「文書を作成」が指す,
組織が作成する文書の機能) とは別物である点に注意してください — 当初 `getBreadcrumb.ts`
の `documents` に「規則・資料」を割り当てていましたが, これは「規則･資料」がまだ外部URL
だった頃の名残りで, 実際には「文書」の方を指すべき値だったための誤りでした. 現在は
`documents: "文書"`/`materials: "規則・資料"`/`orgs: "組織"` (`/orgs/:orgId` の判定より後に
評価されるため, `/orgs` 単体のときだけ使われます) とそれぞれ独立させています.

「"印刷状況"/"新館予約状況"/"備品貸出状況" の項目をメニュードロワーの "会議一覧" と "規則･資料"
の間に, 分割線で上下を区切って挿入してほしい」という依頼により, `NavDrawer` の「会議一覧」と
(既存の) 区切り線+「規則･資料」の間に, もう1本区切り線を追加してこの3項目を挟んでいます.
リンク先の URL は, 印刷/備品貸出の2つは「適切な名前」という依頼から
`/print-queue`/`/equipment-loans` と推測しましたが, 新館予約だけは後から
「`~/room-reservations` にしてほしい」と明示的な指定を受けています (当初は同様に推測して
`/new-building-reservations` としていましたが変更). それぞれ `CreateButton` の「印刷を依頼」/
「新館の使用を申請」/「備品貸出を申請」の状況確認ページに相当する想定で, アイコンも対応する
`CreateButton` の項目と同じもの (`IconPrinter`/`IconBuildingEstate`/`IconPackage`) を
再利用しています. **3つとも実ページを実装済みです** (詳細は
[`docs/pages/print-queue.md`](pages/print-queue.md),
[`docs/pages/room-reservations.md`](pages/room-reservations.md),
[`docs/pages/equipment-loans.md`](pages/equipment-loans.md)). `getBreadcrumb.ts` の
`SPECIAL_ROOT_LABELS` には他の未実装スタブ (`settings` など) と同様に
`print-queue`/`room-reservations`/`equipment-loans` も含め追加済みのため, 実ページ実装後
もこの登録自体は変更していません (実ページの表示にもそのままパンくずとして使われます).

**「メニュードロワーの最下部に分割線を入れ, その下に "組織名/文書名" として直近で編集した文書を
画面に収まる限り入れてほしい」という依頼**により, 「組織一覧」の下に `Divider` を挟んで,
`getDocumentsEditedByCurrentUser` ([`docs/pages/home.md`](pages/home.md) の
`MY_EDITED_DOCUMENTS` と同じ関数, `features/organization/mockData.ts` で共有) の結果を
並べています. `.recentDocuments` (`flex: 1 1 auto; min-height: 0; overflow: hidden;`)
が `.drawer` 自体のスクロール (`overflow: hidden auto`) とは別に, この一覧だけを画面に
入りきる分だけ表示してクリップします (「問題を報告」ボタンを最下部に押し出す役割も兼ねます).
各行は `MenuLink` ではなく `menuItemBase.root` を直接 `<Link>` に適用した独自実装で, 先頭の
アイコンは文書の組織アバター (`Avater shape="square" size={20}`, 当初は `IconFileText`
でしたが「アイコン部分を組織のアバターに変更してほしい」という依頼で差し替え), ラベルは
「組織名/文書名」を `overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
min-width: 0;` (「折り返しを無効化してはみ出した部分は3点リーダで見切れていることを示して
ほしい」という依頼のため) で1行に収め, `title` 属性 (見切れた文言をホバーで全体表示. 詳細は
[`docs/user-name-link.md`](user-name-link.md)) で全体を見せます.

## タブバー系: `tabBase.module.css`

`ProfileTabs`/`OrganizationTabs` が使う, ヘッダー下部に隙間なく続けて表示するタブバー共通の
見た目です ([`docs/header.md`](header.md) の「下部ヘッダーのスロット」を参照). `.root`
(`padding: 0 16px` の横並び) / `.tab` (選択中以外は `--color-header-body-em` =
Catppuccin `text`. 以前は `--color-header-body` = `overlay2` でしたが, 選択中/非選択中を
色ではなく太字+下線だけで区別するよう変更しました. `font-size` はヘッダーのパンくず
(`Breadcrumb.module.css`) と同じ `0.9rem` にしています — 「ヘッダーのタブテキストのサイズを
パンくずと揃えてほしい, 文字色はそのまま」という依頼のため, `color` はそのまま変更していません)
/ `.selected` (`::after` の絶対配置による下線. `CurrentContentBar` と同様, 親の
`border-radius` を気にせず独立させるための構造) / `.count` (件数バッジ, 背景は
`--color-background`) を提供します. タグ非依存 (`class` のみで完結) なので, `ProfileTabs`
(状態切り替えの `<button>`) と `OrganizationTabs` (実際にルーティングする `<NavLink>`)
のどちらからも同じクラスをそのまま使えます — 新しいタブバーを追加する際もこの土台を使って
ください.

`Label` (`src/components/ui/Label.tsx`) は背景透過+`--borderWidth-thin`のボーダーの丸い
タグです. 元は `DocumentCard` の公開/非公開ラベル専用の CSS でしたが, `OrganizationHeaderBox`
の組織種別ラベルでも同じ見た目が必要になったため汎用部品として切り出しました. 種類を示す短い
ラベル全般 (状態, カテゴリなど) に使う想定です. 既定は色を持たず `--color-body-subtext`
のままですが, `color?: "sky" | "mauve" | "green" | "peach" | "red"` prop で Catppuccin の
アクセントカラー (`--color-label-*`, `theme.css` に追加) に切り替えられます —
`MeetingListRow`/`MeetingCalendarCard` の延会 (mauve)/流会 (sky) ラベル, `EquipmentListRow`
(備品貸出状況ページ) の貸出可 (green)/貸出中 (red, 実際に赤系のラベルが必要になった際に追加)
で使用. 新しい色が必要になったら, 既存の `--ctp-*` パレット (`theme.css` の `:root` に全色
定義済み) から同様に `--color-label-*` を追加してください.

## ポップオーバー/ドロップダウンの共通パターン

`CreateButton` (GitHub ヘッダーの New ボタンを参考にしたドロップダウン) と `UserMenuButton`
(アバターのメニュー) はどちらもこの型です:

- 開閉状態・範囲外クリック/Escape での自動クローズは `useDismissablePopover<T>()`
  (`src/components/ui/useDismissablePopover.ts`) にまとめてあります. `{ open, wrapperRef,
  toggle, close }` を返すので, `wrapperRef` をトリガーとパネルの両方を包む
  `position: relative` な `<div>` に付けてください. 内部で `useEscapeKey`
  (`src/components/ui/useEscapeKey.ts`, `NavDrawer` のEscape処理とも共用) を使っています.
- パネル自体は `position: absolute; top: calc(100% + 4px);` でトリガーの下に開き, 枠線・角丸・
  box-shadow を持つ独立したカードとして表示します (`CreateButton.module.css`/
  `UserMenuButton.module.css` の `.menu` が実例). 横位置はトリガーの位置に応じて `left: 0`
  (`CreateButton`, 画面中央寄り) か `right: 0` (`UserMenuButton`, 画面右端寄り) を使い分けて
  います — 画面端でのはみ出し検知は (`useTooltipAlign` のような) 未実装です.
- 中身の各行は `menuItemBase.module.css` (`MenuLink`, または独自の `<button>`) を使い,
  区切りが要る場合は `Divider` を挟みます. `CreateButton` の「会計申請を作成」のように, まだ
  対応するルートが無い項目は `MenuLink` ではなく素の `<button onClick={close}>` にしています.
- トリガーが `IconButton` の場合は `hideTooltip={open}` を渡してください
  (「正方形アイコン系」参照).
- `UserMenuButton` のプロフィール行 (`.userName`/`.userEmail`) は `white-space: nowrap`
  にしています — `.menu` は `min-width: 240px` (最小値のみで `width`/`max-width` は指定して
  いない) なので, 折り返しさえ起きなければ内容が長いときにパネル自体が自然に (block/flex の
  shrink-to-fit で) 広がります. 折り返しを許すと, 長いメールアドレスなどが `min-width`
  の範囲内で複数行に割れてしまうため, 折り返さずパネルの幅で吸収する方針にしています.

**フォーム内のドロップダウン選択欄** (`OrganizationSelectField`/`BudgetLineItemSelectField`,
いずれも `features/organization/components/`. 詳細は
[`docs/pages/new-transaction.md`](pages/new-transaction.md)) も同じ `useDismissablePopover`
+ `menuItemBase` の構成の亜種です — トリガーが `IconButton`/`MenuLink` ではなく,
`requestFormBase.module.css` の `.input` と同じ見た目 (枠線+角丸+背景) のボタンである点が
異なります. この見た目は `src/components/ui/selectFieldBase.module.css` (`.wrapper`/
`.trigger`/`.triggerContent`/`.triggerLabel`/`.menu`/`.group`/`.groupLabel`) に共有の土台
として切り出してあります.

> **フォームにドロップダウンを追加する際は, ネイティブ `<select>` ではなく今後もまず
> このパターンを検討してください.** グループ分け (所管→組織など, ネイティブ `<optgroup>`
> 相当) が要る場合は `.group`/`.groupLabel` を使い, グループ見出し自体はクリックできない
> non-interactive な行にしてください (`BudgetLineItemSelectField` が実例).

`NavDrawer` (`open`/`onClose` を外部から制御される, 左からスライドインする全画面ドロワー)
は上記と構造が違うため同じフックは使いませんが, Escape 処理だけ `useEscapeKey(open, onClose)`
で共通化しています. 外側クリックの代わりに全画面のオーバーレイ `<button>`
(`tabIndex={-1} aria-hidden="true"`, クリックで `onClose`) を使っています.

`NavDrawer` の先頭には `drawerHeader` (左に `<Emblem name="fth-oasis-icon" />`, 右に閉じる
ボタン) があります. 閉じるボタンは正方形の1箇所だけの利用のため `menuItemBase` は流用せず
`NavDrawer.module.css` 内に単独で定義しています. `.drawer` は `overflow: hidden auto;`
(x=hidden, y=auto を明示するショートハンド) としています — 片方の軸だけ `visible` 以外にすると
CSS の仕様上もう片方も暗黙的に `auto` 扱いになり, わずかなはみ出しでも横スクロールバーが
出てしまうため, 横スクロールを一切許可しないコンテナでは両軸を明示してください. `.drawer`
は左端が画面外にスライドして隠れるため, `border-radius: 0 8px 8px 0;` で右側の角だけを
丸めています (`8px` は他のパネル/ボタン類と揃えた値です).

## 汎用部品リファレンス

- **`UserNameLink`/`OrgNameLink`** (ユーザー名/組織名をプロフィールページへリンク化する部品) —
  詳細は [`docs/user-name-link.md`](user-name-link.md).
- **`Pagination`** (`src/components/ui/Pagination.tsx`) — 一覧共通のページネーション部品.
  詳細は [`docs/pages/organization-documents.md`](pages/organization-documents.md).
- **`Button`** (`src/components/ui/Button.tsx`) — 塗りつぶしの主要アクションボタン. 詳細は
  [`docs/pages/new-document.md`](pages/new-document.md).
- **`Divider`** の `orientation` (横線/縦線) — 詳細は
  [`docs/pages/organization-documents.md`](pages/organization-documents.md).
- **`MarkdownDocument`/`MarkdownFileViewer`** (Markdown の GitHub 風プレビュー) — 詳細は
  [`docs/markdown-viewer.md`](markdown-viewer.md).
