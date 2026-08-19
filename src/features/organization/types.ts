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
// まだ持たせていない.
//
// 個別詳細ページ (/orgs/:orgId/book/:transactionId) の実装に伴い, status/
// proposerName/items/procedure/receipt を追加している — OrganizationMember が
// 構成員一覧ページの実装時に (別の型を新設せず) フィールドを追加する形で拡張された
// のと同じ考え方で, 「入出金一覧の1件」と「その会計処理の詳細」は同一の実体を指す
// ため型を分けていない. 一覧側 (TransactionListRow など) は引き続き既存のフィールド
// (title/description など) だけを使うため, この拡張によるコンパイル上の影響は無い
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
  status: TransactionStatus;
  // 起案者 (詳細ページ上部に表示)
  proposerName: string;
  // 金額内訳タブ (/orgs/:orgId/book/:transactionId) 用
  items: TransactionLineItem[];
  // 手続状況タブ (/orgs/:orgId/book/:transactionId/procedure) 用
  procedure: TransactionProcedureStep[];
  // 証憑タブ (/orgs/:orgId/book/:transactionId/receipt) 用
  receipt: TransactionReceipt;
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

// 承認待/支払待/清算待/完了済/否認済. 詳細ページ上部の状態ラベル
// (TransactionStatusBadge) の色分け (blue/green/peach/mauve/red, この順) にも
// 対応する
const TransactionStatus = {
  ApprovalPending: "approval-pending",
  PaymentPending: "payment-pending",
  SettlementPending: "settlement-pending",
  Completed: "completed",
  Denied: "denied",
} as const;

type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

// 金額内訳タブの1項目. 計 (subtotal) は unitPrice × quantity で画面側が算出する
// ため, ここには持たせていない (OrganizationTransaction.title が整形済み文字列を
// 持つのとは違い, こちらは算出元の数値2つをそのまま持つ方が自然なため)
type TransactionLineItem = {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

const TransactionItemSortField = {
  Name: "name",
  Description: "description",
  UnitPrice: "unitPrice",
  Quantity: "quantity",
  Subtotal: "subtotal",
} as const;

type TransactionItemSortField =
  (typeof TransactionItemSortField)[keyof typeof TransactionItemSortField];

const TransactionItemSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type TransactionItemSortDirection =
  (typeof TransactionItemSortDirection)[keyof typeof TransactionItemSortDirection];

// 手続状況タブの手順. 起案の後は 通常なら 承認→支払→清算→完了 と進み,
// 否認された場合は起案の直後に否認ステップで打ち切る (それ以降の手順は生成しない)
const TransactionProcedureStepKey = {
  Proposed: "proposed",
  Approved: "approved",
  Paid: "paid",
  Settled: "settled",
  Completed: "completed",
  Denied: "denied",
} as const;

type TransactionProcedureStepKey =
  (typeof TransactionProcedureStepKey)[keyof typeof TransactionProcedureStepKey];

type TransactionProcedureStep = {
  key: TransactionProcedureStepKey;
  label: string;
  completed: boolean;
  // completed が true のときだけ持つ ("YYYY/MM/DD HH:mm")
  occurredAt?: string;
  actorName?: string;
};

const ReceiptFileType = {
  Image: "image",
  Pdf: "pdf",
} as const;

type ReceiptFileType = (typeof ReceiptFileType)[keyof typeof ReceiptFileType];

// 証憑タブ. 実ファイルの保存先が無いため, 画面側はプレースホルダー (枠線+アイコン)
// を表示するだけで, 実際の画像/PDF は持たない
type TransactionReceipt = {
  documentId: string;
  fileType: ReceiptFileType;
  uploaderName: string;
  // "YYYY/MM/DD HH:mm"
  uploadedAt: string;
};

// 通常/延会 (mauve のラベル)/流会 (sky のラベル). 一覧の項目タイトル横のラベルに使う
const MeetingStatus = {
  Normal: "normal",
  Postponed: "postponed",
  Canceled: "canceled",
} as const;

type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

// 議題の議決結果. 無い (undefined) 場合はそもそも議決の対象ではない議題
// (「前回議事録の確認」のような報告事項など) を表す — 議題タブのアイコン
// 表示の分岐 (MeetingAgendaList) を参照
const AgendaItemVoteResult = {
  Approved: "approved",
  Rejected: "rejected",
  Postponed: "postponed",
} as const;

type AgendaItemVoteResult =
  (typeof AgendaItemVoteResult)[keyof typeof AgendaItemVoteResult];

// 会議1件の議題1項目. 以前は string[] (議題名のみ) でしたが, 議題タブ
// (MeetingAgendaList) に議決結果アイコン/提出者を表示する依頼により,
// 議題名だけでなくこれらの情報も持つオブジェクトに拡張しています
type MeetingAgendaItem = {
  label: string;
  voteResult?: AgendaItemVoteResult;
  submitterName: string;
  submitterRole: string;
};

// 組織の会議一覧 (/orgs/:orgId/meetings) の1件. フィルター (子組織/参加者/開催日
// 前後など) はまだ実装しないため, 対応するフィールドはまだ持たせていない.
// MeetingCreatedActivity (「直近の動向」用) とは別の, 一覧表示専用のフラットな型.
//
// 個別詳細ページ (/orgs/:orgId/meetings/:meetingId) の実装に伴い, attendees/
// materials/minutes を追加している — OrganizationTransaction が会計処理詳細
// ページの実装時にフィールド追加で拡張されたのと同じ考え方で, 別の型は
// 新設していない
type OrganizationMeeting = {
  id: string;
  organizationId: string;
  title: string;
  agenda: MeetingAgendaItem[];
  location: string;
  status: MeetingStatus;
  // ソート/カレンダー表示用. 画面にはそのまま表示せず, 都度整形して使う
  // ISO 形式 ("YYYY-MM-DDTHH:mm") の文字列
  startsAt: string;
  scheduledAt: string;
  // 出席者タブ (/orgs/:orgId/meetings/:meetingId/attendees) 用. 構成員一覧と
  // 同じ表示 (MemberListRow) にそのまま使えるよう, ID 参照ではなく
  // OrganizationMember を直接埋め込んでいる (documents/mockData.ts の
  // 「組織とは分離して考える」設計とは別に, こちらは表示にそのまま使う値の
  // ため denormalize している)
  attendees: OrganizationMember[];
  // 資料タブ (/orgs/:orgId/meetings/:meetingId/materials) 用
  materials: MeetingMaterial[];
  // 議事録タブ (/orgs/:orgId/meetings/:meetingId/minutes) 用. 同じ議題の
  // 会議が複数回開催されることがある想定のため配列にしている (通常は1件)
  minutes: MeetingMinutes[];
};

// 議事録タブの1回分. 会議が1度しか開催されていない場合は配列が1件だけになり,
// そのときはサイドバー無しで本文をそのまま表示する (MeetingMinutesExplorer を参照)
type MeetingMinutes = {
  id: string;
  // 開催回のラベル (例: "第1回")
  sessionLabel: string;
  // 表示用に整形済みの開催日時 ("YYYY/MM/DD HH:mm")
  occurredAt: string;
  content: string;
};

const MeetingMaterialFileType = {
  Pdf: "pdf",
  Markdown: "markdown",
  Text: "text",
  Video: "video",
  // 会計処理詳細ページ (/orgs/:orgId/book/:transactionId) と同じ内容を,
  // リンクではなく資料ビューワのメイン領域にそのまま表示する特殊な種別
  Transaction: "transaction",
} as const;

type MeetingMaterialFileType =
  (typeof MeetingMaterialFileType)[keyof typeof MeetingMaterialFileType];

// 資料タブのサイドバー (ファイルビューワのディレクトリツリー) は議題ごとに
// 資料をグルーピングするため, agendaItem (meeting.agenda の要素と一致する
// 文字列) を持たせている
type MeetingMaterial = {
  id: string;
  agendaItem: string;
  name: string;
  fileType: MeetingMaterialFileType;
  // markdown/text のプレビュー用本文. pdf/video/transaction のときは無い
  // (実ファイルの保存先が無いため, 証憑タブと同様プレースホルダー表示にする)
  content?: string;
  // fileType が Transaction のときだけ持つ, 参照先の OrganizationTransaction.id
  transactionId?: string;
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
  AgendaItemVoteResult,
  type DocumentChangeActivity,
  DocumentSortDirection,
  DocumentSortField,
  MemberSortDirection,
  MemberSortField,
  type MeetingAgendaItem,
  type MeetingCreatedActivity,
  type MeetingMaterial,
  MeetingMaterialFileType,
  type MeetingMinutes,
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
  ReceiptFileType,
  TransactionItemSortDirection,
  TransactionItemSortField,
  type TransactionLineItem,
  type TransactionProcedureStep,
  TransactionProcedureStepKey,
  type TransactionReceipt,
  TransactionSortDirection,
  TransactionSortField,
  TransactionStatus,
};
