import { NotificationsSection } from "@src/features/notifications/components/NotificationsSection";
import { MOCK_NOTIFICATIONS } from "@src/features/notifications/mockData";

// ~/notifications (/notifications) — Header/NavDrawer の「全ての通知」が
// 指すページ. 組織/文書には紐付かないグローバルな一覧
function NotificationsPage() {
  return <NotificationsSection notifications={MOCK_NOTIFICATIONS} />;
}

export { NotificationsPage };
