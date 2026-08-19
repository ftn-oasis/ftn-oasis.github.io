import { TransactionReceiptBox } from "@src/features/organization/components/TransactionReceiptBox";
import type { OrganizationTransaction } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 証憑タブ (/orgs/:orgId/book/:transactionId/receipt)
function OrganizationTransactionReceiptPage() {
  const transaction = useOutletContext<OrganizationTransaction>();

  return <TransactionReceiptBox receipt={transaction.receipt} />;
}

export { OrganizationTransactionReceiptPage };
