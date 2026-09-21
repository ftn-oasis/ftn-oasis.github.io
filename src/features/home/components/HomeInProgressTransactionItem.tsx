import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import transactionStatusBadgeStyles from "@src/features/organization/components/TransactionStatusBadge.module.css";
import { TransactionStatusBadge } from "@src/features/organization/components/TransactionStatusBadge";
import { getTransactionAvailabilityLabel } from "@src/features/organization/transactionAvailability";
import type { OrganizationTransaction } from "@src/features/organization/types";
import clsx from "clsx";
import { Link } from "react-router";

import styles from "./HomeInProgressTransactionItem.module.css";

type HomeInProgressTransactionItemProps = {
  transaction: OrganizationTransaction;
};

// 左サイドバー「進行中の会計処理」の1行. 名目 (description)+金額 (整形済みの
// title)+ラベルを1つのリンクにまとめる (HomeEditedDocumentItem と同じ,
// menuItemBase を直接 <Link> に適用するパターン). ラベルは承認待なら通常の
// 状態ラベル (TransactionStatusBadge), 承認済なら「購入可」/「仮払可」
// (getTransactionAvailabilityLabel, teal) に切り替わる
function HomeInProgressTransactionItem({
  transaction,
}: HomeInProgressTransactionItemProps) {
  const availabilityLabel = getTransactionAvailabilityLabel(transaction);

  return (
    <Link
      to={`/orgs/${transaction.organizationId}/book/${transaction.id}`}
      className={clsx(menuItemBase.root, styles.root)}
    >
      <div className={styles.text}>
        <div className={styles.title} title={transaction.description}>
          {transaction.description}
        </div>
        <div className={styles.amount} title={transaction.title}>
          {transaction.title}
        </div>
      </div>
      {availabilityLabel ? (
        <span
          className={clsx(
            transactionStatusBadgeStyles.root,
            transactionStatusBadgeStyles.compact,
            styles.availabilityBadge,
          )}
        >
          {availabilityLabel}
        </span>
      ) : (
        <TransactionStatusBadge status={transaction.status} compact />
      )}
    </Link>
  );
}

export { HomeInProgressTransactionItem };
