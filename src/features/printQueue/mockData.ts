import { MOCK_MEMBERS, MOCK_ORGANIZATION } from "@src/features/organization/mockData";

import { type PrintRequest, PrintRequestStatus } from "./types";

// MOCK_ORGANIZATION_DOCUMENTS 等 (features/organization/mockData.ts) と同じく,
// 実際にデータを持つ組織は test-org のみ — 印刷依頼も同様に全件 test-org とする
const PRINT_REQUEST_TITLES = [
  "文化祭パンフレット",
  "生徒会だより",
  "部活動紹介ポスター",
  "体育祭プログラム",
  "文化祭チケット",
  "委員会活動報告書",
  "新入生歓迎パンフレット",
  "学級通信",
  "進路説明会資料",
  "文化祭アンケート用紙",
];

const PRINT_REQUEST_DESCRIPTIONS = [
  "文化祭当日に配布するパンフレットです.",
  "今月号の生徒会だよりです.",
  "各部活動の紹介ポスターです.",
  "体育祭当日に配布するプログラムです.",
  "文化祭の入場チケットです.",
  "委員会の活動報告書です.",
  "新入生向けの学校紹介パンフレットです.",
  "学級担任からの通信です.",
  "進路説明会で配布する資料です.",
  "文化祭来場者向けのアンケート用紙です.",
];

// 依頼中/印刷待/受取待/完了済/取消済の分布に偏りを持たせる (完了済が多め,
// 取消済は少なめ, というのが実態に近いだろうという判断) ための循環パターン
const STATUS_CYCLE: PrintRequestStatus[] = [
  PrintRequestStatus.Completed,
  PrintRequestStatus.Queued,
  PrintRequestStatus.Completed,
  PrintRequestStatus.AwaitingPickup,
  PrintRequestStatus.Requesting,
  PrintRequestStatus.Completed,
  PrintRequestStatus.Queued,
  PrintRequestStatus.Canceled,
  PrintRequestStatus.Completed,
  PrintRequestStatus.AwaitingPickup,
];

const TOTAL_PRINT_REQUESTS = 45;

// 状態ごとに, 依頼日からどれくらい日数が経って最後に更新されたかの目安
// (依頼中はまだ何も進んでいないため 0, 完了済/取消済は数日かけて進む, という
// 想定)
function updatedOffsetForStatus(status: PrintRequestStatus, index: number): number {
  switch (status) {
    case PrintRequestStatus.Requesting:
      return 0;
    case PrintRequestStatus.Queued:
      return 1;
    case PrintRequestStatus.AwaitingPickup:
      return 2 + (index % 2);
    case PrintRequestStatus.Completed:
    case PrintRequestStatus.Canceled:
      return 3 + (index % 3);
  }
}

// 依頼日時の基準日 — 今日から遡って生成することで, 実行時の実際の日付を
// 起点にした「最近の依頼」に見えるようにする (会議一覧の MEETING_ANCHOR と
// 同じ考え方. 固定の過去日付にはしていない)
const PRINT_QUEUE_ANCHOR_DAY = Math.floor(Date.now() / (24 * 60 * 60 * 1000));

function toIsoDate(daysFromEpoch: number): string {
  return new Date(daysFromEpoch * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const MOCK_PRINT_REQUESTS: PrintRequest[] = Array.from(
  { length: TOTAL_PRINT_REQUESTS },
  (_, index) => {
    const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
    // 依頼が新しいものほど index が小さくなるよう, 直近から2日おきに遡る
    const createdDay = PRINT_QUEUE_ANCHOR_DAY - index * 2;
    const updatedDay = createdDay + updatedOffsetForStatus(status, index);

    return {
      id: `print-request-${index + 1}`,
      title: `${PRINT_REQUEST_TITLES[index % PRINT_REQUEST_TITLES.length]} ${index + 1}`,
      description: PRINT_REQUEST_DESCRIPTIONS[index % PRINT_REQUEST_DESCRIPTIONS.length],
      organizationId: MOCK_ORGANIZATION.id,
      requesterName: MOCK_MEMBERS[index % MOCK_MEMBERS.length]?.name ?? "",
      status,
      copies: 10 + (index % 5) * 20,
      pages: 4 + (index % 4) * 4,
      createdAt: toIsoDate(createdDay),
      updatedAt: toIsoDate(updatedDay),
    };
  },
);

export { MOCK_PRINT_REQUESTS };
