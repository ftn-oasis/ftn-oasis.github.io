// ~/equipment-loans (グローバル, 組織/文書には紐付かない) 用の型.
// 「~/orgs/:orgId/members (OrganizationMember/OrganizationMembersSection)
// を参考にしてほしい」という依頼のため一覧の構造 (検索バー+フィルターサイド
// バー+ソート+ページネーション付き一覧 Box) は近い形にしているが, 備品貸出は
// 組織/文書に紐付かないグローバルな概念のため features/equipmentLoans/ として
// 独立させている (features/notifications/ と同じ考え方). 依頼された項目
// (備品名/ラベル/個数) が構成員 (アバター+名前/役職+メール+学年学級) とは
// 全く異なるため, 型も独自に定義している
const EquipmentAvailability = {
  // 貸出可 (green のラベル)
  Available: "available",
  // 貸出中 (red のラベル)
  Lent: "lent",
} as const;

type EquipmentAvailability =
  (typeof EquipmentAvailability)[keyof typeof EquipmentAvailability];

type EquipmentItem = {
  id: string;
  // 備品名
  name: string;
  availability: EquipmentAvailability;
  // 個数
  quantity: number;
};

const EquipmentSortField = {
  Name: "name",
  Quantity: "quantity",
  Availability: "availability",
} as const;

type EquipmentSortField = (typeof EquipmentSortField)[keyof typeof EquipmentSortField];

const EquipmentSortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

type EquipmentSortDirection =
  (typeof EquipmentSortDirection)[keyof typeof EquipmentSortDirection];

export {
  EquipmentAvailability,
  type EquipmentItem,
  EquipmentSortDirection,
  EquipmentSortField,
};
