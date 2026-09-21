# 組織の文書一覧 (`/orgs/:orgId/documents`)

> 索引: [`../README.md`](../README.md)

`src/features/organization/components/OrganizationDocumentsSection.tsx` は
`/orgs/:orgId/documents` ([`organization-profile.md`](organization-profile.md) 参照) の
本文です. GitHub のリポジトリ一覧ページ (検索バー + フィルターサイドバー + ページネーション
付きの一覧 Box) を参考にした構成で, `.root` を `display: grid;
grid-template-columns: 1fr auto 3fr;` として左をサイドバー, 中央を縦の `Divider`, 右をメイン
に1:3で分割しています (概要タブの `OrganizationOverviewSection` と同じ列比率・左右関係
ですが, 分割線を挟む点が異なります). **当初は左をメイン右をサイドバーとして実装していましたが,
依頼により左右を逆転しています** — `OrganizationDocumentsSection.tsx` の JSX 上も
`DocumentFilterSidebar` → `Divider` → `<main>` の順に変更済みです.

このページの構造は文書一覧に限らず, [`organization-book.md`](organization-book.md)/
[`organization-members.md`](organization-members.md)/[`organization-meetings.md`](organization-meetings.md)
の土台にもなっています — 「機能ごとに似た構成でも別コンポーネントとして持つ」という, 以降の
全ページで踏襲される方針がここで確立されています.

## 状態管理

**状態は `OrganizationDocumentsSection` 1箇所に集約**しています — `searchText`/`sortField`/
`sortDirection`/`page` の4つの `useState` をこのコンポーネントだけが持ち, 子コンポーネント
(`DocumentFilterSidebar`/`DocumentSearchBar`/`DocumentListBox`) はすべて値と `onChange`
系コールバックを受け取るだけの制御コンポーネントです. 見出し・検索欄・サイドバーの選択状態は
いずれもこの単一の `searchText` から導出しています (下記).

## `DocumentFilterSidebar`

`NavDrawer` などと同じ `menuItemBase.module.css` を土台にした, フィルター選択の役割を持つ
ボタンの縦リストです. フィルター自体 (「子組織: false」などのクエリ文字列によるドキュメントの
絞り込み) はまだ実装していないため, ボタンを押すと `DOCUMENT_FILTERS`
(`DocumentFilterSidebar.tsx` で export) の対応する `query` 文字列を検索欄にそのまま入れる
だけです — 一覧の中身は絞り込まれません. 選択中の判定は `filter.query === searchText`
の完全一致で行い, 一致するボタンにだけ `menuItemBase.active` (背景グレー) と
`CurrentContentBar` (左の青線) を付けます.

**`position: fixed` + `useFixedSidebarPosition`
(`src/features/organization/useFixedSidebarPosition.ts`) でスクロールしても画面上部を基準
として留まるようにしています** — 「文書･会計･会議･構成員のサイドバーはスクロールした際に
画面上部を基準として留まるようにしてほしい」という依頼のためで,
`TransactionFilterSidebar`/`MemberFilterSidebar`/`MeetingFilterSidebar` も同じフックを
使う同一の構造です. JSX は「グリッドのセル位置 (幅) だけを保持する空のプレースホルダー
`<div>` (`ref` を `useFixedSidebarPosition` に渡す) の中に, 実際の見た目を持つ `.root`
(中身は `position: fixed`, `top`/`left`/`width` はフックの戻り値を inline style で適用)
を入れる」という入れ子構造にしています.

- **`position: sticky` ではなく `position: fixed` にしている理由**: sticky には2つの構造的な
  弱点がありました — (1) 親 (CSS Grid, 既定は `align-items: stretch`) がこの要素の高さを
  メイン側の一覧と同じ高さまで引き伸ばしてしまうと, 要素の高さが最初からコンテナとほぼ同じ
  大きさになり `top: 0` に貼り付かずそのまま素通りしてしまう (`align-self: start`
  で打ち消せますが), (2) それでも一覧の末尾に近づくと, sticky の containing block
  (グリッドのセル, メイン側の内容量で高さが決まる) の下端をサイドバー自身が超えてしまい,
  上端が画面外へ押し出されて見えなくなる (会議一覧ではミニカレンダーの下端の位置もそれに
  伴ってずれる) — これは containing block の残り高さより sticky 要素自身の高さの方が
  大きくなる終盤で単純に押し出されてしまう, sticky 自体の弱点で `align-self`
  では解決できません. `position: fixed` はスクロール量にも祖先要素の高さにも一切影響
  されないため, この種の不具合が構造的に起こり得ません.
- **`useFixedSidebarPosition`** はプレースホルダーの `getBoundingClientRect()` から
  `left`/`width` をそのまま使い, `top` は **`Math.max(rect.top, SIDEBAR_TOP_GAP)`
  (`SIDEBAR_TOP_GAP = 24`)** です — 「サイドバーのボタンはサイドバー上部に配置された要素か
  window 上端のどちらか近い方から24pxの位置に配置してほしい」という依頼のため. ポイントは,
  **`rect.top` (プレースホルダー自身の, fixed 化する前の通常のフロー上での自然な位置)
  を直接使っている**ことです — プレースホルダーは実際の中身を持たない (`position: fixed`
  にしない) ため, 「今 fixed でなかったら本来どこにあるか」= 直前の要素の下端 + そのページの
  `padding-top`/`gap` をそのまま表します. 各ページの `.root` (または `OrganizationBookSection`
  の `.body`) は, サイドバーの直前に何が来るか (グローバルヘッダーだけの場合と, 会計タブの
  ように `TransactionSummaryBox`+`Divider` が追加で挟まる場合の両方) に関わらず**常に
  `padding-top: 24px` に揃えている**ため, `rect.top` は常に「直前の要素の下端 + 24px」
  と一致し, これを24px未満に縮めないよう `Math.max` でクランプするだけで, 個別の要素を
  ページごとに探して測る必要なく「直前の要素か window 上端のどちらか近い方から24px」
  がそのまま実現できます. スクロールすると `rect.top` は画面上端に近づいていく (viewport
  相対の座標が小さくなる) ため, `top` を追従させるには **`resize` に加えて `scroll`
  でも再計算しています** (`scroll` は1回の操作で連続して大量に発火するため,
  `requestAnimationFrame` で1フレームにつき最大1回の再計算になるよう間引いています).

## `DocumentSearchBar`

Header の検索ボタン (リンクのみで入力欄を持たない) とは別物の, 実際に入力できるテキスト
ボックスです. 文字が入っているときだけ `IconCircleXFilled` の clear ボタン
(`aria-label="検索文字列をクリア"`, クリックで `onChange("")`) を表示し, 右端に
`border-left` で区切った `surface0` 背景の検索ボタン (`IconSearch`, クリックしても何も
しません — フィルター自体が未実装のため) を配置しています. `IconSearch` は `size` を明示せず
`Icon` の既定値 (22px) のままにしています — 当初 `size={18}` を指定していましたが,
`IconButton` 内部のアイコン (同じく既定の22px) より小さく見えるという指摘を受けました.
実際に小さく見えていた原因は `size` の指定そのものではなく, `.searchButton` に `padding`
を明示していなかったために当時の `src/index.css` にあった `button { padding: 8px 16px; ... }`
(Vite テンプレート由来の残骸) が効いてしまい, `width: 40px` の `.searchButton` の中身が
実質8pxほどしか残らず, アイコンが `flex-shrink` で潰れていたことでした. この `button {}`
残骸自体は後述の「グローバル CSS のクリーンアップ」でサイト用のベースラインに置き換え済みですが,
`.searchButton` 側にも `padding: 0;` を明示したままにしています (他のボタンと同様, 自身の
見た目を自身の CSS Module 内で完結させる方針に揃えるため).

## 見出しの導出

`DOCUMENT_FILTERS.find((f) => f.query === searchText)` が見つかればそのフィルターの `label`
を, 見つからなければ (サイドバーのボタン以外から検索欄に任意の文字列を入力した場合を含む)
「全て」を見出しとして表示します — `DocumentFilterSidebar` の選択中判定と同じロジックを
ここでも独立して行っています (両方とも同じ `DOCUMENT_FILTERS`/`searchText` を参照するため,
サイドバーの選択状態と見出しは常に一致します).

## `DocumentSortDropdown`

`CreateButton`/`UserMenuButton` と同じ `useDismissablePopover` ベースのポップオーバーです.
現在の並び替え条件 (`DocumentSortField`: 最新編集日時/作成日/名称, `DocumentSortDirection`:
昇順/降順) に応じて `IconSortAscendingLetters`/`IconSortDescendingLetters` を出し分けます.
メニューでは3つの `DocumentSortField` だけを選べます — **同じ項目を選び直すと昇順/降順が
トグルし, 別の項目を選ぶとその項目の降順 (`DocumentSortDirection.Desc`) から始まります**
(最新順/新しい順を既定とするほうが自然だろうという判断で, 明示的な依頼ではありません).
トリガーの末尾には `IconCaretDownFilled` (`size={13}`) を付けています.

## `DocumentListBox`

一覧全体を包む枠線付きの Box です. 上部の `.toolbar` (`background: var(--color-secondary1)`)
に「n本の文書」(検索にマッチする件数. 太字) と `DocumentSortDropdown` を並べます. 各行は
`DocumentListRow` — 文書名 (太字)/概要/`IconFile` + ファイル種別を横並びにした, 行全体が
1つの `<Link to={`/orgs/${document.organizationId}/documents/${document.id}`}>` になっている
ボタンです. リンク先の文書詳細ページは実装済み (詳細は [`document-detail.md`](document-detail.md))
で, `MOCK_ORGANIZATION_DOCUMENTS` の `id` (`test-org-doc-N`) をそのまま使っているため実際に
遷移できます.

**`Pagination` はこの Box の内部ではなく, 呼び出し元 (`OrganizationDocumentsSection`)
が Box の外側 (上下) に配置します** — 当初は Box 内部の `.toolbar` 直下/一覧末尾に組み込んで
いましたが, 「Box の外に出してほしい」という依頼を受け, `DocumentListBox` からは
`Pagination` の import と `page`/`pageCount`/`onPageChange` props を削除し,
`OrganizationDocumentsSection` 側で `pageCount > 1` のときだけ `<Pagination>` を
`<DocumentSearchBar>` の下と `<DocumentListBox>` の下に直接並べる形にしています.

## 一覧のキーボード操作

「キーボードショートカットやコマンドなどでページを変化させた際に, リストが変化したことが
判るようにしてほしい」「リスト内の要素に Tab フォーカスした際, 矢印キーで上下にフォーカス
移動できるようにしてほしい」という依頼により, `DocumentListRow` を並べる内側の `<div>`
(`DocumentListBox.tsx`) 自体をプログラム的にフォーカス可能にしています — **`tabIndex={-1}`
なので Tab キーの通常の移動順には含まれません**. そのため Tab で辿り着くのは常に個々の行
(`DocumentListRow`, 実体は `<a>`, 本来からフォーカス可能) のほうで, 一覧自体へのフォーカスは
下記の「ページ切り替え時の自動フォーカス」など `.focus()` の明示的な呼び出し経由でのみ
起こります.

- **ページ切り替え時に一覧へ自動フォーカス**: `page` prop を前回値と比較する `useEffect` で,
  実際に値が変わったときだけ一覧に `.focus()` します (`biome` の `useExhaustiveDependencies`
  が「参照していない依存」を指摘するため, 単に `if (isFirstRender) return` で済ませず
  `previousPageRef` と比較する形にして `page` を実際にエフェクト内で参照するようにしています
  — 副作用として, 初回マウント時は前回値と同じなので自動的にフォーカスされません).
  フォーカスが当たると `:focus-visible` で青い枠 (`--color-focus`) が表示され, ページの
  内容が変わったことに気付けます.
- **`role="listbox"`**: 素の `<div>` に `tabIndex`/`onKeyDown` を付けるだけだと biome の
  `lint/a11y/noStaticElementInteractions`/`noNoninteractiveTabindex` に抵触するため, ARIA上
  「操作可能」に分類される役割が必要でした. `role="group"` はいずれも「非対話的」扱いで
  同じ指摘が残ったため, ウィジェット役割である `role="listbox"` にしています — 本来の
  listbox パターン (`role="option"` の子要素 + `aria-selected`) までは実装していません
  (行は実際のページ遷移リンクのままにしたい — `role="option"` にすると Vimium 等からの
  リンク認識に影響しかねないため) が, biome の a11y チェックを満たしつつ「フォーカス可能な
  グループ」を表現する現実的な妥協です.
- **矢印キーでの行移動**: 一覧の `onKeyDown` で, フォーカスが行 (`<a>`) 上にあるとき
  (`document.activeElement` が一覧内の `<a>` のいずれかと一致するとき) は ArrowUp/ArrowDown
  で前後の行へ `.focus()` します (先頭/末尾の行では `Math.min`/`Math.max` でそれ以上動かない
  ようにしています). **一覧自体 (行以外, つまり `role="listbox"` の `<div>` 自身) に
  フォーカスがある場合は, 下矢印で一番下の行, 上矢印で一番上の行へ直接ジャンプします**
  (`currentIndex === -1` の場合の分岐) — 一覧全体にフォーカスが当たった直後 (ページ切り替え
  時の自動フォーカスなど) から, 内容を一通り確認したい場合に応じて先頭/末尾どちらからでも
  すぐ辿れるようにという依頼によるものです. `DocumentListRow` (`.root`, 実体は `<a>`)
  にも `:focus-visible` (`outline: 2px solid var(--color-focus); outline-offset: -2px;`)
  を追加しています — 一覧全体の枠とは別に, 個々の行が現在フォーカスされていることも青枠で
  わかるようにするためです.

## `Pagination` (`src/components/ui/Pagination.tsx`)

文書一覧専用ではなく再利用可能な汎用コンポーネントとして `components/ui/` に置いています.
依頼文の例示 (`1 … 3 4 5 6 7 8 9 10 11 12 … 15`, 現在ページ8/全15ページ, 中央に常に10個の
数字) を元に当初 `WINDOW_SIZE = 10` として実装しましたが, 「前へ/次へをできるだけ中央の
数字に寄せたい (両端に固定するのではなく)」「中央に常に表示する数字を10個から5個に」という
依頼により, **`WINDOW_SIZE = 5`** に変更し, 前へ/次へも番号の並びに直接隣接させる (両端固定
はしない) 単一の `justify-content: center` な行に戻しています — 表示数を絞ったことで
ページ間の要素数の変動幅そのものが小さくなり, 中央寄せのままでも前へ/次への位置のずれが
目立ちにくくなります. `getPageItems` は現在ページの前後を `halfBefore = Math.ceil((WINDOW_SIZE
- 1) / 2)`/`halfAfter = Math.floor((WINDOW_SIZE - 1) / 2)` で (奇数の `WINDOW_SIZE`
でも前寄り優先で) 均等に割り振り, 中央の数字がちょうど `WINDOW_SIZE` 個になるようにしています
— 元の `WINDOW_SIZE = 10` の入力でも依頼文の例示と完全一致することを確認した上でのリファク
タリングです. 全ページ数が `WINDOW_SIZE + 2` 以下のときは省略記号を使わずすべての番号を
並べます.

**番号ボタン/前へ/次へはいずれも `<button>` ではなく `<a>` にしています** — 「Vimium などの
キーボード拡張の "]]"/"[[" (次/前ページへの移動) やリンクとして追従できるようにしてほしい」
という依頼のためで, Vimium/Tridactyl 等の "]]"/"[[" は `rel="next"`/`rel="prev"` を持つ
`<a>` を探して操作する仕様のため, 前へ/次へには `href="#prev"`/`href="#next"` と合わせて
`rel="prev"`/`rel="next"` を付けています (`<button>` のままだとこの仕組みから一切検出されず,
実際に Firefox 上の拡張で動作しないことが確認されたため `<a>` 化が必須でした). 番号ボタンは
`href={`#${item}`}` のみ (`rel` 属性は無し) で, どちらもクリック時は `event.preventDefault()`
で実際のハッシュ遷移 (URL 変化・スクロール) を打ち消した上で `onChange` だけを呼ぶため,
見た目・挙動は従来のボタンと変わりません (`<a>` は既定で `display: inline` のため, `.page`/
`.step` に `display: inline-flex` を明示しないと `width` 指定などが効かない点に注意. `<a>`
には `disabled` 属性が無いため, 前へ/次への無効化は `aria-disabled` + `.stepDisabled`
(`onClick` 内でも実際のページ変更を止めている) で表現しています).

数字ボタン (`key={item}`, 選択中は背景 `--color-link`/文字 `--color-background`, それ以外は
背景透過/文字 `--color-body-headline`) と省略記号 (`key={`ellipsis-${index}`}` — 単純な
`index` だけを key にすると, 同じ数値がページ番号ボタンの `key={item}` と衝突し React が
「重複した key」の警告を出して描画が不安定になることがあったため, 接頭辞で名前空間を分けて
います) は前へ/次へ (`IconChevronLeft`/`IconChevronRight`, 枠線無しの青文字リンク, 先頭/末尾
ページでは `aria-disabled="true"` + `--color-overlay1` + `cursor: not-allowed`) を挟みます.

**数字ボタンの幅は, ページ数全体の最大桁数 (`String(pageCount).length`, 常に描画される末尾
ページ番号を含む) に固定しています** — 元は `min-width: 2rem` のみだったため, 1桁のページ
番号は 2rem に収まる一方2桁のページ番号はそれより広がってしまい, 桁数の異なるページを跨いで
「次へ」を押すたびにボタン幅がわずかに変わって見える不具合になっていました. `maxDigits =
String(pageCount).length` を `Pagination.tsx` で計算し, `<nav>` に `style={{ "--page-digits":
maxDigits }}` として渡して `.page { width: calc(var(--page-digits, 1) * 1ch + 16px); }`
で全ての数字ボタンに同じ幅を適用しています (`font-variant-numeric: tabular-nums` も併せて
指定 — 等幅フォントではないため, これが無いと同じ桁数でも数字の種類によって `ch` 基準の
幅計算がわずかにずれ得ます).

## グローバル CSS のクリーンアップ

`DocumentSearchBar` の検索アイコンが潰れる不具合の調査で `src/index.css` に Vite テンプレート
由来の残骸 (`button { padding: 8px 16px; font-size: 1rem; cursor: pointer; }`/
`nav a { margin-right: 16px; }`) が見つかったため, 「テンプレート由来の設定は全て削除し,
このサイト用に適したものを使用してほしい」という依頼を受け, 削除した上で `button` セレクタ
だけこのサイトに適した最小限のベースライン (`padding: 0; border: none; background: none;
color: inherit; cursor: pointer; font: inherit;` — ブラウザ既定の見た目だけを打ち消し,
実際の色/余白は `controlBase`/`menuItemBase`/`tabBase` や各コンポーネント自身の CSS Module
に委ねる, という既存の方針をそのままグローバル側にも反映した内容) に置き換えました. `nav a`
側は, このアプリの `<nav>` 内のリンク/ボタンの間隔がすべて `gap` (flex/grid) で統一的に
確保されており, どこにも依存されていなかったため置き換えずに削除のみです. 変更後, ヘッダー/
`NavDrawer`/`ProfileTabs` など既存の全ボタンが (すべて自前で見た目を定義しているため)
見た目に変化が無いことを Playwright で確認済みです.

## `Divider` の `orientation` 拡張

メイン/サイドバー間の縦の区切り線のため, 元は横線専用だった `Divider`
(`src/components/ui/Divider.tsx`) に `orientation?: "horizontal" | "vertical"`
(既定 `"horizontal"`, 既存の呼び出し元は無変更で動作) を追加しました. `.vertical` は
`align-self: stretch; height: auto;` — 高さ0の `<hr>` でも, 親が flex/grid (既定で
`align-items: stretch`) であれば `align-self: stretch` だけで縦幅いっぱいまで伸びます
(`border-left` に切り替え, `margin` も `4px 0` → `0 4px` に転置).

## モックデータ

`MOCK_ORGANIZATION_DOCUMENTS` (`features/organization/mockData.ts`) はページネーションの
動作を実際に確認できるよう, 10種類の話題 (`DOCUMENT_TOPICS`) ×10種類の文書テンプレート
(`DOCUMENT_TITLE_TEMPLATES`) の組み合わせを機械的に繰り返して300件 (20件/ページ×15ページ)
生成しています. `type: OrganizationDocument` はフィルター (子組織/関与/管理権限など) が
まだ実装されていないため, それらに対応するフィールドは持たせていません.
