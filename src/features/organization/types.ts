// tsconfig.app.json の erasableSyntaxOnly により実際の enum 構文は使えないため,
// const オブジェクト + そこから導出した union 型で enum 相当のものを表現する
const OrganizationType = {
  Class: "class",
  ExecutiveBody: "executive-body",
  DecisionMakingBody: "decision-making-body",
  IndependentCommittee: "independent-committee",
  Club: "club",
  Volunteer: "volunteer",
} as const;

type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType];

type OrganizationDetail = {
  id: string;
  name: string;
  type: OrganizationType;
  description: string;
  memberCount: number;
  // 無い場合 (有志など) は undefined
  foundedAt?: string;
  // パンくず表示用の祖先組織名 (自分自身は含めない, 親から順). 有志の場合は使わない
  ancestorNames: string[];
};

// 構成員一覧 (/orgs/:orgId/members) の1件だが, OrganizationSidebar (概要タブの
// アバター一覧) でも id/name だけを使う形で共用している. フィルター (子組織/参加
// 状態など) はまだ実装しないため, 対応するフィールドはまだ持たせていない
type OrganizationMember = {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  email: string;
  // 学年 (1-3), 学級 ("A"-"D")
  grade: number;
  class: string;
};

const MemberSortField = {
  Grade: "grade",
  Class: "class",
  Name: "name",
} as const;

type MemberSortField = (typeof MemberSortField)[keyof typeof MemberSortField];

const MemberSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type MemberSortDirection =
  (typeof MemberSortDirection)[keyof typeof MemberSortDirection];

// 「直近の動向」の各カード. 実際のデータでは文書/会議/出納の ID は組織の子要素として
// ツリー構造で持たれているとは限らないため, それぞれ独立した ID + organizationId の
// 参照として扱う (documents/mockData.ts の DocumentSummary と同じ考え方)
const ActivityType = {
  MeetingCreated: "meeting-created",
  MoneyTransaction: "money-transaction",
  DocumentChange: "document-change",
} as const;

type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

type ActivityBase = {
  id: string;
  organizationId: string;
  actorName: string;
  // "YYYY/MM/DD HH:mm"
  occurredAt: string;
};

type MeetingCreatedActivity = ActivityBase & {
  type: typeof ActivityType.MeetingCreated;
  meetingId: string;
  meetingName: string;
  // "YYYY/MM/DD HH:mm"
  startsAt: string;
  // "HH:mm"
  endsAt: string;
  location: string;
  attendees: string;
  agenda: string[];
};

type MoneyTransactionActivity = ActivityBase & {
  type: typeof ActivityType.MoneyTransaction;
  transactionId: string;
  // 収入は正, 支出は負
  amount: number;
  items: string[];
};

type DocumentChangeActivity = ActivityBase & {
  type: typeof ActivityType.DocumentChange;
  documentId: string;
  versionId: string;
  documentTitle: string;
  changes: string[];
};

type Activity =
  | MeetingCreatedActivity
  | MoneyTransactionActivity
  | DocumentChangeActivity;

// 組織の文書一覧 (/orgs/:orgId/documents) の1件. フィルター (子組織/関与/管理権限
// など) はまだ実装しないため, 対応するフィールドはまだ持たせていない
type OrganizationDocument = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  fileType: string;
  // ソート用. 画面には表示しないため, 比較さえできれば良い ISO 形式の文字列
  createdAt: string;
  editedAt: string;
};

const DocumentSortField = {
  EditedAt: "editedAt",
  CreatedAt: "createdAt",
  Title: "title",
} as const;

type DocumentSortField =
  (typeof DocumentSortField)[keyof typeof DocumentSortField];

const DocumentSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type DocumentSortDirection =
  (typeof DocumentSortDirection)[keyof typeof DocumentSortDirection];

const PaymentMethod = {
  Cash: "cash",
  BankTransfer: "bank-transfer",
  DirectDebit: "direct-debit",
} as const;

type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// 組織の入出金一覧 (/orgs/:orgId/book) の1件. amount は 収入: 正の数 / 支出: 負の数
// (MoneyTransactionActivity と同じ約束). title は表示用に整形済みの金額文字列
// (絶対値+円, 符号無し. 符号は一覧側で行頭の +/- アイコンとして表現する) を
// 持たせ, OrganizationDocument.title と同じ扱いでソート/表示できるようにしている.
// フィルター (子組織/種別/有効フラグなど) はまだ実装しないため, 対応するフィールドは
// まだ持たせていない
type OrganizationTransaction = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  amount: number;
  method: PaymentMethod;
  // ソート用. 画面には表示しないため, 比較さえできれば良い ISO 形式の文字列
  createdAt: string;
  editedAt: string;
};

const TransactionSortField = {
  EditedAt: "editedAt",
  CreatedAt: "createdAt",
  Title: "title",
} as const;

type TransactionSortField =
  (typeof TransactionSortField)[keyof typeof TransactionSortField];

const TransactionSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type TransactionSortDirection =
  (typeof TransactionSortDirection)[keyof typeof TransactionSortDirection];

// 通常/延会 (mauve のラベル)/流会 (sky のラベル). 一覧の項目タイトル横のラベルに使う
const MeetingStatus = {
  Normal: "normal",
  Postponed: "postponed",
  Canceled: "canceled",
} as const;

type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

// 組織の会議一覧 (/orgs/:orgId/meetings) の1件. フィルター (子組織/参加者/開催日
// 前後など) はまだ実装しないため, 対応するフィールドはまだ持たせていない.
// MeetingCreatedActivity (「直近の動向」用) とは別の, 一覧表示専用のフラットな型
type OrganizationMeeting = {
  id: string;
  organizationId: string;
  title: string;
  agenda: string[];
  location: string;
  status: MeetingStatus;
  // ソート/カレンダー表示用. 画面にはそのまま表示せず, 都度整形して使う
  // ISO 形式 ("YYYY-MM-DDTHH:mm") の文字列
  startsAt: string;
  scheduledAt: string;
};

const MeetingSortField = {
  StartsAt: "startsAt",
  ScheduledAt: "scheduledAt",
  Title: "title",
} as const;

type MeetingSortField = (typeof MeetingSortField)[keyof typeof MeetingSortField];

const MeetingSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type MeetingSortDirection =
  (typeof MeetingSortDirection)[keyof typeof MeetingSortDirection];

export {
  ActivityType,
  type Activity,
  type DocumentChangeActivity,
  DocumentSortDirection,
  DocumentSortField,
  MemberSortDirection,
  MemberSortField,
  type MeetingCreatedActivity,
  MeetingSortDirection,
  MeetingSortField,
  MeetingStatus,
  type MoneyTransactionActivity,
  type OrganizationDocument,
  type OrganizationMeeting,
  type OrganizationTransaction,
  OrganizationType,
  type OrganizationDetail,
  type OrganizationMember,
  PaymentMethod,
  TransactionSortDirection,
  TransactionSortField,
};
