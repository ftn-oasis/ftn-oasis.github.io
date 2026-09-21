import { EquipmentAvailability, type EquipmentItem } from "./types";

const EQUIPMENT_NAMES = [
  "プロジェクター",
  "ハンディカメラ",
  "延長コード",
  "可動式ホワイトボード",
  "拡声器",
  "折り畳みテーブル",
  "パイプ椅子",
  "ブルーシート",
  "工具セット",
  "救急セット",
  "テント",
  "発電機",
  "スクリーン",
  "ワイヤレスマイク",
  "音響ミキサー",
];

const TOTAL_EQUIPMENT_ITEMS = 30;

// 3件に1件を貸出中にする (貸出可のほうが多い, という想定の比率 —
// MOCK_ORGANIZATION_TRANSACTIONS の支出/収入比率と同じ考え方)
const MOCK_EQUIPMENT_ITEMS: EquipmentItem[] = Array.from(
  { length: TOTAL_EQUIPMENT_ITEMS },
  (_, index) => ({
    id: `equipment-item-${index + 1}`,
    name: `${EQUIPMENT_NAMES[index % EQUIPMENT_NAMES.length]} ${index + 1}`,
    availability:
      index % 3 === 0 ? EquipmentAvailability.Lent : EquipmentAvailability.Available,
    quantity: 1 + (index % 10) * 2,
  }),
);

export { MOCK_EQUIPMENT_ITEMS };
