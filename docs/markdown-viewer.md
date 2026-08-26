# Markdown ドキュメントのプレビュー (`MarkdownDocument`/`MarkdownFileViewer`)

> 索引: [`README.md`](README.md)

会議詳細ページの資料タブ (Markdown 種別)/議事録タブの両方で共有している, Markdown
ファイルの GitHub 風プレビュー機構です. 「議事録のmdファイルを GitHubのようにレンダリングして
表示してほしい, レンダリングは他にmdファイルを表示する場所でも行ってほしい」という依頼のため,
特定のページに紐付けず `features/organization/` 直下の汎用ロジック (`minutesMarkdown.ts`)
+ 2つのコンポーネントとして切り出しています.

## パーサーは自前実装 (`minutesMarkdown.ts`)

`react-markdown`/`marked` や `js-yaml` のような Markdown/YAML ライブラリは追加していません
— 依頼で共有された議事録の書式 (frontmatter の `speakers`/`attendees` などの項目, 本文側の
`@id [HH:MM]`/`@id: 発言`/`- [決定]`/`- [宿題]` といった独自記法) は標準の Markdown/YAML
の範囲を超えており, 汎用ライブラリを導入してもこれらは結局自前でパースする必要があること,
かつこのアプリの Markdown コンテンツはすべて自分たちが生成するダミーデータ (任意の外部入力を
安全に扱う必要が無い) であることから, 依存を増やさず必要な範囲だけを実装する方針にしています.

- **frontmatter**: `extractFrontmatter`/`parseFrontmatterYaml` が `---` で挟まれたブロック
  を解析します. 汎用 YAML ではなく, このアプリの議事録が実際に使う形 (トップレベルの
  `key: value`, `"..."` によるクォート文字列, `true`/`false`, `[a, b]` のインライン配列,
  `speakers:` の直後だけ2段インデントの `id: { name: ..., role: ... }` というインライン
  マップ) に絞った簡易パーサーです. `# コメント` (行末の `" #"` 以降) も取り除きます.
- **本文**: `parseBlocks`/`parseBlock` が空行区切りのチャンクごとに見出し
  (`#`〜`######`)/箇条書き (`- ...`, `- [決定]`/`- [宿題]` ならタグ付き)/引用 (`> ...`)/
  発言者の発言 (`@id [HH:MM]` 単独行+続く段落 = `speakerTurn`, `@id: 発言` の1行 =
  `speakerInline`)/それ以外は通常の段落, に分類します. **frontmatter/独自記法が無い一般的な
  Markdown 資料 (資料タブの他のダミーコンテンツなど) も同じパーサーを通ります** —
  該当するパターンに一致しないだけで, 見出し/段落/箇条書き/引用としては自然に解釈されるため,
  議事録専用ロジックとは別にもう1つパーサーを用意する必要はありませんでした.

## 描画 (`MarkdownDocument.tsx`)

`frontmatter` があれば `FrontmatterHeader` を描画し, 無ければスキップします.

**タイポグラフィ (行間/文字サイズ/余白) は GitHub の markdown-body 相当の値に揃えています**
— 「見た目を全てgithubのそれに合わせてほしい」という依頼のため, 基準 `line-height: 1.5`,
見出しごとのサイズ (h1: 2em〜h6: 0.85em) + `font-weight: 600` + margin (24px 0 16px)
+ h1/h2 だけ `border-bottom`, リストは (独自の "・" ではなく) 実際の `list-style: disc`,
blockquote は左ボーダー+灰色文字, インラインコードは背景+角丸+85%サイズ, という具合に
GitHub の実際の値に合わせています (色のみ本アプリのテーマトークンに置き換え, 明暗両対応).
`.body`/`.frontmatter` は (以前の `flex + gap` ではなく) 各要素自身の margin で間隔を作る
素の block flow にしています — GitHub 自身がこの方式のため, 見出しと段落の margin の相殺
のされ方まで含めて忠実になります.

**`FrontmatterHeader` は「開催場所や出席者, 文書の種別についてもバッジではなく箇条書きで
示してほしい」という依頼により, `Label`/チップをやめて1つの `<ul>` (`.metaList`)
にまとめています** (日時/開催場所/議長/記録/出席者/欠席者/種別 (逐語録・要約録) を箇条書きの
各行として列挙. 議長/記録は `speakers` から解決した名前のみ表示). **「公開範囲はメタデータに
記載しないでほしい」という依頼により, frontmatter の `visibility` はパース自体はしますが
`FrontmatterHeader` では描画していません.**

本文ブロックは見出し/段落/引用/箇条書き/発言者の発言として描画します — **「本文内には"決定"
のようなラベルを表示しないでほしい」という依頼により, `[決定]`/`[宿題]` はもう `Label`
(バッジ) にせず, `[決定] 本文...` のように生の角括弧付きテキストとしてそのまま表示しています**
(`Label` の green/peach バリアント自体は `components/ui/Label.tsx`/`theme.css` に残して
いますが, 現状この用途では使っていません — 他の用途で必要になれば再利用できます).
**「発言時刻･委員の立場については本文中に記載せず, 名前だけを記載してほしい」という依頼に
より, `speakerTurn`/`speakerInline` はどちらも `block.time`/`speaker.role` を参照せず,
解決した名前だけを表示しています** (パーサー自体は引き続き time/role を解析します —
描画側だけが参照をやめています). **本文中の `@id` (発言者の発言以外の, 段落/リスト項目内
に登場するものも含む) は `renderInline` が正規表現でトークン化し, frontmatter の
`speakers` に一致すれば名前に置き換えます** (一致しなければ `@id` のままフォールバック表示)
— `[宿題] @sato ...` の `@sato` もこの仕組みで解決されます. `renderInline` は
`**太字**`/`` `コード` `` も併せてサポートしています (依頼の例には無い記法ですが, 「GitHub
のように」という要望に沿った一般的な Markdown 記法として追加しました).

## プレビュー/ソース切り替え+文書名 (`MarkdownFileViewer.tsx`)

「書類の上部に `IconEye`/`IconCode` を『プレビューを表示』『ソースを表示』というツールチップ
付きのトグルボタンとして表示し, プレビューを標準としてほしい」という依頼どおり, 会議一覧の
`ViewModeToggle` (リスト/カレンダー切り替え, [`pages/organization-meetings.md`](pages/organization-meetings.md))
と同じ「選択中の側にボタン型のオーバーレイがスライドする」見た目+`aria-label` を CSS で
ツールチップ表示する仕組みをそのまま踏襲しています — ドメインも役割も異なる (会議一覧の表示
モード切り替え vs. Markdown プレビュー/ソース切り替え) ため, 共通コンポーネントとして切り出
さず並行コンポーネントとして複製しています (`Document*`/`Transaction*`/`Meeting*` 系で
確立した「機能ごとに似た構成でも別コンポーネントとして持つ」方針を踏襲). 既定は
`MarkdownViewMode.Preview`, ソース表示は整形前の生の Markdown 文字列を等幅フォントの
`<pre>` でそのまま表示するだけです.

**「トグルスイッチの左横には左詰めで文書名を記載してほしい, トグルスイッチがある部分は本文
と分割線で隔ててほしい」という依頼により**, `title: string` prop を追加し `.toolbar`
(`justify-content: space-between`) の左に文書名, 右にトグルを配置した上で `.toolbar` に
`border-bottom` を付けています — `MeetingMaterialsExplorer` (資料タブ) では Markdown
種別のときだけ, 他の種別 (PDF/動画/テキスト) が使う外側の見出し (`.materialName`) の代わりに
この `title` prop (`selectedMaterial.name`) で文書名を示すようにしました (二重表示を避ける
ため). `MeetingMinutesExplorer` (議事録タブ) は `` `議事録_${sessionLabel}.md` `` という
組み立てたファイル名を渡しています (`MeetingMinutes` 自体に実ファイル名の概念が無いため).

## 利用箇所

`MeetingMaterialsExplorer` (資料タブ, Markdown 種別のみ. PDF/動画/テキストは対象外) と
`MeetingMinutesExplorer` (議事録タブ, 全件), `DocumentContentViewer` (文書詳細ページの
概要/版タブ, 詳細は [`pages/document-detail.md`](pages/document-detail.md)),
`MaterialsExplorer` (規則・資料ページ, 詳細は [`pages/materials.md`](pages/materials.md))
の4箇所です — 依頼の「他にmdファイルを表示する場所でも」を満たすため, 特定の画面に結合
させず `source`/`title` を受け取るだけの汎用コンポーネントにしています.

## `bordered`/`onEdit`

`bordered?: boolean` (既定 `true`) は false のとき外枠のボーダー/角丸/背景を描画しない —
`MeetingMaterialsExplorer`/`MeetingMinutesExplorer`/`MaterialsExplorer` のように呼び出し
側が既に外枠を持っていて二重に囲われてしまう場合 (`MeetingMinutesExplorer` の複数開催回
ケースで実際に踏んだ「議事録が2重に囲われてしまっている」不具合の修正で追加) に使います —
ツールバーと本文の分割自体はこの場合も維持されます. `onEdit?: () => void` は指定すると
トグルスイッチの左横に `IconButton` (`icon={IconPencil} label="編集する"`) を表示します —
「トグルスイッチの左横に編集するボタンを追加してほしい, 動作はのちほど実装する」という依頼
のため, 現状は `DocumentContentViewer`/`DocumentOverviewSection` から渡すハンドラーは何も
しないスタブです (`MeetingMaterialsExplorer`/`MeetingMinutesExplorer` からは渡していない
ため, それらのツールバーには表示されません).
