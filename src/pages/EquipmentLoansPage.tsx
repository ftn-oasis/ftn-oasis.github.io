import { EquipmentLoansSection } from "@src/features/equipmentLoans/components/EquipmentLoansSection";
import { MOCK_EQUIPMENT_ITEMS } from "@src/features/equipmentLoans/mockData";

// ~/equipment-loans — NavDrawer の「備品貸出状況」/`CreateButton` の
// 「備品貸出を申請」が指す状況確認ページ. 「~/orgs/:orgId/members を
// 参考にしてほしい」という依頼のため, PrintQueuePage/RoomReservationsPage と
// 同じくセクションコンポーネントへ全件をそのまま渡すだけの薄いラッパーにしている
function EquipmentLoansPage() {
  return <EquipmentLoansSection items={MOCK_EQUIPMENT_ITEMS} />;
}

export { EquipmentLoansPage };
