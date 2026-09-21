# プロジェクトの現状

> [`docs/README.md`](README.md) — ドキュメント全体の索引はこちら.

FTH OASIS (**F**uzoku **T**enoji **H**igh school OASIS) は React + TypeScript + Vite で構築された
SPA です. README.md によると, 想定されている最終形は GitHub のようなUI (リポジトリブラウザ,
issue, ユーザープロフィールなど) です.

## 実装済みのページ・機能

- `Header` (`src/components/layout/`) — ハンバーガーメニュー (`NavDrawer` を開閉), ロゴ+パンくず,
  検索ボタン, 「作成」ドロップダウン, 主要ナビアイコン, 通知, ユーザーメニュー (`UserMenuButton`)
  を1行に並べたグローバルヘッダー. 画面が狭くなると検索ボタンやナビアイコンが自動で折り畳まれる
  レスポンシブ対応あり. 詳細: [`docs/header.md`](header.md).
- テーマシステム (`ThemeContext`) — ライト/ダーク (Catppuccin Latte/Mocha) を OS の設定から
  自動検出し, 手動切り替えにも対応. 詳細: [`docs/architecture.md`](architecture.md).
- `NavDrawer` — 左からスライドインするメニュー (ホーム/各種申請/規則等/組織など).
- ルーティングの土台と各ページ — `App.tsx` に `<Routes>` を導入し, `AppLayout`
  (`Header` + `<Outlet />`, 全ページ共通) 配下に以下を実装済みです.
  - `/users/:userId` → `UserProfilePage`. `currentUser.id` と一致しない `userId`
    (未知のユーザーなど) は「ユーザーが見つかりません」という結果になります — 実際のユーザー
    検索/存在チェックの API が無いための暫定挙動です. `ProfileTabs` の「概要」タブの本文として
    `OverviewSection` を実装済みですが, 「文書」タブの本文はまだ無く, タブを切り替えても何も
    表示されません (「栞」タブは依頼により削除済みです). 詳細: [`docs/pages/user-profile.md`](pages/user-profile.md).
  - `/orgs/:orgId` (概要タブ) と `/orgs/:orgId/documents` (文書タブ)/`/orgs/:orgId/book`
    (会計タブ)/`/orgs/:orgId/members` (構成員タブ)/`/orgs/:orgId/meetings` (会議タブ) —
    `OrganizationLayout` という共通の親ルートの下にネストしたルートとして実装しており,
    組織の存在チェックと `OrganizationTabs` の表示はそちらに集約されています. 詳細:
    [`docs/pages/organization-profile.md`](pages/organization-profile.md),
    [`docs/pages/organization-documents.md`](pages/organization-documents.md),
    [`docs/pages/organization-book.md`](pages/organization-book.md),
    [`docs/pages/organization-members.md`](pages/organization-members.md),
    [`docs/pages/organization-meetings.md`](pages/organization-meetings.md).
  - `path="*"` の catch-all として `NotFoundPage` も実装済みで, `/users/:userId`/`/orgs/:orgId`
    以外のどのパスにもマッチしない URL は 404 ページになります (以前はここが完全な白紙に
    なっていました). 詳細: [`docs/pages/not-found.md`](pages/not-found.md).
  - `/orgs/:orgId/documents/:documentId` (概要/版/指摘事項/修正提案/編集者の5タブ)/
    `/orgs/:orgId/book/:transactionId`/`/orgs/:orgId/meetings/:meetingId` の3つの個別詳細ページ,
    および組織/文書に紐付かないグローバルな `/notifications` も実装済みです. 詳細:
    [`docs/pages/document-detail.md`](pages/document-detail.md),
    [`docs/pages/transaction-detail.md`](pages/transaction-detail.md),
    [`docs/pages/meeting-detail.md`](pages/meeting-detail.md),
    [`docs/pages/notifications.md`](pages/notifications.md).
  - `/documents`/`/book`/`/meetings`/`/issues`/`/pulls` (それぞれ対応する `/orgs/:orgId/...`
    ページと同じ構造で, 内容だけ組織を横断した全件にしたもの)/`/orgs` (組織一覧)/`/materials`・
    `/materials/:documentKey` (規則・資料)/`~` (ホーム)/`~/documents/new` (文書作成フォーム)/
    `~/documents/new/upload` (複数ファイルの一括アップロード)/`~/book/new`
    (会計申請作成フォーム — 支出/予算執行/寄付の3種類)/`~/print-queue`
    (印刷状況)/`~/room-reservations` (新館予約状況)/`~/equipment-loans` (備品貸出状況)/
    `~/orgs/new` (組織作成フォーム)/`~/settings` (設定 — 現状「利用者」タブのみ, 学年/
    アバターを変更可能) も実装済みです. 詳細:
    [`docs/pages/cross-org-lists.md`](pages/cross-org-lists.md),
    [`docs/pages/orgs-list.md`](pages/orgs-list.md),
    [`docs/pages/materials.md`](pages/materials.md),
    [`docs/pages/home.md`](pages/home.md),
    [`docs/pages/new-document.md`](pages/new-document.md),
    [`docs/pages/new-document-upload.md`](pages/new-document-upload.md),
    [`docs/pages/new-transaction.md`](pages/new-transaction.md),
    [`docs/pages/print-queue.md`](pages/print-queue.md),
    [`docs/pages/room-reservations.md`](pages/room-reservations.md),
    [`docs/pages/equipment-loans.md`](pages/equipment-loans.md),
    [`docs/pages/new-organization.md`](pages/new-organization.md),
    [`docs/pages/settings.md`](pages/settings.md).
  - ヘッダーのユーザーメニュー内には, 「問題を報告」モーダル
    ([`docs/pages/report-issue-modal.md`](pages/report-issue-modal.md)), 外観
    (ライト/デバイスに連動/ダーク) 切り替え
    ([`docs/pages/theme-preference.md`](pages/theme-preference.md)), 役職プレビュー
    切り替え ([`docs/pages/role-preview.md`](pages/role-preview.md), 実際のユーザー設定
    ではなく確認用の一時的な切り替え) も実装済みです.

## 現状できていないこと (着手する際は要確認)

- **指摘事項/修正提案の個別詳細ページ**
  (`/orgs/:orgId/documents/:documentId/issues/:issueId`/
  `/orgs/:orgId/documents/:documentId/pulls/:pullRequestId`) — 文書詳細ページの実装時に
  「詳細な指摘事項を表すものは後で実装します」という依頼だったため, 一覧
  (`IssueListRow`/`PullRequestListRow`) は既にこれらの URL へリンクを貼っていますが,
  実ページが無いため `NotFoundPage` (404) になります.
- 上記「実装済みのページ・機能」に挙げたもの以外の実ページは依然として存在しません —
  Header/Drawer 内のリンク先の一部, および組織プロフィールページの「設定」タブは実際には
  `NotFoundPage` (404) が表示されるだけの状態です. 新しいページを作る際, URL の命名は
  既存のリンク (`getBreadcrumb.ts` の `SPECIAL_ROOT_LABELS` など) と揃えてください.
  ユーザー/組織のプロフィールページは `/users/:userId`/`/orgs/:orgId` (`/` 直下ではなく
  それぞれの配下) に切り出してあるため, 新しいトップレベルのページ (`/foo` 等) を追加する際に
  `<Route>` の並び順を気にする必要はありません (`path="*"` の `NotFoundPage` より前に置く
  必要はありますが, それ以外の既存ルートとの前後関係は無関係です) — 以前は `/:userId` という
  動的ルートが最上位にあり, 新しいページより前に置かないとそちらに飲み込まれてしまう問題が
  ありましたが, 各々のプレフィックス配下に切り出したことで解消しています.
- **認証/バックエンド** — 存在しません. `src/lib/currentUser.ts` に仮のユーザー情報
  (`id`/`name`/`email`) を置いているだけです. `UserProfilePage` の文書の件数
  (`DUMMY_DOCUMENT_COUNT`) や, 「概要」タブの所属組織/文書一覧 (`src/features/user/mockData.ts`),
  組織プロフィールページの組織詳細/構成員/直近の動向 (`src/features/organization/mockData.ts`,
  `id: "test-org"` の1件のみ) も同様にダミーです.
- **テストスイート** — 設定されていません.
