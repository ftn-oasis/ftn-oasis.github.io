# 文書詳細ページ (`/orgs/:orgId/documents/:documentId`)

> 索引: [`../README.md`](../README.md) / 一覧: [`organization-documents.md`](organization-documents.md)

会計処理詳細ページ/会議詳細ページと基本的に同じ構成 (存在チェック+上部要約を担う親レイアウト,
ページ本文側のタブバー, `<Outlet context={document} />` + `useOutletContext` で子ページへ
受け渡す薄いラッパーページ) です — 「../../meetings/会議ID を参考とし」という依頼のため,
`OrganizationMeetingLayout` とほぼ同じ形で `OrganizationDocumentLayout` (`src/pages/`,
「文書が見つかりません」判定+`DocumentHeaderBox`+`DocumentDetailTabs`+`Outlet` を担う)
を実装しています. `DocumentListRow` (一覧の各行) は既にこの URL
(`/orgs/${organizationId}/documents/${id}`) へリンクしていたため, 実装対象は詳細ページ側
のみでした.

## 上部要約 (`DocumentHeaderBox`)

1段目は文書名 (太字)+公開/非公開バッジ (`DocumentCard` と同じ `Label`, 色指定は無し),
2段目は `IconUser`+作成者名です.

## タブ (`DocumentDetailTabs`)

概要 (`IconHome`)/版 (`IconTag`)/指摘事項 (`IconFileAlert`)/修正提案
(`IconFileTextSpark`)/編集者 (`IconUsers`) の5タブです. 他の詳細ページと同じくヘッダー
下部のスロットではなく本文側に描画します (`OrganizationTabs` が既にそのスロットを使って
いるため). URL のパス部分は既存の `getBreadcrumb.ts`/`SPECIAL_ROOT_LABELS` で「指摘事項」
「修正提案」に対応付け済みの `issues`/`pulls` をそのまま使っています
(`/orgs/:orgId/documents/:documentId/issues`/`/pulls`).

## データモデリング

会計処理詳細ページ/会議詳細ページと同じ考え方 (「一覧の1件」と「その詳細」は同一の実体を
指す) で, `OrganizationDocument` (`features/organization/types.ts`) に
`authorName`/`visibility`/`versions`/`editors`/`resolution` を追加する形で拡張しています
— 別の型は新設していません.

- `visibility: DocumentVisibility` — 公開/非公開バッジ用に新設した型です.
  `features/user/types.ts` の `DocumentVisibility` (`DocumentSummary` 用) とは別の実体
  (「組織の文書一覧」の1件 vs 「ユーザーの概要タブ」の1件) のため, 「各機能が自分の型を持つ」
  という既存の方針に揃えて独立して定義しています.
- `type DocumentVersion` (`id`/`editedAt`/`editor: OrganizationMember`/`content?: string`)
  — 版タブ用. `editor` は概要タブの「編集者(管理者は)」の判定にも `role` を使うため, 名前の
  文字列ではなく `OrganizationMember` をそのまま持たせています. `content` は Markdown/Text
  のときだけ持ち, PDF/MP4 のときは無い (会議の資料タブと同じ考え方) ため任意にしています.
- `type DocumentResolution` (`meetingId`/`meetingTitle`/`agendaLabel`/`voteResult`) —
  「議決されていればその会議と可決･否決の情報」用. `voteResult` は `AgendaItemVoteResult`
  (会議の議題の議決結果, [`meeting-detail.md`](meeting-detail.md)) を再利用しますが,
  `Approved`/`Rejected` の2値だけに絞っています (「可決･否決」と明示されていたため
  `Postponed` は使いません). `meetingId` は実在する `MOCK_ORGANIZATION_MEETINGS` の会議
  を指す実際に機能するリンクにしています (`EmbeddedTransactionView` が実在する会計処理を
  参照するのと同じ考え方 — `MoneyTransactionActivity.transactionId` 等とは異なり, こちらは
  あえて別の ID 空間にする理由が無いため実在の ID をそのまま使っています).
- `type DocumentIssue`/`type DocumentPullRequest` (指摘事項/修正提案タブ用) —
  `id`/`documentId`/`title`/`posterName`/`postedAt` の同じ形ですが, 「指摘事項と修正提案は
  別の実体」という判断で型は分けています (`Activity` 系と同じ「組織/文書とは分離して考える」
  設計 — 組織の直下ではなく, `documentId` を外部キーとして持つフラットな配列です). ソート
  用の型 (`DocumentIssueSortField`/`DocumentPullRequestSortField` など) も同じ形ですが
  独立して定義しています.

## 概要タブ (`DocumentOverviewSection`)

「GitHubのリポジトリのページを参考に」という依頼のため, `OrganizationOverviewSection`
と同じ 3fr/1fr (メイン:サイドバー) の列比率にしています (依頼文の「左側にメインの資料
右側に資料の情報」に対応). メインは `DocumentContentViewer` (概要/版タブ共通, 後述).
サイドバー (「資料の情報」見出し+`<dl>`) は作成日時/版 (`第${versions.length}版`)/編集者/
議決 (あれば) の4項目です.

- **「編集者(管理者は)」**: 依頼文の意図をユーザーに確認したところ「編集者名+管理者なら
  付記」とのことだったため, 最新版 (`versions` の末尾) の `editor.name` を表示し, その
  `role` が `"委員"` (既定の役職) 以外 (`isAdminRole`, 委員長/副委員長などの特別な役職)
  であれば末尾に「(管理者)」を付記します — 新しいフィールドは増やさず, 既存の
  `OrganizationMember.role` の値で判定しています.
- **議決情報**: `document.resolution` があれば, `` `${meetingTitle}にて
  「${agendaLabel}」が${可決/否決}されました` `` を表示し, 会議名部分は実在する
  `/orgs/:orgId/meetings/:meetingId` へのリンクにしています.
- **`DocumentContentViewer`** (概要タブ/版タブ共通の切り出し) は `fileType`/`title`/
  `content`/`onEdit?` を受け取り, `fileType` に応じて Markdown → `MarkdownFileViewer`
  (`onEdit` があれば「編集する」ボタンを表示. 詳細は [`../markdown-viewer.md`](../markdown-viewer.md))/
  Text → 等幅プレビュー/それ以外 (PDF/MP4) → プレースホルダー, を出し分けます
  (`MeetingMaterialsExplorer` と同じ分岐ロジック) — 概要タブ/版タブの両方から同じコン
  ポーネントとして呼び出すため (「タイムラインの左横に概要画面と同じビューワを配置し」
  という依頼を素直に満たすため), 依頼されていませんが重複を避けてこの1コンポーネントに
  切り出しています. 「編集する」ボタン (`IconPencil`, 動作はのちほど実装) は概要タブから
  呼ぶときだけ `onEdit` を渡し, 版タブ (過去の版を見ているときに「編集する」は意味が通ら
  ないため) では渡していません.

## 版タブ (`DocumentVersionsSection`/`DocumentVersionTimeline`)

左に `DocumentContentViewer` (選択中の版の内容, 既定は最新版), 右にタイムライン (概要タブと
同じ 3fr/1fr 比率) という構成です. タイムラインは「../../book/会計処理ID/procedureの
タイムラインを逆転させ, アイコンを塗り潰しの丸にしてほしい」という依頼のため,
`TransactionProcedureTimeline` ([`transaction-detail.md`](transaction-detail.md))
と同じ土台 (rail+円+矢印+stepBody の縦タイムライン) を踏襲した新規コンポーネント
`DocumentVersionTimeline` として実装しています (「機能ごとに似た構成でも別コンポーネント
として持つ」という既存の方針を踏襲 — 完了/否認/未完了の区別が無い分ロジックも簡略化される
ため, 直接 `TransactionProcedureTimeline` を拡張するより新規のほうが素直でした).

- **逆転**: `versions` (`OrganizationDocument` 側は古い順で保持) を表示直前に `.reverse()`
  して新しい順 (最新版が上) にしています — データ自体は古い順のまま保つ設計です.
- **塗り潰しの丸**: 完了済 (チェック)/未完了 (枠線のみ)/否認 (バツ) の3種類だった
  `TransactionProcedureTimeline` と異なり, 版は全て確定済みの事実 (未来/未完了の概念が
  無い) なので `IconCircleFilled` 1種類だけを使います.
- **タイトル/選択状態**: タイトルは手順名ではなく版の編集日時, 下に `IconUser`+編集者名です.
  各行は `<button>` にして版を選択できるようにしており (`onSelect`), 選択中の版だけ
  `TransactionProcedureTimeline` の「直近 (lastCompletedIndex)」と同じ強調 (30px, 通常色)
  にし, それ以外は同じ控えめな表現 (24px, `--color-body-subtext0`) にしています —
  選択すると左側の `DocumentContentViewer` の表示内容がその版の `content` に切り替わり,
  「その版の状態を再現する」という依頼を満たします (`MeetingMinutesExplorer` のサイドバー
  選択と同じ考え方).

## 指摘事項/修正提案タブ (`DocumentIssuesSection`/`DocumentPullRequestsSection`)

「../../meetingsのリスト形式で」という依頼のため, `OrganizationMeetingsSection`
のリスト表示部分 (検索バー+フィルターサイドバー+ソート+ページネーション付き一覧 Box,
カレンダー表示関連は対象外) と同じ構造です. `IssueListRow`/`IssueListBox`/
`IssueFilterSidebar`/`IssueSearchBar`/`IssueSortDropdown` を実装した後, 「指摘事項と
同じ形式にしてほしい」という依頼どおり `PullRequest*` として並行複製しています. 一覧の
各行はタイトル (太字)+投稿者/投稿日 (右詰め2段, `MeetingListRow` と同じ考え方) です.
サイドバーのフィルターは他のフィルター同様まだ実装しない (選択すると検索欄に文字列を入れる
だけ) ため, 具体的な選択肢は依頼に無い箇所を判断で補っています — 指摘事項は全て/自分の
投稿/未解決/解決済み, 修正提案は全て/自分の投稿/マージ待ち/マージ済みです. 詳細な指摘事項/
修正提案自体 (`/issues/:issueId`/`/pulls/:pullRequestId`) はまだ実装していないため, 一覧の
各行から遷移すると 404 になります (詳細は [`../project-status.md`](../project-status.md)).

**`IssueListRow`/`PullRequestListRow` は `issue`/`pullRequest` だけを受け取り, リンク先の
組織 ID は `issue.documentId`/`pullRequest.documentId` から `MOCK_ORGANIZATION_DOCUMENTS`
を検索して自分で解決します** (`organizationId`/`documentId` を props で受け取る設計だと,
ある文書に紐付いた指摘事項という前提を崩せないため) — `DocumentIssuesSection`/
`DocumentPullRequestsSection`/`IssueListBox`/`PullRequestListBox` も同じ理由で
`issues`/`pullRequests` の配列だけを受け取ります. この設計のおかげで, 特定の文書の指摘事項
だけに絞り込んだ配列を渡す (このタブ) のと, 全件をそのまま渡す (`~/issues`, 詳細は
[`cross-org-lists.md`](cross-org-lists.md)) のを, 同じコンポーネントのそのままの再利用で
両立できています.

## 編集者タブ (`DocumentEditorListBox`)

「../../meetings/会議ID/membersのリストと同じものを配置してほしい」という依頼のため,
`MeetingAttendeeListBox` ([`meeting-detail.md`](meeting-detail.md)) と全く同じ構造
(構成員一覧の行 `MemberListRow` をそのまま再利用する, ソート/ページネーションは持たない
簡潔な Box) です.

## モックデータ

`MOCK_ORGANIZATION_DOCUMENTS` (300件) の各文書に `authorName`/`visibility` (4件に1件を
非公開)/`versions` (2〜4件, 版ごとに `MOCK_MEMBERS` から機械的に選んだ編集者)/`editors`
(3〜5人) を生成時に追加しています. `resolution` だけは `MOCK_ORGANIZATION_MEETINGS`
(このファイルの後方で定義) を参照する必要があり, 文書生成の `Array.from` 内では組み立て
られないため, `MOCK_ORGANIZATION_MEETINGS` の定義後に可決/否決の議題を持つ会議を集めて
(`RESOLVABLE_AGENDA_ENTRIES`) 4件に1件の文書へ後付けで代入しています.
`MOCK_DOCUMENT_ISSUES`/`MOCK_DOCUMENT_PULL_REQUESTS` はそれぞれ5件に1件/7件に1件の文書
にだけ1〜3件/1〜2件を割り当てる `flatMap` で生成しています (全件に持たせると件数が膨らみ
すぎるため).
