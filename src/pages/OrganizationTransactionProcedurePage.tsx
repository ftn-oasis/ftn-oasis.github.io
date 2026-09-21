import { TransactionProcedureTimeline } from "@src/features/organization/components/TransactionProcedureTimeline";
import type { OrganizationTransaction } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 手続状況タブ (/orgs/:orgId/book/:transactionId/procedure)
function OrganizationTransactionProcedurePage() {
  const transaction = useOutletContext<OrganizationTransaction>();

  return <TransactionProcedureTimeline procedure={transaction.procedure} />;
}

export { OrganizationTransactionProcedurePage };
