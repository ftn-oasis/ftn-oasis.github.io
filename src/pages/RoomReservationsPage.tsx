import { RoomReservationsSection } from "@src/features/roomReservations/components/RoomReservationsSection";
import { MOCK_ROOM_RESERVATIONS } from "@src/features/roomReservations/mockData";

// ~/room-reservations — NavDrawer の「新館予約状況」/`CreateButton` の
// 「新館の使用を申請」が指す状況確認ページ. 「~/orgs/:orgId/meetings を
// 参考にしてほしい」という依頼のため, PrintQueuePage/DocumentsPage と同じく
// セクションコンポーネントへ全件をそのまま渡すだけの薄いラッパーにしている
function RoomReservationsPage() {
  return <RoomReservationsSection reservations={MOCK_ROOM_RESERVATIONS} />;
}

export { RoomReservationsPage };
