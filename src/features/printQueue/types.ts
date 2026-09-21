// ~/print-queue (グローバル, 組織/文書には紐付かない) 用の型. 「~/documents
// (OrganizationDocument/OrganizationDocumentsSection) を参考にしてほしい」
// という依頼のため近い形にしているが, 印刷依頼は組織/文書に紐付かない
// グローバルな概念のため features/printQueue/ として独立させている
// (features/notifications/ と同じ考え方)
const PrintRequestStatus = {
  // 依頼中 — 提出されたがまだ印刷キューに入っていない (承認待ちなど)
  Requesting: "requesting",
  // 印刷待 — 印刷キューに入っている
  Queued: "queued",
  // 受取待 — 印刷済みで, 依頼者の受け取りを待っている
  AwaitingPickup: "awaiting-pickup",
  Completed: "completed",
  Canceled: "canceled",
} as const;

type PrintRequestStatus = (typeof PrintRequestStatus)[keyof typeof PrintRequestStatus];

const PRINT_REQUEST_STATUS_LABEL: Record<PrintRequestStatus, string> = {
  [PrintRequestStatus.Requesting]: "依頼中",
  [PrintRequestStatus.Queued]: "印刷待",
  [PrintRequestStatus.AwaitingPickup]: "受取待",
  [PrintRequestStatus.Completed]: "完了済",
  [PrintRequestStatus.Canceled]: "取消済",
};

type PrintRequest = {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  requesterName: string;
  status: PrintRequestStatus;
  copies: number;
  pages: number;
  // "YYYY-MM-DD" — 依頼日
  createdAt: string;
  // "YYYY-MM-DD" — 状態が最後に変わった日 (ソート用の2本目の日付,
  // DocumentSortField の editedAt/createdAt と同じ考え方)
  updatedAt: string;
};

const PrintRequestSortField = {
  UpdatedAt: "updatedAt",
  CreatedAt: "createdAt",
  Title: "title",
} as const;

type PrintRequestSortField =
  (typeof PrintRequestSortField)[keyof typeof PrintRequestSortField];

const PrintRequestSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type PrintRequestSortDirection =
  (typeof PrintRequestSortDirection)[keyof typeof PrintRequestSortDirection];

// ~/print-queue/new (印刷を依頼) の用紙寸法ドロップダウン用. 表示ラベルが
// 値そのもの (A3/A4/B5/B4) のため, OrganizationType のような別途の日本語
// ラベル対応表は不要
const PaperSize = {
  A3: "A3",
  A4: "A4",
  B5: "B5",
  B4: "B4",
} as const;

type PaperSize = (typeof PaperSize)[keyof typeof PaperSize];

// 依頼文の記載順 (A3･A4･B5･B4) をそのままドロップダウンの選択肢順にしている
const PAPER_SIZE_OPTIONS: PaperSize[] = [PaperSize.A3, PaperSize.A4, PaperSize.B5, PaperSize.B4];

export {
  PAPER_SIZE_OPTIONS,
  PRINT_REQUEST_STATUS_LABEL,
  PaperSize,
  type PrintRequest,
  PrintRequestSortDirection,
  PrintRequestSortField,
  PrintRequestStatus,
};
