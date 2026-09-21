import type { OrganizationMember } from "@src/features/organization/types";

// ~/room-reservations (グローバル, 組織/文書には紐付かない) 用の型.
// 「~/orgs/:orgId/meetings (OrganizationMeeting/OrganizationMeetingsSection)
// を参考にしてほしい」という依頼のため近い形にしているが, 新館予約は
// 組織/文書に紐付かないグローバルな概念のため features/roomReservations/
// として独立させている (features/notifications/ と同じ考え方). 会議のような
// 延会/流会の概念は無いため MeetingStatus に相当する型は持たせていない
type RoomReservation = {
  id: string;
  // 予約名 (例: "文化祭実行委員会 打ち合わせ")
  title: string;
  // 用途の概要
  purpose: string;
  organizationId: string;
  // 予約した新館の部屋名
  roomName: string;
  // 利用開始/終了日時. ソート/カレンダー表示用. 画面にはそのまま表示せず,
  // 都度整形して使う ISO 形式 ("YYYY-MM-DDTHH:mm") の文字列
  // (OrganizationMeeting.startsAt と同じ考え方)
  startsAt: string;
  endsAt: string;
  // 予約登録日時 (ソート用の2本目の日付, OrganizationMeeting.scheduledAt
  // と同じ考え方)
  scheduledAt: string;
  // 参加者. 「要参加」フィルター (参加者に自分が含まれるか) の判定に使う想定
  // (フィルター自体はまだ実装していない). OrganizationMeeting.attendees と
  // 同じく, ID 参照ではなく OrganizationMember を直接埋め込んでいる
  attendees: OrganizationMember[];
};

const RoomReservationSortField = {
  StartsAt: "startsAt",
  ScheduledAt: "scheduledAt",
  Title: "title",
} as const;

type RoomReservationSortField =
  (typeof RoomReservationSortField)[keyof typeof RoomReservationSortField];

const RoomReservationSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type RoomReservationSortDirection =
  (typeof RoomReservationSortDirection)[keyof typeof RoomReservationSortDirection];

export {
  type RoomReservation,
  RoomReservationSortDirection,
  RoomReservationSortField,
};
