import { addDays } from "@src/features/organization/calendarUtils";
import { CURRENT_USER_AS_MEMBER, MOCK_MEMBERS, MOCK_ORGANIZATION } from "@src/features/organization/mockData";

import type { RoomReservation } from "./types";

// MOCK_ORGANIZATION_MEETINGS (features/organization/mockData.ts) と同じく,
// 実際にデータを持つ組織は test-org のみ — 新館予約も同様に全件 test-org とする
const ROOM_NAMES = [
  "新館 第一会議室",
  "新館 多目的ホール",
  "新館 音楽室",
  "新館 調理実習室",
  "新館 視聴覚室",
  "新館 和室",
];

const RESERVATION_TITLES = [
  "文化祭実行委員会 打ち合わせ",
  "吹奏楽部 合奏練習",
  "美術部 展示準備",
  "生徒会 定例会議",
  "料理研究部 調理実習",
  "軽音楽部 練習",
  "茶道部 稽古",
  "新聞部 編集会議",
  "有志団体 企画会議",
  "同窓会 打ち合わせ",
];

const RESERVATION_PURPOSES = [
  "文化祭の展示内容についての打ち合わせです.",
  "定期演奏会に向けた合奏練習です.",
  "文化祭展示の準備作業です.",
  "生徒会の定例議事のための会議です.",
  "調理実習のための部活動利用です.",
  "文化祭ステージ発表に向けた練習です.",
  "部活動の稽古のための利用です.",
  "校内新聞の編集作業のための利用です.",
  "有志団体の企画についての打ち合わせです.",
  "同窓会運営の打ち合わせです.",
];

// 新館予約の基準日 — 会議一覧の MEETING_ANCHOR と同じ考え方で, 実行時の
// 実際の日付を起点にする (固定の過去日付ではない — 「今日」との位置関係を
// 常に確認できるようにするため)
const ROOM_RESERVATION_ANCHOR = new Date();
ROOM_RESERVATION_ANCHOR.setHours(0, 0, 0, 0);

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// 参加者用 — 学年学級の偏りが出ないよう index からの単純なずらしで
// 2〜4人を重複無く選ぶ (generateMeetingAttendees と同じ考え方)
function generateAttendees(index: number) {
  const count = 2 + (index % 3);
  return Array.from(
    { length: count },
    (_, i) => MOCK_MEMBERS[(index + i * 3) % MOCK_MEMBERS.length],
  );
}

const TOTAL_RESERVATIONS = 40;

const MOCK_ROOM_RESERVATIONS: RoomReservation[] = Array.from(
  { length: TOTAL_RESERVATIONS },
  (_, index) => {
    // 1日2件ずつ, 今日を中心に前後に広げる (カレンダーモードで1つの日付
    // セルに複数件積み上がる見た目も確認できるように — 会議一覧のモック
    // データと同じ考え方)
    const dayOffset = Math.floor(index / 2) - 10;
    const startsAt = addDays(ROOM_RESERVATION_ANCHOR, dayOffset);
    startsAt.setHours(9 + (index % 5) * 2, index % 2 === 0 ? 0 : 30, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 1, endsAt.getMinutes() + (index % 2 === 0 ? 30 : 0));
    // 予約登録日時は利用日の3日前としている
    const scheduledAt = addDays(startsAt, -3);

    return {
      id: `room-reservation-${index + 1}`,
      title: RESERVATION_TITLES[index % RESERVATION_TITLES.length],
      purpose: RESERVATION_PURPOSES[index % RESERVATION_PURPOSES.length],
      organizationId: MOCK_ORGANIZATION.id,
      roomName: ROOM_NAMES[index % ROOM_NAMES.length],
      startsAt: toIsoDateTime(startsAt),
      endsAt: toIsoDateTime(endsAt),
      scheduledAt: toIsoDateTime(scheduledAt),
      attendees: generateAttendees(index),
    };
  },
);

// 今日利用予定の予約の参加者に currentUser を加える — 文書詳細ページ等の
// CURRENT_USER_AS_MEMBER と同じ, 生成後に一部だけ書き換える手法
const TODAY_DATE_KEY = toIsoDateTime(ROOM_RESERVATION_ANCHOR).slice(0, 10);
MOCK_ROOM_RESERVATIONS.forEach((reservation) => {
  if (!reservation.startsAt.startsWith(TODAY_DATE_KEY)) return;
  reservation.attendees = [...reservation.attendees, CURRENT_USER_AS_MEMBER];
});

export { MOCK_ROOM_RESERVATIONS, ROOM_NAMES };
