// 実データを取得する API が無いため, 組織プロフィールページで使うダミーデータをまとめて置く場所

import { currentUser } from "@src/lib/currentUser";

import {
  ActivityType,
  type Activity,
  type OrganizationDetail,
  type OrganizationMember,
  OrganizationType,
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

const MOCK_MEMBERS: OrganizationMember[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `test-org-member-${index + 1}`,
    name: `委員${index + 1}`,
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
    // features/user/mockData.ts の MOCK_DOCUMENTS (bunkasai-plan) の
    // lastEditedBy と揃えている — /users/test-user のカードとこの活動が
    // 同じ編集を指している, というつながりを確認できるようにするため
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

export { MOCK_ACTIVITIES, MOCK_MEMBERS, MOCK_ORGANIZATION, MOCK_TAB_COUNTS };
