import { OrganizationBookSection } from "@src/features/organization/components/OrganizationBookSection";
import { MOCK_ORGANIZATION_TRANSACTIONS } from "@src/features/organization/mockData";

// ~/book — Header/NavDrawer の「全ての会計申請」が指すページ.
// DocumentsPage と同じ考え方で, OrganizationBookSection (残高/収入/支出の
// TransactionSummaryBox を含む) をそのまま再利用し, 組織で絞り込まない
// 全件 (MOCK_ORGANIZATION_TRANSACTIONS) を渡している — 残高等の集計も
// 組織を横断した合計になる
function BookPage() {
  return <OrganizationBookSection transactions={MOCK_ORGANIZATION_TRANSACTIONS} />;
}

export { BookPage };
