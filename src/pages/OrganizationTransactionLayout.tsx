import { TransactionDetailTabs } from "@src/features/organization/components/TransactionDetailTabs";
import { TransactionHeaderBox } from "@src/features/organization/components/TransactionHeaderBox";
import { MOCK_ORGANIZATION_TRANSACTIONS } from "@src/features/organization/mockData";
import type { OrganizationTransaction } from "@src/features/organization/types";
import { Outlet, useParams } from "react-router";

import styles from "./OrganizationTransactionLayout.module.css";

// /orgs/:orgId/book/:transactionId 配下の共通レイアウト. OrganizationLayout と
// 同じ考え方 (存在チェック + 共通ヘッダーをまとめて描画し, 個々のページは
// 本文だけを描画する) だが, このタブ (金額内訳/手続状況/証憑) はヘッダー下部の
// スロットではなくページ本文側に表示する (TransactionDetailTabs のコメント参照)
function OrganizationTransactionLayout() {
  const { orgId, transactionId } = useParams();

  const transaction = MOCK_ORGANIZATION_TRANSACTIONS.find(
    (candidate) =>
      candidate.id === transactionId && candidate.organizationId === orgId,
  );

  if (!transaction) {
    return <p className={styles.notFound}>会計処理が見つかりません.</p>;
  }

  return (
    <div className={styles.root}>
      <TransactionHeaderBox transaction={transaction} />

      <div className={styles.tabsWrapper}>
        <TransactionDetailTabs
          organizationId={transaction.organizationId}
          transactionId={transaction.id}
        />
      </div>

      <div className={styles.content}>
        <Outlet context={transaction satisfies OrganizationTransaction} />
      </div>
    </div>
  );
}

export { OrganizationTransactionLayout };
