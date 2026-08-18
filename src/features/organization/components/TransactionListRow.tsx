import { Icon } from "@src/components/ui/Icon";
import {
  IconCoinYen,
  IconMoneybagMinus,
  IconMoneybagPlus,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { type OrganizationTransaction, PaymentMethod } from "../types";

import styles from "./TransactionListRow.module.css";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "現金",
  [PaymentMethod.BankTransfer]: "銀行振込",
  [PaymentMethod.DirectDebit]: "引き落し",
};

type TransactionListRowProps = {
  transaction: OrganizationTransaction;
};

// 入出金一覧の1行. 行全体が1つのリンク. DocumentListRow と同じ構造だが, 先頭に
// 収入/支出を示すアイコン (サイドバーの支出/収入フィルターと同じ IconMoneybagMinus/
// IconMoneybagPlus) を追加し, 3列目をファイル種別ではなく決済手段にしている
function TransactionListRow({ transaction }: TransactionListRowProps) {
  const isIncome = transaction.amount >= 0;

  return (
    <Link
      to={`/orgs/${transaction.organizationId}/book/${transaction.id}`}
      className={styles.root}
    >
      <Icon
        icon={isIncome ? IconMoneybagPlus : IconMoneybagMinus}
        size={16}
        aria-hidden="true"
        className={styles.sign}
      />
      <span className={styles.title}>{transaction.title}</span>
      <span className={styles.description}>{transaction.description}</span>
      <span className={styles.method}>
        <Icon icon={IconCoinYen} size={16} aria-hidden="true" />
        {PAYMENT_METHOD_LABEL[transaction.method]}
      </span>
    </Link>
  );
}

export { TransactionListRow };
