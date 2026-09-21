import { TransactionItemsList } from "@src/features/organization/components/TransactionItemsList";
import type { OrganizationTransaction } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 金額内訳タブ (/orgs/:orgId/book/:transactionId, index route). 会計処理の
// 存在チェックは親の OrganizationTransactionLayout が行い, その結果を
// Outlet の context 経由で受け取るだけの薄いラッパー
function OrganizationTransactionBreakdownPage() {
  const transaction = useOutletContext<OrganizationTransaction>();

  return <TransactionItemsList items={transaction.items} />;
}

export { OrganizationTransactionBreakdownPage };
