import {
  IconArchive,
  IconCalendarEvent,
  IconHome,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

type RoomReservationFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  // (documentFilters.ts/meetingFilters.ts と同じ考え方)
  query: string;
};

// RoomReservationFilterSidebar/RoomReservationsSection の両方から使うため
// (選択中判定/見出し表示で同じ一覧が必要). "upcoming"/"past" の2件は
// カレンダーモードでは (meetingFilters.ts の DATE_RANGE_FILTER_KEYS と
// 同じ理由で) 非表示にし, 全て/要参加の2件だけを残す
const ROOM_RESERVATION_FILTERS: RoomReservationFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "required", icon: IconUsers, label: "要参加", query: "参加者: @私" },
  {
    key: "upcoming",
    icon: IconCalendarEvent,
    label: "使用予定",
    query: "利用日: 未来",
  },
  { key: "past", icon: IconArchive, label: "過去の利用", query: "利用日: 過去" },
];

export { type RoomReservationFilter, ROOM_RESERVATION_FILTERS };
