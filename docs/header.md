# Header 固有の実装

> 索引: [`docs/README.md`](README.md) / 関連: [`docs/ui-common-patterns.md`](ui-common-patterns.md)

`Header.tsx` (`<header className={styles.header}>`) は縦に2段の構造です. `.header` 自体は
`flex-direction: column` で, `background`/`border-bottom: 1px solid var(--color-border)`
もこの最上位の要素にだけ付けています — 下段 (後述の「下部ヘッダーのスロット」) があっても
なくても, ヘッダー全体が常に1つの区切られたブロックに見えるようにするためです.

1段目 (`.top`, 固定 `height: 60px`) が常時表示される行で, `.left` (ハンバーガー・ロゴ・
パンくず)/`.center` (検索, `flex: 1 1 auto` で残り幅いっぱいに広がりつつ
`justify-content: flex-end` で中身は右詰め)/`.right` (`margin-left: auto` で右詰め,
それ以外のアイコン群とアバター) の3つの `<div>` に分けた `display: flex` (CSS Grid
ではありません) の1行レイアウトです. `.top` 自体の `gap` と `.right` 内の `gap` は両方
`10px` に揃えています (検索ボタンが正方形に縮んだ際, 隣接ボタンとの隙間が食い違わないように
するため). 新しく横並びのセクションを追加する場合もこの3分割に沿ってください.

## 下部ヘッダーのスロット

2段目は `<div ref={setSlot} />` という中身の無い要素で, 「下部ヘッダーのスロット」
(`HeaderBottomSlotContext.tsx`/`HeaderBottomPortal.tsx`) です. `ProfileTabs` のように
ページ固有の内容をヘッダーの一部として (実際に `<header>` の内部の DOM として) 表示したい
場合に使います. `AppLayout.tsx` 上で `Header` と `<Outlet />` は兄弟要素のため, props
で直接渡すことができません — `AppLayout` を `HeaderBottomSlotProvider` で包み, `Header`
がスロットの `<div>` の ref を `setSlot` として Context に公開し, ページ側
(`<Outlet />` の中身) が `HeaderBottomPortal` (`createPortal`) でその DOM ノードへ描画する,
という構成です (`ThemeContext.tsx` と同様, Provider コンポーネントとフックだけを export し,
生の Context オブジェクトはファイル内に閉じています). スロットが空の `<div>` は高さ 0
に潰れるだけなので, 何も描画しないページでは単純な1行ヘッダーに戻ります. このスロットは
Header 自身がどのページの, どんな内容かを一切知らない汎用の差し込み口です — `Header.tsx`
(`components/layout/`, ドメインを知らない汎用部品) が `ProfileTabs` (`features/user/`,
ドメイン固有) を import しないで済むのはこの設計のためです.

各詳細ページ (会計処理/会議/文書) のタブは, `OrganizationLayout` が既にこのスロットを
`OrganizationTabs` で使っているため, スロットではなく本文側に描画しています —
詳細は [`docs/pages/transaction-detail.md`](pages/transaction-detail.md) を参照してください.

## パンくず (`Breadcrumb.tsx`)

`getBreadcrumb(pathname)` (`getBreadcrumb.ts`) が現在パスを `string[]` (各要素が1階層分の
表示名) に変換し, `Breadcrumb` が `" / "` で結合して**配列の最後の要素だけ** `.current`
(`font-weight: 700`) でボールド表示します. 既定では2階層まで表示しますが,
`settings`/`documents`/`materials`/`orgs`/`meetings`/`book` は階層に関わらず1階層目だけを
日本語の表示名で表示します (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` に列挙 — 同様の性質を
持つルートを新設したらここに追加). `/users/${userId}` (ユーザーのプロフィールページ) も
同様に1階層だけの特別扱いですが, `SPECIAL_ROOT_LABELS` とは別ロジックです — `userId` が
`currentUser.id` と一致すればパス文字列ではなく `currentUser.name` を, 一致しなければ
(実データが無いためどのみち「ユーザーが見つかりません」になりますが) `userId` をそのまま
表示します.

`issues`/`pulls`/`notifications` も同様に追加済みで, それぞれ「指摘事項」「修正提案」「通知」
です — `issues`/`pulls` は他の特殊パスと違い, パンくずだけでなく `PrimaryNavLinks`/
`NavDrawer` のラベル (ヘッダーのツールチップ/ドロワーの表示文言) もこの表記に揃えるよう
ユーザーから指定されたため, そちらも変更済みです (`CreateButton` の「文書を作成」等は動詞句の
ため対象外としています — NavDrawer/PrimaryNavLinks が「〜一覧」のような名詞句なのに対し,
`CreateButton` は「これから新しく作る操作」を表す動詞句のまま, という区別は「メニュードロワー
の文言について」の依頼で NavDrawer 側だけ「一覧」を付けた際もそのまま踏襲しています — 当初
この例として挙げていた「改善点を指摘」(`/issues/new`) は, 後の依頼により削除し, ドロップダウン
最下部の分割線+「サイトの問題点を指摘」(`CreateButton` 内, リンク無しの動作未実装ボタン.
`NavDrawer` の「問題を報告」と同じ `IconMessageReport` を使用) に置き換えています).
`logout` はユーザー確認の結果, 専用画面になる想定のため意図的に `SPECIAL_ROOT_LABELS`
へ追加していません — 抜けているわけではないので, 新たに追加しないよう注意してください.

`/` (ホーム) は `segments.length === 0` のフォールバックとして `["ホーム"]` を返します —
詳細は [`docs/pages/home.md`](pages/home.md) を参照. `/orgs/new` は `second !== "new"`
の条件で組織 ID としての名前解決対象から除外しています — 詳細は
[`docs/pages/new-organization.md`](pages/new-organization.md) を参照.

`NotFoundPage` (404) が表示されている場合のパンくずの挙動 (未登録パスは空にする) は
[`docs/pages/not-found.md`](pages/not-found.md) を参照してください.

## レスポンシブな折り畳み (`useHeaderResponsiveLayout.ts`)

`breadcrumbRef`/`searchWrapperRef`/`rightRef` の位置を `useEffect` (初回計測 + `resize`
イベント, `pathname` が変わったら再計測) で測り, 2段階のブレークポイントを判定します.

- パンくず左端 〜 検索ボタン右端が 500px を切ったら `searchCollapsed` — `IconButton` から
  `text`/`stretch` を外し, 通常の正方形アイコンボタンに切り替えます.
- パンくず左端 〜 `.right` 右端 (`UserMenuButton` を含む) が 640px を切ったら `navCollapsed`
  — `PrimaryNavLinks` (「作成」「全ての通知」「アバター」以外の主要ナビアイコン) をまるごと
  描画から外します. `.right` は `margin-left: auto` で常にヘッダー右端に張り付いているため,
  中身をどれだけ隠しても右端の座標は変わりません — そのため `navCollapsed` の判定結果が
  自分自身の計測対象に影響するフィードバックループにはなりません. 新しく `.right` 内の
  アイコンを非表示にする条件を追加する場合もこの性質を崩さないでください.
- `.center` に `min-width: 0` を付けると, 検索ボタンがゼロ幅まで潰れて `.right` と重なって
  見える不具合になるため付けていません — `IconButton` 自体が `min-width: var(--control-size)`
  を持つので, `.center` はその最小幅を自然に尊重させる必要があります.

検索ボタンの横幅上限は `IconButton.module.css` の `.stretch` で
`max-width: calc(var(--control-size) * 4)` (140px) としています. `.center` 自体には
max-width を付けていません — 以前は `max-width: 720px` を付けていましたが, ウィンドウ幅が
それを超えると `.center` の伸長がそこで頭打ちになり, 余った幅は `.right` の
`margin-left: auto` に吸われて `.center`/`.right` の間に隙間ができ, 検索バーが画面中央
付近に取り残されて見える不具合になっていました. 検索ボタン自身が `.stretch` の 140px で
頭打ちになるため, `.center` 側で重ねて上限を設ける必要はありません.
