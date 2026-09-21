# 印刷状況ページ (`PrintQueuePage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`~/print-queue` — NavDrawer の「印刷状況」/`CreateButton` の「印刷を依頼」の状況確認先が
指す, 組織/文書に紐付かないグローバルな一覧ページです. 「`~/documents`
(`OrganizationDocumentsSection`) を参考にしてほしい」という依頼のため, 通知ページ
([`notifications.md`](notifications.md)) と同じく検索バー+フィルターサイドバー+ソート+
ページネーション付き一覧 Box の構造を踏襲していますが, 印刷依頼専用の新規コンポーネント
一式 (`PrintRequest*`) として実装しています (`Document*` をそのまま再利用した「組織を
横断した一覧ページ」([`cross-org-lists.md`](cross-org-lists.md)) の5つとは異なり, 印刷
依頼専用のデータ構造が必要なため — こちらは「機能ごとに似た構成でも別コンポーネントとして
持つ」という, 会計申請/会議一覧などで確立した既存の方針を踏襲した新規実装です). 組織にも
ドキュメント一覧にも依存しないため, `features/notifications/` と同じ理由で新しい feature
`features/printQueue/` (`types.ts`/`mockData.ts`/`printRequestFilters.ts`/`components/`)
として独立させています.

- **サイドバーのフィルター**: 依頼文で明示された6件, 全て (`IconHome`)/依頼中
  (`IconUser`)/印刷待 (`IconStackPush`)/受取待 (`IconStackPop`)/完了済 (`IconCheck`)/
  取消済 (`IconX`) です (`printRequestFilters.ts` の `PRINT_REQUEST_FILTERS` —
  `documentFilters.ts` と同じく, `PrintRequestFilterSidebar`/`PrintQueueSection`
  の両方が選択中判定/見出し表示に必要なため専用ファイルへ切り出しています). 他のフィルター
  同様まだ実装していない (選択すると検索欄に `` `状態: ${ラベル}` `` を入れるだけ) ため,
  一覧は絞り込まれません. `NotificationFilterSidebar` と同じ理由 (`~/print-queue` は組織
  ページのネストしたレイアウトに属さない単独のトップレベルページ) で
  `useFixedSidebarPosition` (`features/organization/`) は使わず, 通常のフローのまま配置
  しています.
- **`PrintRequestStatus`** (`types.ts`) — 依頼中/印刷待/受取待/完了済/取消済の5値です
  (`erasableSyntaxOnly` 対応の const オブジェクト + union 型, 他の状態系の型と同じ
  パターン). 一覧の各行 (`PrintRequestListRow`) では `PrintRequestStatusBadge`
  (`TransactionStatusBadge`, [`transaction-detail.md`](transaction-detail.md) と全く
  同じ, 左右が半円のピル型ラベル. 依頼中 blue/印刷待 teal/受取待 peach/完了済 green/取消済
  red の5色 — `TransactionStatusBadge` は4状態+却下済の5色に blue/green/peach/mauve/red
  を使っていますが, 状態の意味が異なるためこのページ独自の対応にしています) の `compact`
  版で状態を表示します.
- **対応する詳細ページはまだ無いため, `PrintRequestListRow` は `DocumentListRow`/
  `TransactionListRow` と違い行全体をリンクにしていません** (依頼者名だけ `UserNameLink`
  + `resolveMemberId` ([`../user-name-link.md`](../user-name-link.md)) でプロフィール
  ページへリンクします). これに伴い `PrintRequestListBox` は `DocumentListBox` にある
  「矢印キーで行間を移動する」操作 (対象のリンクが無いため) を持たず, 一覧のコンテナも
  非対話的な静的リストとして実際の `<ul>`/`<li>` (biome の `lint/a11y/useSemanticElements`
  が `role="list"` な `<div>` よりこちらを推奨するため) で構成しています — 「ページ切り
  替え時に一覧へフォーカスして変化に気付けるようにする」という標準方針
  (`DocumentListBox` 等) 自体は行の有無に関わらず有効なため, そちらは踏襲しています.
- **モックデータ**: `MOCK_PRINT_REQUESTS` (45件) は組織を全て `test-org`
  (`MOCK_ORGANIZATION.id`, documents/book/meetings と同じ既存方針) にし, 依頼者は
  `MOCK_MEMBERS` (`features/organization/mockData.ts`) を index で循環させています.
  依頼日時は会議一覧の `MEETING_ANCHOR` と同じ考え方で実行時の実際の日付を起点に (固定の
  過去日付ではなく) 生成しており, 状態は完了済が多め・取消済が少なめになるよう偏りを持たせた
  循環パターン (`STATUS_CYCLE`) で割り当てています.
