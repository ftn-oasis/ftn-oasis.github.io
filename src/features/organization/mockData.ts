// 実データを取得する API が無いため, 組織プロフィールページで使うダミーデータをまとめて置く場所

import { currentUser } from "@src/lib/currentUser";

import { addDays, formatDateTime, formatTime } from "./calendarUtils";
import {
  ActivityType,
  type Activity,
  AgendaItemVoteResult,
  type MeetingAgendaItem,
  type MeetingMaterial,
  MeetingMaterialFileType,
  type MeetingMinutes,
  MeetingStatus,
  type OrganizationDetail,
  type OrganizationDocument,
  type OrganizationMeeting,
  type OrganizationMember,
  type OrganizationTransaction,
  OrganizationType,
  PaymentMethod,
  ReceiptFileType,
  type TransactionLineItem,
  type TransactionProcedureStep,
  TransactionProcedureStepKey,
  type TransactionReceipt,
  TransactionStatus,
} from "./types";

const MOCK_ORGANIZATION: OrganizationDetail = {
  id: "test-org",
  name: "文化祭実行委員会",
  type: OrganizationType.IndependentCommittee,
  description:
    "文化祭の企画・運営を担当する組織です. 各クラス・部活動との連絡調整や, 予算管理を行います.",
  memberCount: 12,
  foundedAt: "2024/04/01",
  ancestorNames: ["生徒会", "代表委員会"],
};

const MEMBER_ROLE_BY_INDEX: Record<number, string> = {
  0: "委員長",
  1: "副委員長",
};
const MEMBER_CLASSES = ["A", "B", "C", "D"];

// 構成員一覧 (/orgs/:orgId/members) の動作確認も兼ねるため, 学年/学級/役職を
// index から機械的に散らして生成している (実際の所属人数と一致させたいため,
// documents/book のような大きめの件数は生成していない)
const MOCK_MEMBERS: OrganizationMember[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `test-org-member-${index + 1}`,
    organizationId: "test-org",
    name: `委員${index + 1}`,
    role: MEMBER_ROLE_BY_INDEX[index] ?? "委員",
    email: `member${index + 1}@example.com`,
    grade: (index % 3) + 1,
    class: MEMBER_CLASSES[index % MEMBER_CLASSES.length],
  }),
);

// タブに表示するダミーの件数. 構成員は MOCK_ORGANIZATION.memberCount と揃えている
const MOCK_TAB_COUNTS = {
  documents: 5,
  book: 14,
  meetings: 9,
  members: MOCK_ORGANIZATION.memberCount,
};

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "activity-1",
    organizationId: "test-org",
    actorName: "委員1",
    occurredAt: "2026/08/15 16:20",
    type: ActivityType.MeetingCreated,
    meetingId: "meeting-1",
    meetingName: "文化祭実行委員会 定例会議",
    startsAt: "2026/08/22 16:00",
    endsAt: "17:00",
    location: "第二会議室",
    attendees: "全ての委員",
    agenda: [
      "前回議事録の確認",
      "各クラス出し物の進捗報告",
      "予算執行状況の確認",
      "当日の役割分担案",
      "備品発注の最終確認",
      "その他連絡事項",
    ],
  },
  {
    id: "activity-2",
    organizationId: "test-org",
    actorName: "委員3",
    occurredAt: "2026/08/14 12:05",
    type: ActivityType.MoneyTransaction,
    transactionId: "transaction-1",
    amount: -8400,
    items: ["装飾用の布地", "ガムテープ・養生テープ", "油性マーカー 1箱"],
  },
  {
    id: "activity-3",
    organizationId: "test-org",
    // features/user/mockData.ts の MOCK_DOCUMENTS (bunkasai-plan) と組織/文書が
    // 同じなので, currentUser.name にしている — /users/test-user 側の
    // 「所属する組織」からこの組織に辿り着けるという繋がりを示すため
    actorName: currentUser.name,
    occurredAt: "2026/08/12 09:40",
    type: ActivityType.DocumentChange,
    documentId: "bunkasai-plan",
    versionId: "v3",
    documentTitle: "文化祭実行計画書",
    changes: ["当日のタイムスケジュールを更新", "雨天時の代替案を追記"],
  },
  {
    id: "activity-4",
    organizationId: "test-org",
    actorName: "委員2",
    occurredAt: "2026/08/09 18:15",
    type: ActivityType.MoneyTransaction,
    transactionId: "transaction-2",
    amount: 30000,
    items: ["生徒会からの活動費支給"],
  },
];

// 文書一覧 (/orgs/:orgId/documents) 用のダミーデータ. ページネーションを実際に
// 確認できるよう, 20件/ページで15ページ分 (300件) を組み合わせで機械的に生成している
const DOCUMENT_TOPICS = [
  "文化祭",
  "体育祭",
  "新入生歓迎会",
  "予算執行",
  "備品管理",
  "広報",
  "安全対策",
  "清掃分担",
  "当日運営",
  "反省会",
];
const DOCUMENT_TITLE_TEMPLATES = [
  "議事録",
  "実施要項",
  "予算案",
  "報告書",
  "企画書",
  "案内文",
  "アンケート集計",
  "マニュアル",
  "チェックリスト",
  "台本",
];
const DOCUMENT_FILE_TYPES = ["PDF", "Markdown", "Text", "MP4"];

// 2025/08/01 を起点に, index が進むほど新しい (作成/編集日時が後ろにずれる) ものとする
const MOCK_DOCUMENT_LIST_BASE_DAY = Date.UTC(2025, 7, 1) / (24 * 60 * 60 * 1000);

function toIsoDate(daysFromEpoch: number): string {
  return new Date(daysFromEpoch * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const MOCK_ORGANIZATION_DOCUMENTS: OrganizationDocument[] = Array.from(
  { length: 300 },
  (_, index) => {
    const topic = DOCUMENT_TOPICS[index % DOCUMENT_TOPICS.length];
    const templateIndex =
      Math.floor(index / DOCUMENT_TOPICS.length) % DOCUMENT_TITLE_TEMPLATES.length;
    const template = DOCUMENT_TITLE_TEMPLATES[templateIndex];
    const fileType = DOCUMENT_FILE_TYPES[index % DOCUMENT_FILE_TYPES.length];
    const createdDay = MOCK_DOCUMENT_LIST_BASE_DAY + index;
    // 編集日は作成日と同じか, 数日後
    const editedDay = createdDay + (index % 5);

    return {
      id: `test-org-doc-${index + 1}`,
      organizationId: "test-org",
      title: `${topic}${template} ${Math.floor(index / DOCUMENT_TOPICS.length) + 1}`,
      description: `${topic}に関する${template}です.`,
      fileType,
      createdAt: toIsoDate(createdDay),
      editedAt: toIsoDate(editedDay),
    };
  },
);

// 入出金一覧 (/orgs/:orgId/book) 用のダミーデータ. ページネーションを実際に確認
// できるよう, 支出/収入それぞれの理由を組み合わせて50件を機械的に生成している
// (index % 3 === 0 のときだけ収入, それ以外は支出 — 実際のクラブ活動は支出の方が
// 多いだろうという想定の比率)
const TRANSACTION_EXPENSE_REASONS = [
  "装飾用の布地",
  "ガムテープ・養生テープ",
  "油性マーカー",
  "印刷用紙・インク",
  "ポスター制作費",
  "差し入れ菓子",
  "備品修理費",
  "交通費",
  "会場使用料",
  "景品購入費",
];
const TRANSACTION_INCOME_REASONS = [
  "生徒会からの活動費支給",
  "参加費徴収",
  "廃品回収収益",
  "PTA からの寄付金",
  "前年度繰越金",
];
const TRANSACTION_METHODS = [
  PaymentMethod.Cash,
  PaymentMethod.BankTransfer,
  PaymentMethod.DirectDebit,
];

// 2025/08/01 を起点に, index が進むほど新しい (作成/編集日時が後ろにずれる) ものとする
const MOCK_TRANSACTION_LIST_BASE_DAY = Date.UTC(2025, 7, 1) / (24 * 60 * 60 * 1000);

// 会計処理詳細ページ (/orgs/:orgId/book/:transactionId) 用のダミーデータ生成.
// createdAt/editedAt (toIsoDate) と同じ UTC 起点の日数で日付を扱うため,
// calendarUtils.formatDateTime (ローカルタイムゾーン基準, 会議のように
// setHours などローカルに構築した Date 向け) は使わず, UTC の getter で
// 独自に整形している — 混在させると calendarUtils.dateKey で踏んだのと同種の
// タイムゾーンずれの不具合になる
function formatEpochDayTime(dayNumber: number, hour: number, minute: number): string {
  const date = new Date(dayNumber * 24 * 60 * 60 * 1000);
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  return `${year}/${month}/${day} ${pad2(hour)}:${pad2(minute)}`;
}

// 合計が total と一致する count 個の正の整数に分割する (最大剰余法の簡易版 —
// 先頭から順に1ずつ多く割り当てて端数を吸収する)
function splitAmount(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

// 金額内訳の個数 (quantity) — 割り切れる場合だけ 3/2 を採用し, それ以外は 1 個
// 扱いにする (unitPrice = subtotal / quantity が必ず整数になるようにするため)
function pickItemQuantity(subtotal: number, seed: number): number {
  const preferred = seed % 2 === 0 ? 3 : 2;
  if (subtotal % preferred === 0) return preferred;
  if (preferred === 3 && subtotal % 2 === 0) return 2;
  return 1;
}

const LINE_ITEM_NAMES = [
  "布地",
  "接着剤",
  "油性マーカー",
  "印刷用紙",
  "インクカートリッジ",
  "ポスター用紙",
  "菓子",
  "工具",
  "ガムテープ",
  "使用料",
  "景品",
  "絵の具",
  "画用紙",
  "リボン",
];
const LINE_ITEM_PURPOSES = [
  "看板の背景を塗るため",
  "掲示物を貼るため",
  "資料を配布するため",
  "備品を補修するため",
  "作業をスムーズに進めるため",
  "当日の移動のため",
  "会場を借りるため",
  "参加者に配るため",
  "記録を残すため",
  "予備として",
];

// 会計処理1件分の金額内訳 (2〜3件) を, 合計が amountAbs (取引の総額) と
// 一致するように生成する
function generateTransactionItems(
  amountAbs: number,
  index: number,
): TransactionLineItem[] {
  const itemCount = index % 2 === 0 ? 2 : 3;
  const subtotals = splitAmount(amountAbs, itemCount);

  return subtotals.map((subtotal, i) => {
    const quantity = pickItemQuantity(subtotal, index + i);
    return {
      id: `test-org-transaction-${index + 1}-item-${i + 1}`,
      name: LINE_ITEM_NAMES[(index + i) % LINE_ITEM_NAMES.length],
      description: LINE_ITEM_PURPOSES[(index + i * 3) % LINE_ITEM_PURPOSES.length],
      unitPrice: subtotal / quantity,
      quantity,
    };
  });
}

// 手続きの各手順の表示ラベル
const PROCEDURE_STEP_LABEL: Record<TransactionProcedureStepKey, string> = {
  [TransactionProcedureStepKey.Proposed]: "起案",
  [TransactionProcedureStepKey.Approved]: "承認",
  [TransactionProcedureStepKey.Paid]: "支払",
  [TransactionProcedureStepKey.Settled]: "清算",
  [TransactionProcedureStepKey.Completed]: "完了",
  [TransactionProcedureStepKey.Denied]: "否認",
};

// status ごとに, 起案からどこまでの手順が完了しているかを示す (否認済は除く —
// 起案の直後に否認ステップで打ち切るため, 通常の手順とは別扱いにしている)
const PROCEDURE_STEP_ORDER = [
  TransactionProcedureStepKey.Proposed,
  TransactionProcedureStepKey.Approved,
  TransactionProcedureStepKey.Paid,
  TransactionProcedureStepKey.Settled,
  TransactionProcedureStepKey.Completed,
];
const COMPLETED_STEP_COUNT_BY_STATUS: Record<TransactionStatus, number> = {
  [TransactionStatus.ApprovalPending]: 1,
  [TransactionStatus.PaymentPending]: 2,
  [TransactionStatus.SettlementPending]: 3,
  [TransactionStatus.Completed]: 5,
  // 否認済は generateTransactionProcedure 側で別処理するため参照しない
  [TransactionStatus.Denied]: 1,
};

// 各手順の担当者ごとに日数/時刻をずらして, 起案日 (createdDay) を起点に生成する
const PROCEDURE_STEP_DAY_OFFSET: Record<string, number> = {
  [TransactionProcedureStepKey.Approved]: 1,
  [TransactionProcedureStepKey.Paid]: 3,
  [TransactionProcedureStepKey.Settled]: 5,
  [TransactionProcedureStepKey.Completed]: 6,
  [TransactionProcedureStepKey.Denied]: 1,
};
const PROCEDURE_STEP_HOUR: Record<string, number> = {
  [TransactionProcedureStepKey.Proposed]: 9,
  [TransactionProcedureStepKey.Approved]: 10,
  [TransactionProcedureStepKey.Paid]: 14,
  [TransactionProcedureStepKey.Settled]: 11,
  [TransactionProcedureStepKey.Completed]: 16,
  [TransactionProcedureStepKey.Denied]: 10,
};

function generateTransactionProcedure(
  status: TransactionStatus,
  createdDay: number,
  proposerName: string,
  index: number,
): TransactionProcedureStep[] {
  const proposedStep: TransactionProcedureStep = {
    key: TransactionProcedureStepKey.Proposed,
    label: PROCEDURE_STEP_LABEL[TransactionProcedureStepKey.Proposed],
    completed: true,
    occurredAt: formatEpochDayTime(
      createdDay,
      PROCEDURE_STEP_HOUR[TransactionProcedureStepKey.Proposed],
      0,
    ),
    actorName: proposerName,
  };

  if (status === TransactionStatus.Denied) {
    const approverName =
      MOCK_MEMBERS[(index + 1) % MOCK_MEMBERS.length]?.name ?? proposerName;
    return [
      proposedStep,
      {
        key: TransactionProcedureStepKey.Denied,
        label: PROCEDURE_STEP_LABEL[TransactionProcedureStepKey.Denied],
        completed: true,
        occurredAt: formatEpochDayTime(
          createdDay + PROCEDURE_STEP_DAY_OFFSET[TransactionProcedureStepKey.Denied],
          PROCEDURE_STEP_HOUR[TransactionProcedureStepKey.Denied],
          30,
        ),
        actorName: approverName,
      },
    ];
  }

  const completedCount = COMPLETED_STEP_COUNT_BY_STATUS[status];
  return PROCEDURE_STEP_ORDER.map((key, stepIndex) => {
    if (key === TransactionProcedureStepKey.Proposed) return proposedStep;
    if (stepIndex >= completedCount) {
      return { key, label: PROCEDURE_STEP_LABEL[key], completed: false };
    }
    const actorName =
      MOCK_MEMBERS[(index + stepIndex) % MOCK_MEMBERS.length]?.name ?? proposerName;
    return {
      key,
      label: PROCEDURE_STEP_LABEL[key],
      completed: true,
      occurredAt: formatEpochDayTime(
        createdDay + PROCEDURE_STEP_DAY_OFFSET[key],
        PROCEDURE_STEP_HOUR[key],
        stepIndex % 2 === 0 ? 0 : 30,
      ),
      actorName,
    };
  });
}

function generateTransactionReceipt(
  index: number,
  proposerName: string,
  createdDay: number,
): TransactionReceipt {
  return {
    documentId: `REC-${String(index + 1).padStart(4, "0")}`,
    fileType: index % 2 === 0 ? ReceiptFileType.Image : ReceiptFileType.Pdf,
    uploaderName: proposerName,
    uploadedAt: formatEpochDayTime(createdDay + 1, 18, 0),
  };
}

// 承認待/支払待/清算待/完了済/否認済 を index から機械的に散らす —
// 実際の部活動では大半の会計処理が最終的に完了するだろうという想定で,
// 完了済の比重を高くしている
const TRANSACTION_STATUS_CYCLE = [
  TransactionStatus.Completed,
  TransactionStatus.Completed,
  TransactionStatus.ApprovalPending,
  TransactionStatus.PaymentPending,
  TransactionStatus.Completed,
  TransactionStatus.SettlementPending,
  TransactionStatus.Completed,
  TransactionStatus.Denied,
  TransactionStatus.ApprovalPending,
  TransactionStatus.Completed,
];

const MOCK_ORGANIZATION_TRANSACTIONS: OrganizationTransaction[] = Array.from(
  { length: 50 },
  (_, index) => {
    const isIncome = index % 3 === 0;
    const reasons = isIncome
      ? TRANSACTION_INCOME_REASONS
      : TRANSACTION_EXPENSE_REASONS;
    const reason = reasons[index % reasons.length];
    // 収入は 3000-30000円, 支出は 500-8500円 程度の範囲に収まるよう機械的に散らす
    const amountAbs = isIncome
      ? 3000 + (index % 10) * 3000
      : 500 + (index % 9) * 1000;
    const amount = isIncome ? amountAbs : -amountAbs;
    const method = TRANSACTION_METHODS[index % TRANSACTION_METHODS.length];
    const createdDay = MOCK_TRANSACTION_LIST_BASE_DAY + index;
    // 編集日は作成日と同じか, 数日後
    const editedDay = createdDay + (index % 3);
    const status = TRANSACTION_STATUS_CYCLE[index % TRANSACTION_STATUS_CYCLE.length];
    const proposerName = MOCK_MEMBERS[index % MOCK_MEMBERS.length]?.name ?? "";

    return {
      id: `test-org-transaction-${index + 1}`,
      organizationId: "test-org",
      title: `${amountAbs}円`,
      description: reason,
      amount,
      method,
      createdAt: toIsoDate(createdDay),
      editedAt: toIsoDate(editedDay),
      status,
      proposerName,
      items: generateTransactionItems(amountAbs, index),
      procedure: generateTransactionProcedure(status, createdDay, proposerName, index),
      receipt: generateTransactionReceipt(index, proposerName, createdDay),
    };
  },
);

// 会議一覧 (/orgs/:orgId/meetings) 用のダミーデータ. カレンダー表示 (今日を含む
// 前後の週) の動作確認も兼ねるため, 今日を基準に -10日〜+9日の20日間, 1日2件ずつ
// (同じ日に複数件を重ねて表示できることも確認できるように) 40件を機械的に生成している
const MEETING_TITLES = [
  "定例会議",
  "実行委員会",
  "予算会議",
  "進捗確認会議",
  "打ち合わせ",
  "全体会議",
  "リーダー会議",
  "反省会",
  "企画会議",
  "調整会議",
];
const MEETING_AGENDA_ITEMS = [
  "前回議事録の確認",
  "進捗報告",
  "予算執行状況の確認",
  "当日の役割分担",
  "備品発注の確認",
  "広報物の確認",
  "スケジュール調整",
  "連絡事項",
  "次回日程の調整",
  "アンケート結果の共有",
];
const MEETING_LOCATIONS = ["第一会議室", "第二会議室", "視聴覚室", "多目的室", "オンライン"];

const MEETING_ANCHOR = new Date();
MEETING_ANCHOR.setHours(0, 0, 0, 0);

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// 会議詳細ページ (/orgs/:orgId/meetings/:meetingId) 用のダミーデータ生成

// 出席者タブ用 — 学年学級の偏りが出ないよう index からの単純なずらしで
// 3〜6人を重複無く選ぶ (MOCK_MEMBERS は12件, 差分2ずつなら6件まで重複しない)
function generateMeetingAttendees(meetingIndex: number): OrganizationMember[] {
  const count = 3 + (meetingIndex % 4);
  return Array.from(
    { length: count },
    (_, i) => MOCK_MEMBERS[(meetingIndex + i * 2) % MOCK_MEMBERS.length],
  );
}

// 議題タブ用 — 議決結果は「否認/延会/議決の概念が無い/可決」を巡回させ,
// 赤い IconX (否決)/subtext1 の IconTriangle (延会) の両方の見た目を実際に
// 確認できるようにしている (MeetingAgendaList を参照. 可決/概念無しは
// どちらもアイコンを表示しない — 依頼で明示的にアイコンが指定されたのは
// 否決/延会の2つだけだったため). 提出者は MOCK_MEMBERS から1件選び,
// その name/role をそのまま使う (別の役職名を新設せず, 構成員一覧と同じ
// 役職表記に揃えるため)
const AGENDA_VOTE_RESULT_CYCLE = [
  undefined,
  undefined,
  AgendaItemVoteResult.Approved,
  AgendaItemVoteResult.Approved,
  AgendaItemVoteResult.Rejected,
  AgendaItemVoteResult.Postponed,
];

function generateAgendaItems(
  meetingIndex: number,
  agendaCount: number,
): MeetingAgendaItem[] {
  return Array.from({ length: agendaCount }, (_, i) => {
    const label = MEETING_AGENDA_ITEMS[(meetingIndex + i) % MEETING_AGENDA_ITEMS.length];
    const voteResult =
      AGENDA_VOTE_RESULT_CYCLE[(meetingIndex + i) % AGENDA_VOTE_RESULT_CYCLE.length];
    const submitter = MOCK_MEMBERS[(meetingIndex + i * 3) % MOCK_MEMBERS.length];

    return {
      label,
      voteResult,
      submitterName: submitter.name,
      submitterRole: submitter.role,
    };
  });
}

const MATERIAL_TYPE_CYCLE = [
  MeetingMaterialFileType.Markdown,
  MeetingMaterialFileType.Pdf,
  MeetingMaterialFileType.Text,
  MeetingMaterialFileType.Video,
  MeetingMaterialFileType.Transaction,
];
const MATERIAL_NAME_BY_TYPE: Record<string, string[]> = {
  [MeetingMaterialFileType.Markdown]: ["議事録.md", "進捗メモ.md", "検討事項.md"],
  [MeetingMaterialFileType.Pdf]: ["配布資料.pdf", "アンケート結果.pdf", "企画書.pdf"],
  [MeetingMaterialFileType.Text]: ["連絡事項.txt", "メモ.txt"],
  [MeetingMaterialFileType.Video]: ["説明動画.mp4", "記録映像.mp4"],
};
const MATERIAL_PREVIEW_TEXT: Record<string, string> = {
  [MeetingMaterialFileType.Markdown]:
    "## 概要\n\nこれはダミーの Markdown プレビューです. 実際のファイル内容はまだ保存されていません.\n\n- 検討事項A\n- 検討事項B",
  [MeetingMaterialFileType.Text]:
    "これはダミーのテキストプレビューです. 実際のファイル内容はまだ保存されていません.",
};

// 資料タブ用 — 議題ごとに1〜2件, 会議1件あたり2〜4件を機械的に生成する.
// 種別を一定間隔で会計処理 (MeetingMaterialFileType.Transaction) にし,
// 実在する MOCK_ORGANIZATION_TRANSACTIONS を参照させる (「../../book/会計処理ID
// のページをリンクではなくメインの中に同じ内容を表示する」という依頼のため.
// 実際の埋め込み表示は EmbeddedTransactionView が担う)
function generateMeetingMaterials(
  meetingIndex: number,
  agenda: MeetingAgendaItem[],
): MeetingMaterial[] {
  const materialCount = 2 + (meetingIndex % 3);

  return Array.from({ length: materialCount }, (_, i) => {
    const agendaItem = agenda[i % agenda.length].label;
    const fileType = MATERIAL_TYPE_CYCLE[(meetingIndex + i) % MATERIAL_TYPE_CYCLE.length];
    const id = `test-org-meeting-${meetingIndex + 1}-material-${i + 1}`;

    if (fileType === MeetingMaterialFileType.Transaction) {
      const transaction =
        MOCK_ORGANIZATION_TRANSACTIONS[
          (meetingIndex * 3 + i) % MOCK_ORGANIZATION_TRANSACTIONS.length
        ];
      return {
        id,
        agendaItem,
        name: `会計処理: ${transaction.description}`,
        fileType,
        transactionId: transaction.id,
      };
    }

    const names = MATERIAL_NAME_BY_TYPE[fileType];
    const name = names[(meetingIndex + i) % names.length];
    const content = MATERIAL_PREVIEW_TEXT[fileType];

    return { id, agendaItem, name, fileType, content };
  });
}

// 議事録タブ用 — 依頼で共有された frontmatter+発言者形式の Markdown 書式
// (minutesMarkdown.ts が解析する形式) でダミーの議事録本文を生成する.
// 出席者 (attendees) を発言者 (speakers) としてそのまま使う — 短い ID
// (frontmatter の "tanaka" のような形式) は member.id の末尾の番号から
// 機械的に組み立てている (例: test-org-member-5 → m5)
function minutesSpeakerId(member: OrganizationMember): string {
  return `m${member.id.split("-").pop()}`;
}

// ローカルタイムゾーン基準で "YYYY-MM-DD" を組み立てる. calendarUtils.formatDate
// は "YYYY/MM/DD" (スラッシュ) のため, frontmatter の date フィールド用に
// ハイフン区切りで別途組み立てている (toIsoDate のような UTC 起点の日数では
// なく, 会議自体の startsAt と同じくローカルに構築した Date が入る想定)
function toDashedDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// 議決結果は「[決定] は表示しなくて構いません」という依頼により別枠の
// リスト項目にはせず, 発言記録の中で発言者自身が述べる形にしている
// (逐語録である以上, 議決の結果も本来は誰かの発言として記録されるはずのため)
const MINUTES_APPROVED_TEXTS = [
  "それでは採決します。賛成多数により、原案どおり可決とします。",
  "それでは採決します。賛成多数により、一部修正のうえ可決とします。",
];
const MINUTES_REJECTED_TEXTS = ["それでは採決します。反対多数により、否決とします。"];
const MINUTES_POSTPONED_TEXTS = ["本日は結論が出ませんでしたので、継続審議とし、次回に持ち越します。"];
const MINUTES_HOMEWORK_TEXTS = [
  "業者見積もりの再取得",
  "関係部署への確認",
  "資料の追加準備",
];
const MINUTES_REMARK_TEXTS = [
  "資料の配布が遅れたため5分間の閲覧時間を設けた",
  "オンライン参加者の音声が一部聞き取りにくかった",
];

// 議題1件分の発言 (`@id: 発言内容` 形式のチャンク文字列の配列) を組み立てる.
// 「議題ごとに見出しで分割せず, 発言を全て記録する逐語録のようにしてほしい」
// という依頼のため, `## 議題N` の見出しは持たず, 議題をまたいでそのまま
// 連続した発言記録の一部として繋げられる形にしている (呼び出し元
// buildMinutesContent 側で全議題分をまとめて1つの発言記録にする).
// 最初の発言 (議題の切り出し) は複数行 (改行を挟んだ続きの発言) にし,
// 採決がある場合は同じ発言者の発言に賛否の内訳を箇条書きで続ける — どちらも
// 「発言内容の部分には改行や箇条書きが使える」ことを示すための構成
function buildMinutesAgendaTurns(
  agendaIndex: number,
  seed: number,
  item: MeetingAgendaItem,
  sessionAttendees: OrganizationMember[],
  sessionDate: Date,
): string[] {
  const speakerAId = minutesSpeakerId(sessionAttendees[agendaIndex % sessionAttendees.length]);
  const speakerB = sessionAttendees[(agendaIndex + 1) % sessionAttendees.length];
  const speakerBId = minutesSpeakerId(speakerB);

  const chunks: string[] = [
    [
      `@${speakerAId}: それでは議題${agendaIndex + 1}に入ります。${item.label}について説明します。`,
      "資料を配布していますのでご確認ください。",
    ].join("\n"),
    `@${speakerBId}: 承知しました。よろしくお願いします。`,
  ];

  if (item.voteResult !== undefined) {
    const forCount = 5 + (seed % 3);
    const againstCount = item.voteResult === AgendaItemVoteResult.Approved ? 0 : forCount - 1;
    const holdCount = seed % 2;
    const voteText =
      item.voteResult === AgendaItemVoteResult.Approved
        ? MINUTES_APPROVED_TEXTS[seed % MINUTES_APPROVED_TEXTS.length]
        : item.voteResult === AgendaItemVoteResult.Rejected
          ? MINUTES_REJECTED_TEXTS[seed % MINUTES_REJECTED_TEXTS.length]
          : MINUTES_POSTPONED_TEXTS[seed % MINUTES_POSTPONED_TEXTS.length];

    chunks.push(
      [
        `@${speakerAId}: ${voteText}`,
        `- 賛成: ${forCount}名 / 反対: ${againstCount}名 / 保留: ${holdCount}名`,
      ].join("\n"),
    );
  }

  if (seed % 2 === 0) {
    chunks.push(`> (補足) ${MINUTES_REMARK_TEXTS[seed % MINUTES_REMARK_TEXTS.length]}`);
  }

  if (item.voteResult === undefined) {
    const dueDate = toDashedDate(addDays(sessionDate, 14));
    chunks.push(
      `- [宿題] ${speakerB.name} ${MINUTES_HOMEWORK_TEXTS[seed % MINUTES_HOMEWORK_TEXTS.length]} 期限:${dueDate}`,
    );
  }

  return chunks;
}

function buildMinutesContent(
  meetingIndex: number,
  sessionIndex: number,
  title: string,
  location: string,
  sessionDate: Date,
  sessionAttendees: OrganizationMember[],
  agenda: MeetingAgendaItem[],
): string {
  const speakerIds = sessionAttendees.map(minutesSpeakerId);
  const chairId = speakerIds[0];
  const recorderId = speakerIds[1] ?? speakerIds[0];
  const absentMember =
    MOCK_MEMBERS[(meetingIndex + sessionIndex) % MOCK_MEMBERS.length];
  const isAbsent = !sessionAttendees.some(
    (member) => member.id === absentMember.id,
  );

  const speakersYaml = sessionAttendees
    .map(
      (member) =>
        `  ${minutesSpeakerId(member)}:  { name: ${member.name}, role: ${member.role} }`,
    )
    .join("\n");
  const startTime = formatTime(sessionDate);
  // 会議時間は80分と仮定した終了時刻
  const endTime = formatTime(new Date(sessionDate.getTime() + 80 * 60 * 1000));

  const frontmatterLines = [
    "---",
    `meeting_id: ${meetingIndex + 1}-${sessionIndex + 1}`,
    `title: ${title} (第${sessionIndex + 1}回)`,
    `date: ${toDashedDate(sessionDate)}`,
    `time: "${startTime}-${endTime}"`,
    `place: ${location}`,
    `chair: ${chairId}`,
    `recorder: ${recorderId}`,
    "visibility: internal   # internal / public",
    "speakers:",
    speakersYaml,
    `attendees: [${speakerIds.join(", ")}]`,
    `absentees: [${isAbsent ? minutesSpeakerId(absentMember) : ""}]`,
    "---",
  ];

  // 全議題分の発言を, 議題の切れ目に関わらずそのまま1本につなげ (見出しで
  // 分割しない逐語録), 最後に議長の閉会の発言を加える. 「議事録の部分を ``` で
  // 囲うことで議事録の本文を表してほしい」という依頼のため, 発言記録全体を
  // 1つのフェンス付きコードブロックとして囲む (minutesMarkdown.ts の
  // isTranscriptFence が, 中身が `@id:` で始まっていることを見て発言記録として
  // 解析する)
  const agendaChunks = agenda.flatMap((item, i) =>
    buildMinutesAgendaTurns(i, meetingIndex + sessionIndex + i, item, sessionAttendees, sessionDate),
  );
  agendaChunks.push(`@${chairId}: 本日の議題は以上です。これにて${title}を終了します。`);

  const transcript = ["```", agendaChunks.join("\n\n"), "```"].join("\n");

  return `${frontmatterLines.join("\n")}\n\n${transcript}\n`;
}

// ほとんどの会議は1回開催 (配列1件) だが, 一部は複数回に分けて開催された
// 想定で2〜3件生成する (「会議が1度のときはサイドバーを表示せず, 2回以上
// 開催されたときにサイドバーが出現する」という MeetingMinutesExplorer 側の
// 分岐を両方確認できるようにするため). 各回の日付は最終回 (= その会議自体の
// startsAt) から遡って1週間おきにしている
function generateMeetingMinutes(
  index: number,
  startsAt: Date,
  title: string,
  location: string,
  attendees: OrganizationMember[],
  agenda: MeetingAgendaItem[],
): MeetingMinutes[] {
  const sessionCount = index % 8 === 0 ? 3 : index % 4 === 0 ? 2 : 1;

  return Array.from({ length: sessionCount }, (_, i) => {
    const sessionDate = addDays(startsAt, -(sessionCount - 1 - i) * 7);
    return {
      id: `test-org-meeting-${index + 1}-minutes-${i + 1}`,
      sessionLabel: `第${i + 1}回`,
      occurredAt: formatDateTime(sessionDate),
      content: buildMinutesContent(
        index,
        i,
        title,
        location,
        sessionDate,
        attendees,
        agenda,
      ),
    };
  });
}

const MOCK_ORGANIZATION_MEETINGS: OrganizationMeeting[] = Array.from(
  { length: 40 },
  (_, index) => {
    const dayOffset = Math.floor(index / 2) - 10;
    const startsAt = addDays(MEETING_ANCHOR, dayOffset);
    startsAt.setHours(15 + (index % 3), index % 2 === 0 ? 0 : 30, 0, 0);
    // 予定日時 (会議が登録された日時) は開催の1週間前としている
    const scheduledAt = addDays(startsAt, -7);

    const status =
      index % 9 === 0
        ? MeetingStatus.Postponed
        : index % 11 === 0
          ? MeetingStatus.Canceled
          : MeetingStatus.Normal;
    const agendaCount = 2 + (index % 3);
    const agenda = generateAgendaItems(index, agendaCount);
    const title = MEETING_TITLES[index % MEETING_TITLES.length];
    const location = MEETING_LOCATIONS[index % MEETING_LOCATIONS.length];
    const attendees = generateMeetingAttendees(index);

    return {
      id: `test-org-meeting-${index + 1}`,
      organizationId: "test-org",
      title,
      agenda,
      location,
      status,
      startsAt: toIsoDateTime(startsAt),
      scheduledAt: toIsoDateTime(scheduledAt),
      attendees,
      materials: generateMeetingMaterials(index, agenda),
      minutes: generateMeetingMinutes(
        index,
        startsAt,
        title,
        location,
        attendees,
        agenda,
      ),
    };
  },
);

export {
  MOCK_ACTIVITIES,
  MOCK_MEMBERS,
  MOCK_ORGANIZATION,
  MOCK_ORGANIZATION_DOCUMENTS,
  MOCK_ORGANIZATION_MEETINGS,
  MOCK_ORGANIZATION_TRANSACTIONS,
  MOCK_TAB_COUNTS,
};
