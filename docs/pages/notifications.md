# 通知ページ (`NotificationsPage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`~/notifications` — Header/`NavDrawer` の「全ての通知」/「通知」ボタンが指す, 組織/文書の
いずれにも紐付かないグローバルな一覧ページです. 「これ (指摘事項/修正提案のリスト形式) と
同じ形式で実装してほしい」という依頼のため, `OrganizationDocumentsSection` と同じ構造
(検索バー+フィルターサイドバー+ソート+ページネーション付き一覧 Box) を土台にしていますが,
「既読/未読の区別も追加してほしい」という確認への回答を受けて未読の視覚的な区別を追加して
います.

- **配置**: 組織/文書に紐付かないため, 既存の `features/organization/` ではなく新しい
  `features/notifications/` (`types.ts`/`mockData.ts`/`components/`, `features/user/`
  と同じ構成) として独立させています. ルーティングも `/orgs/:orgId` 配下のネストした
  ルートではなく, `App.tsx` の `<Route path="/notifications" element={<NotificationsPage
  />} />` として `/users/:userId`/`/orgs/:orgId` と同じ階層のトップレベルルートにしています
  (`OrganizationLayout` のような親レイアウト+存在チェックは不要 — 「組織が見つかりません」
  に相当する概念が無いため).
- **`type Notification`** (`id`/`title`/`senderName`/`occurredAt`/`read`/`targetUrl`)
  — `DocumentIssue`/`DocumentPullRequest` と近い形ですが, 組織/文書に紐付かない別の実体の
  ため独立した型にしています. `targetUrl` は通知の対象ページへの絶対パスをそのまま持たせて
  おり (`documentId` のような ID 参照+リンク先を都度組み立てる形にはしていません — 通知の
  対象が文書/会議/入出金など複数の種類にまたがるため, 種類ごとの分岐を `NotificationListRow`
  側に持たせるより単純です), `Link to={notification.targetUrl}` でそのまま遷移します.
- **`NotificationListRow`**: `IssueListRow`/`PullRequestListRow`
  ([`document-detail.md`](document-detail.md)) と同じ構成 (タイトル+送信元/日時を右詰め
  2段) に加え, 未読のときだけ左にドット (`--color-link`) を置きタイトルを太字にします
  (既読は通常の太さ. ドット自体は既読でも同じ幅を確保したままにし, タイトルの開始位置が
  既読/未読で揃うようにしています).
- **`NotificationFilterSidebar`**: 「既読/未読の区別も追加してほしい」という回答のため,
  全て/未読のみの2件だけです. 他の一覧サイドバー (`DocumentFilterSidebar`/
  `MeetingFilterSidebar` など) と違い `useFixedSidebarPosition` (スクロール追従) は使って
  いません — 依頼されておらず, 汎用フックとはいえ `features/organization/` 配下にある
  ものを機能をまたいで再利用するかどうかは判断が分かれるため, ひとまず素朴な通常フローの
  配置にしています. スクロール追従が必要になれば `useFixedSidebarPosition.ts` を
  `src/lib/` 等の共有場所へ移してから使うことを検討してください.
- **モックデータ**: `MOCK_NOTIFICATIONS` は文書/会議/入出金それぞれ実在する
  `MOCK_ORGANIZATION_DOCUMENTS`/`MOCK_ORGANIZATION_MEETINGS`/`MOCK_ORGANIZATION_TRANSACTIONS`
  (`features/organization/mockData.ts`) の先頭15件ずつを参照し, 対象ページへの実際に機能
  するリンクとして生成しています (`EmbeddedTransactionView`/文書詳細ページの議決情報と同じ,
  「実在するデータを参照できる場合はそうする」という考え方). 日時は会議一覧の
  `MEETING_ANCHOR` と同じ考え方で実行時の実際の日付を起点にしており (固定の過去日付では
  ない — 「最近の通知」として常に新しく見えるようにするため), 3件に1件を未読にしています.
