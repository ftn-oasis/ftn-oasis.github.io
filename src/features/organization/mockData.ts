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

    return {
      id: `test-org-transaction-${index + 1}`,
      organizationId: "test-org",
      title: `${amountAbs}円`,
      description: reason,
      amount,
      method,
      createdAt: toIsoDate(createdDay),
      editedAt: toIsoDate(editedDay),
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
