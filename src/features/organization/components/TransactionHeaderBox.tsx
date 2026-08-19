import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCashBanknote, IconUser, IconWallet } from "@tabler/icons-react";

import { resolveMemberId } from "../resolveMemberId";
import { type OrganizationTransaction, TransactionRequestType } from "../types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

import styles from "./TransactionHeaderBox.module.css";

const REQUEST_TYPE_LABEL: Record<TransactionRequestType, string> = {
  [TransactionRequestType.Reimbursement]: "立替払",
  [TransactionRequestType.AdvancePayment]: "仮払",
};

const REQUEST_TYPE_ICON = {
  [TransactionRequestType.Reimbursement]: IconWallet,
  [TransactionRequestType.AdvancePayment]: IconCashBanknote,
} as const;

type TransactionHeaderBoxProps = {
  transaction: OrganizationTransaction;
};

// 会計処理詳細ページ上部の2段. 1段目は支出/収入+名称 (太字)+金額 (subtext1,
// regular), 2段目は状態ラベル (TransactionStatusBadge)+種類 (立替払/仮払)+
// 起案者名 (太字)
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
          <Icon
            icon={REQUEST_TYPE_ICON[transaction.requestType]}
            size={16}
            aria-hidden="true"
          />
          種類: {REQUEST_TYPE_LABEL[transaction.requestType]}
        </span>
        <span className={styles.proposer}>
          <Icon icon={IconUser} size={16} aria-hidden="true" />
          起案者:{" "}
          <UserNameLink
            userId={resolveMemberId(transaction.proposerName)}
            name={transaction.proposerName}
            className={styles.proposerName}
          />
        </span>
      </div>
    </div>
  );
}

export { TransactionHeaderBox };
