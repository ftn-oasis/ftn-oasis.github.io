import { Icon } from "@src/components/ui/Icon";
import { IconCoinYen } from "@tabler/icons-react";
import { Link } from "react-router";

import { type OrganizationTransaction, PaymentMethod } from "../types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

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
// 収入/支出を示す +/- (文字, 金額の直前に半角スペース1つ空けて表示. 以前は
// アイコン (IconMoneybagPlus/IconMoneybagMinus) だったが依頼により文字に変更),
// その左には縮小した状態ラベル (TransactionStatusBadge, 会計処理詳細ページ上部と
// 同じ見た目) を追加し, 3列目をファイル種別ではなく決済手段にしている
function TransactionListRow({ transaction }: TransactionListRowProps) {
  const isIncome = transaction.amount >= 0;

  return (
    <Link
      to={`/orgs/${transaction.organizationId}/book/${transaction.id}`}
      className={styles.root}
    >
      <TransactionStatusBadge
        status={transaction.status}
        compact
        className={styles.statusBadge}
      />
      <span className={styles.title} title={`${isIncome ? "+" : "-"} ${transaction.title}`}>
        {isIncome ? "+" : "-"} {transaction.title}
      </span>
      <span className={styles.description} title={transaction.description}>
        {transaction.description}
      </span>
      <span className={styles.method}>
        <Icon icon={IconCoinYen} size={16} aria-hidden="true" />
        {PAYMENT_METHOD_LABEL[transaction.method]}
      </span>
    </Link>
  );
}

export { TransactionListRow };
