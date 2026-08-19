// ~/notifications (グローバル, 組織/文書には紐付かない) 用の型.
// 「指摘事項/修正提案のリスト形式 (タイトル+投稿者+投稿日) を踏襲しつつ,
// 既読/未読の区別も追加してほしい」という依頼のため, DocumentIssue/
// DocumentPullRequest (features/organization/types.ts) と近い形だが,
// 通知は組織/文書に紐付かないグローバルな概念のため features/notifications/
// として独立させている
type Notification = {
  id: string;
  title: string;
  // 発信元 (組織名など)
  senderName: string;
  // "YYYY/MM/DD HH:mm"
  occurredAt: string;
  read: boolean;
  // 通知の対象ページへのリンク先 (既に実装済みのページを指す場合と, まだ
  // 実装していないページを指し 404 になる場合の両方があり得る)
  targetUrl: string;
};

const NotificationSortField = {
  OccurredAt: "occurredAt",
  Title: "title",
} as const;

type NotificationSortField =
  (typeof NotificationSortField)[keyof typeof NotificationSortField];

const NotificationSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type NotificationSortDirection =
  (typeof NotificationSortDirection)[keyof typeof NotificationSortDirection];

export {
  type Notification,
  NotificationSortDirection,
  NotificationSortField,
};
