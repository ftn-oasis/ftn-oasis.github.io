import { IconHome, IconPackageExport, type TablerIcon } from "@tabler/icons-react";

type EquipmentFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  // (memberFilters 等と同じ考え方)
  query: string;
};

// EquipmentFilterSidebar/EquipmentLoansSection の両方から使うため (選択中
// 判定/見出し表示で同じ一覧が必要). 依頼文で明示された全て/貸出可の2件のみ
// (構成員一覧の「子組織を含む」「退出済」に相当する概念は無い)
const EQUIPMENT_FILTERS: EquipmentFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "available", icon: IconPackageExport, label: "貸出可", query: "貸出可: true" },
];

export { EQUIPMENT_FILTERS, type EquipmentFilter };
