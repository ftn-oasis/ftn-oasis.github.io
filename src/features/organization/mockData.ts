// 実データを取得する API が無いため, 組織プロフィールページで使うダミーデータをまとめて置く場所

import { currentUser } from "@src/lib/currentUser";

import { addDays } from "./calendarUtils";
import {
  ActivityType,
  type Activity,
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
    const agenda = Array.from(
      { length: agendaCount },
      (_, i) => MEETING_AGENDA_ITEMS[(index + i) % MEETING_AGENDA_ITEMS.length],
    );

    return {
      id: `test-org-meeting-${index + 1}`,
      organizationId: "test-org",
      title: MEETING_TITLES[index % MEETING_TITLES.length],
      agenda,
      location: MEETING_LOCATIONS[index % MEETING_LOCATIONS.length],
      status,
      startsAt: toIsoDateTime(startsAt),
      scheduledAt: toIsoDateTime(scheduledAt),
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
