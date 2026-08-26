# 規則・資料ページ (`MaterialsPage`/`MaterialDetailPage`)

> 索引: [`../README.md`](../README.md)

`~/materials` (ホーム, `MaterialsPage`) / `~/materials/:documentKey` (文書詳細,
`MaterialDetailPage`) — NavDrawer の「規則･資料」が指すページです. 当初「~/documents の
ページを, GitHub Docs を参考に規則/資料セクション+お知らせで作成してほしい」という依頼
でしたが, 内容 (会則・規則・協定, 新入生の方々へ等の立場別案内) が「文書」(`/documents`,
組織が作成する文書の一覧) ではなく「規則･資料」を指すと判断し, ユーザーに確認のうえ
`/materials` 側に実装しています (詳細は [`../ui-common-patterns.md`](../ui-common-patterns.md)
の「`NavDrawer` 内のリンクの経緯」を参照 — 「文書」と「規則･資料」は元々別物として扱われて
います). 組織にもドキュメント一覧にも依存しないため, 新しい feature `features/materials/`
(`types.ts`/`mockData.ts`/`components/`, `features/notifications/` と同じ構成) として
独立させています.

## `MaterialsHomeSection` (ホーム)

「レイアウトはGitHub Docsを参考とし」という依頼のため, GitHub Docs のカテゴリ一覧を参考に,
「規則」「資料」の2セクションが並ぶ Box (`.sectionsBox`, 縦の `Divider` で区切った2列)
の下に「お知らせ」を配置する構成にしています.

- **セクションの中身**: 「規則」は会則/規則/協定の3件, 「資料」は新入生の方々へ/会計担当者
  の方々へ/部長の方々へ/執行部役員に立候補する方々へ/常設委員会に入りたい方々へ/行事を行う
  方々へ/有志の方々へ の7件, 依頼で列挙された名称のままリンクにしています (`MenuLink`
  を再利用, アイコンは規則側 `IconGavel`/資料側 `IconUsers` で統一). リンク先は
  `/materials/${document.key}`.
- **お知らせ**: 「変更点など過去10個分表示する部分を設けてほしい」という依頼のため,
  `MOCK_MATERIAL_CHANGES` (`MaterialChangeLogEntry[]`, 各文書に対する変更点を模したダミー)
  の先頭10件を, 日付の新しい順に並べた状態で (モックデータ自体を新しい順に定義することで
  実現. 実装を簡潔にするための割り切りで, 実際のソート処理は行っていません) 一覧表示します.
  各行は変更点の要約+対象の文書名+日付で, クリックすると対象の文書詳細ページへ遷移します.

## `MaterialBreadcrumb` (文書詳細ページ上部)

「上部に "ホーム/セクション名/文書名" のパンくずを表示してほしい」という依頼のため,
グローバルヘッダーのパンくず ([`../header.md`](../header.md) — `/materials` 配下は
どの深さでも `SPECIAL_ROOT_LABELS` により「規則・資料」の1階層表示のまま) とは別に, ページ
本文側にこの機能専用の3階層パンくずを実装しています (`OrganizationHeaderBox` の祖先組織名
パンくずと同じ考え方) — 「ホーム」は `/materials` (このページ自身) へのリンク, 「セクション
名」はプレーンテキスト (対応する一覧ページが無いため), 「文書名」は太字の現在地です.

## `MaterialsExplorer` (文書詳細ページ下部)

「下部に `~/orgs/組織ID/meetings/会議ID/materials` の文書閲覧及び選択画面が出るようにして
ほしい」という依頼のため, `MeetingMaterialsExplorer` ([`meeting-detail.md`](meeting-detail.md))
と同じ構造 (開閉できるディレクトリツリーのサイドバー+選択中の文書のプレビュー) にしています.
「ディレクトリを模した部分にはホームでの各リンク名を入れてほしい」という依頼のため, サイド
バーは「規則」「資料」の2フォルダ (ホームの2セクションと対応) の下に, 各セクションの文書
(ホームでの各リンク名と同じ) をファイルとして並べています. `MeetingMaterialsExplorer`
のファイル行は内部 state を切り替えるボタンでしたが, ここでは選択状態が URL の
`:documentKey` 由来のため実際の `<Link>` にしています — 文書をクリックするたびに
`MaterialDetailPage` ごと (パンくず含め) 再描画され, サイドバーの展開状態は選択中の文書が
属するセクションだけを初期状態で開く形にしています (以後の開閉は通常どおり手動).

- 資料は全件 Markdown 相当のため, PDF/動画/テキストのような種別分岐は無く, 常に
  `MarkdownFileViewer` ([`../markdown-viewer.md`](../markdown-viewer.md), `bordered={false}`
  + `.markdownContent` の負の margin で外枠を二重にしない, `MeetingMaterialsExplorer`
  と同じ手法) で表示しています. `MarkdownFileViewer`/`MarkdownDocument` は
  `features/organization/components/` に置かれたままですが, ドメインに依存しない汎用
  コンポーネントのためこの機能からもそのまま import して再利用しています
  (`features/notifications/` が `features/organization/` のモックデータを参照するのと
  同じ, 既存の踏襲済みの割り切りです).

## 型 (`features/materials/types.ts`)

`type MaterialDocument`/`MaterialSectionKey`/`MaterialChangeLogEntry` — 独立した新規の
型です. `MaterialDocument.key` はそのまま URL の `:documentKey` として使う英語スラッグ
(`bylaws`/`new-students` など). モックデータ (`MOCK_MATERIAL_DOCUMENTS`, 10件/
`MOCK_MATERIAL_CHANGES`, 10件) は `features/materials/mockData.ts` にそれぞれの文書用の
短い Markdown 本文とあわせて用意しています.
