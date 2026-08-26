# ドキュメント索引

FTH OASIS の実装済み機能・設計判断をまとめたドキュメント群です. `CLAUDE.md`
(リポジトリルート) には Claude Code 向けの作業ルール (コマンド/品質チェック/共通デザイン
トークンの使い方など) を圧縮して残し, 「なぜこの実装になっているか」という機能ごとの詳細
はこの `docs/` 以下に分割しています. 各ファイルの記述は依頼の経緯・試行錯誤も含めて書かれて
いるため, 同種の変更をする際に「なぜその実装になっているか」を確認する目的で読んでください.

## 現状・全体像

- [`project-status.md`](project-status.md) — 実装済みのページ・機能一覧, 現状できていない
  こと (着手する際は要確認).
- [`architecture.md`](architecture.md) — パスエイリアス, アプリの構成
  (`AppProviders`/`ThemeContext`/ルーティング), ディレクトリの規約, カラー/デザイントークン,
  export の方法.

## 汎用 UI パターン

- [`ui-common-patterns.md`](ui-common-patterns.md) — `controlBase`/`menuItemBase`/
  `tabBase` などの共通 CSS Module, ポップオーバー/ドロップダウンの共通パターン, `Label`
  など汎用部品へのリンク集.
- [`header.md`](header.md) — グローバルヘッダー (`Header.tsx`) の構造, 下部ヘッダーのスロット,
  パンくず, レスポンシブな折り畳み.
- [`user-name-link.md`](user-name-link.md) — `UserNameLink`/`OrgNameLink` (名前表示の
  プロフィールリンク化) と見切れた文言のツールチップ表示.
- [`markdown-viewer.md`](markdown-viewer.md) — `MarkdownDocument`/`MarkdownFileViewer`
  (GitHub 風 Markdown プレビュー) の自前パーサー・利用箇所.
- [`request-submit-flow.md`](request-submit-flow.md) — 作成フォーム共通の送信/確認/
  キャンセル UX (`useRequestSubmitFlow`).
- [`navigation-guard.md`](navigation-guard.md) — 作成画面の離脱ガード
  (`useBlocker`/`beforeunload`).
- [`emblem-pipeline.md`](emblem-pipeline.md) — Emblem (ロゴマーク) と Tabler アイコンの
  2つの SVG パイプライン.
- [`pages/theme-preference.md`](pages/theme-preference.md) — ユーザーメニューの外観
  (ライト/デバイスに連動/ダーク) 切り替えと `ThemeContext` の永続化.
- [`pages/report-issue-modal.md`](pages/report-issue-modal.md) — 「問題を報告」モーダル
  (`CreateButton`/`NavDrawer` の両方から開ける).
- [`pages/role-preview.md`](pages/role-preview.md) — ユーザーメニューの役職プレビュー
  切り替え (`RolePreviewContext`, 確認用の一時的な切り替え).

## ページ別ドキュメント (`docs/pages/`)

| ページ | URL | ドキュメント |
| --- | --- | --- |
| ユーザープロフィール | `/users/:userId` | [`pages/user-profile.md`](pages/user-profile.md) |
| 組織プロフィール (概要タブ) | `/orgs/:orgId` | [`pages/organization-profile.md`](pages/organization-profile.md) |
| 組織の文書一覧 | `/orgs/:orgId/documents` | [`pages/organization-documents.md`](pages/organization-documents.md) |
| 組織の入出金一覧 | `/orgs/:orgId/book` | [`pages/organization-book.md`](pages/organization-book.md) |
| 会計処理詳細 | `/orgs/:orgId/book/:transactionId` | [`pages/transaction-detail.md`](pages/transaction-detail.md) |
| 組織の構成員一覧 | `/orgs/:orgId/members` | [`pages/organization-members.md`](pages/organization-members.md) |
| 組織の会議一覧 | `/orgs/:orgId/meetings` | [`pages/organization-meetings.md`](pages/organization-meetings.md) |
| 会議詳細 | `/orgs/:orgId/meetings/:meetingId` | [`pages/meeting-detail.md`](pages/meeting-detail.md) |
| 文書詳細 | `/orgs/:orgId/documents/:documentId` | [`pages/document-detail.md`](pages/document-detail.md) |
| 通知 | `/notifications` | [`pages/notifications.md`](pages/notifications.md) |
| 印刷状況 | `~/print-queue` | [`pages/print-queue.md`](pages/print-queue.md) |
| 新館予約状況 | `~/room-reservations` | [`pages/room-reservations.md`](pages/room-reservations.md) |
| 備品貸出状況 | `~/equipment-loans` | [`pages/equipment-loans.md`](pages/equipment-loans.md) |
| 組織を横断した一覧 (文書/帳簿/会議/指摘事項/修正提案) | `/documents`, `/book`, `/meetings`, `/issues`, `/pulls` | [`pages/cross-org-lists.md`](pages/cross-org-lists.md) |
| 組織一覧 | `~/orgs` | [`pages/orgs-list.md`](pages/orgs-list.md) |
| 規則・資料 | `~/materials`, `~/materials/:documentKey` | [`pages/materials.md`](pages/materials.md) |
| ホーム | `~` | [`pages/home.md`](pages/home.md) |
| 文書作成 | `~/documents/new` | [`pages/new-document.md`](pages/new-document.md) |
| 文書アップロード (一括) | `~/documents/new/upload` | [`pages/new-document-upload.md`](pages/new-document-upload.md) |
| 組織作成 | `~/orgs/new` | [`pages/new-organization.md`](pages/new-organization.md) |
| 会計申請作成 (支出/予算執行/寄付) | `~/book/new` | [`pages/new-transaction.md`](pages/new-transaction.md) |
| 設定 (利用者: 学年/アバター) | `~/settings` | [`pages/settings.md`](pages/settings.md) |
| 404 | `*` | [`pages/not-found.md`](pages/not-found.md) |

## 読み方の補足

- 各ドキュメントは「基本の一覧ページ ([`pages/organization-documents.md`](pages/organization-documents.md))
  → それを土台に複製した派生ページ」という構成が多いため, まず土台側を読んでから派生側の
  差分を読むと理解しやすいです (各ファイル冒頭の「土台:」リンクを参照).
- `~` はホスト名 (サイトのルート) を指す表記です (`CLAUDE.md` 参照).
