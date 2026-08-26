import { PrintQueueSection } from "@src/features/printQueue/components/PrintQueueSection";
import { MOCK_PRINT_REQUESTS } from "@src/features/printQueue/mockData";

// ~/print-queue — NavDrawer/CreateButton の「印刷状況」/「印刷を依頼」が
// 指す状況確認ページ. 「~/documents を参考にしてほしい」という依頼のため,
// DocumentsPage と同じくセクションコンポーネントへ全件をそのまま渡すだけの
// 薄いラッパーにしている
function PrintQueuePage() {
  return <PrintQueueSection printRequests={MOCK_PRINT_REQUESTS} />;
}

export { PrintQueuePage };
