import {
  IconCheck,
  IconHome,
  IconStackPop,
  IconStackPush,
  IconUser,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";

import { PRINT_REQUEST_STATUS_LABEL, PrintRequestStatus } from "./types";

type PrintRequestFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  // (DocumentFilterSidebar/getDocumentFilters と同じ考え方)
  query: string;
};

// PrintRequestFilterSidebar/PrintQueueSection の両方で必要 (選択中判定/見出し
// 表示) なため, コンポーネントファイルではなくこちらに切り出している
// (documentFilters.ts と同じ理由)
const PRINT_REQUEST_FILTERS: PrintRequestFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  {
    key: "requesting",
    icon: IconUser,
    label: PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Requesting],
    query: `状態: ${PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Requesting]}`,
  },
  {
    key: "queued",
    icon: IconStackPush,
    label: PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Queued],
    query: `状態: ${PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Queued]}`,
  },
  {
    key: "awaiting-pickup",
    icon: IconStackPop,
    label: PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.AwaitingPickup],
    query: `状態: ${PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.AwaitingPickup]}`,
  },
  {
    key: "completed",
    icon: IconCheck,
    label: PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Completed],
    query: `状態: ${PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Completed]}`,
  },
  {
    key: "canceled",
    icon: IconX,
    label: PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Canceled],
    query: `状態: ${PRINT_REQUEST_STATUS_LABEL[PrintRequestStatus.Canceled]}`,
  },
];

export { type PrintRequestFilter, PRINT_REQUEST_FILTERS };
