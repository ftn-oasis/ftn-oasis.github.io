# 組織を横断した一覧ページ (`/documents`/`/book`/`/meetings`/`/issues`/`/pulls`)

> 索引: [`../README.md`](../README.md)

「`~/orgs/組織ID/{issues, pulls, documents, book, meetings}` のページと同じ構造とし,
内容は組織を横断したものとしてほしい」という依頼による, 5つのグローバル (`/orgs/:orgId`
に属さないトップレベル) な一覧ページです. Header/`NavDrawer` の「全ての文書」/「全ての
会計申請」/「予定されている会議」/「指摘事項」/「修正提案」ボタン (`getBreadcrumb.ts` の
`SPECIAL_ROOT_LABELS` にも `documents: "文書"`/`book: "帳簿"`/`meetings: "会議"`/
`issues: "指摘事項"`/`pulls: "修正提案"` として以前から用意されていた) が指す, 従来は
404だった5つのルートです.

## 「同じ構造」の実現方法

新しいコンポーネントは1つも作らず, 既存の `OrganizationDocumentsSection`/
`OrganizationBookSection`/`OrganizationMeetingsSection`/`DocumentIssuesSection`/
`DocumentPullRequestsSection` をそれぞれ単に別の配列 (組織で絞り込まない全件) で呼び出す
だけで実現しています. これが成立するのは, 各一覧行 (`DocumentListRow`/`TransactionListRow`/
`MeetingListRow`/`IssueListRow`/`PullRequestListRow`) がリンク先の組織 ID を props ではなく
**項目自身から (`document.organizationId` など) 解決する設計**に元々なっていたためです —
`OrganizationDocumentsSection`/`OrganizationBookSection`/`OrganizationMeetingsSection`
は元々 `documents`/`transactions`/`meetings` の配列だけを受け取る設計だったため無改修で
そのまま使えましたが, `IssueListRow`/`PullRequestListRow` は元々 `organizationId`/
`documentId` を呼び出し元 (特定の文書のページ) から props で受け取る設計だったため, この
ページを作るタイミングで「`issue.documentId` から `MOCK_ORGANIZATION_DOCUMENTS` を検索
して組織 ID を自己解決する」形にリファクタリングしています (詳細は
[`document-detail.md`](document-detail.md) の「指摘事項/修正提案タブ」を参照) —
`documentId` prop 自体も `issue.documentId` と重複していたため, この整理で不要になり
削除しています.

## `DocumentsPage`/`BookPage`/`MeetingsPage`

それぞれ `OrganizationDocumentsSection`/`OrganizationBookSection`/
`OrganizationMeetingsSection` (すでに自身で `max-width: 1280px; margin: 0 auto;`
を持つ, トップレベルページとして単独で使える設計) に `MOCK_ORGANIZATION_DOCUMENTS`/
`MOCK_ORGANIZATION_TRANSACTIONS`/`MOCK_ORGANIZATION_MEETINGS` の全件をそのまま渡すだけの
薄いラッパーです. `OrganizationBookSection` の `TransactionSummaryBox`
(残高/収入/支出, [`organization-book.md`](organization-book.md)) も全件から算出される
ため, 組織を横断した合計になります.

## `IssuesPage`/`PullsPage`

`DocumentIssuesSection`/`DocumentPullRequestsSection` に `MOCK_DOCUMENT_ISSUES`/
`MOCK_DOCUMENT_PULL_REQUESTS` の全件を渡すだけの薄いラッパーですが, この2つのセクションは
(`/orgs/:orgId/documents/:documentId` 配下にネストされる前提のため) 自身では `max-width`
を持たないので, `IssuesPage.module.css`/`PullsPage.module.css`
(`max-width: 1280px; padding: 24px 16px; margin: 0 auto;`,
`OrganizationDocumentsSection.module.css` の `.root` と同じ値) でページ側から中央寄せ
しています.

## 注意点

**`MOCK_ORGANIZATIONS` (組織一覧ページ用, 詳細は [`orgs-list.md`](orgs-list.md)) は複数件
ありますが, 詳細データ (文書/入出金/会議など) を実際に持つ組織は `MOCK_ORGANIZATION`
(`test-org`) の1件のみ**のため, 「組織を横断」の実際の効果 (複数組織の文書/入出金/会議が
実データとして混ざって表示される) はまだ確認できません — 上記の設計 (各項目が自分の
`organizationId` を持ち, 一覧側がそれを使ってリンクを組み立てる) により, 他の組織にも
実データが増えたときも一覧側の実装を変更せずに自然に横断できる想定です.
