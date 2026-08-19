import { Icon } from "@src/components/ui/Icon";
import { IconUser } from "@tabler/icons-react";

import type { OrganizationTransaction } from "../types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

import styles from "./TransactionHeaderBox.module.css";

type TransactionHeaderBoxProps = {
  transaction: OrganizationTransaction;
};

// 会計処理詳細ページ上部の2段. 1段目は支出/収入+名称 (太字)+金額 (subtext1,
// regular), 2段目は状態ラベル (TransactionStatusBadge)+起案者名 (太字)
function TransactionHeaderBox({ transaction }: TransactionHeaderBoxProps) {
  const isIncome = transaction.amount >= 0;

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <span className={styles.sign}>{isIncome ? "収入" : "支出"}:</span>
        <span className={styles.name}>{transaction.description}</span>
        <span className={styles.amount}>{Math.abs(transaction.amount)}円</span>
      </div>

      <div className={styles.metaRow}>
        <TransactionStatusBadge status={transaction.status} />
        <span className={styles.proposer}>
          <Icon icon={IconUser} size={16} aria-hidden="true" />
          起案者: <span className={styles.proposerName}>{transaction.proposerName}</span>
        </span>
      </div>
    </div>
  );
}

export { TransactionHeaderBox };
