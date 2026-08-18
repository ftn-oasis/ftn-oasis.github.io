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

type OrganizationMember = {
  id: string;
  name: string;
};

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

export {
  ActivityType,
  type Activity,
  type DocumentChangeActivity,
  DocumentSortDirection,
  DocumentSortField,
  type MeetingCreatedActivity,
  type MoneyTransactionActivity,
  type OrganizationDocument,
  OrganizationType,
  type OrganizationDetail,
  type OrganizationMember,
};
