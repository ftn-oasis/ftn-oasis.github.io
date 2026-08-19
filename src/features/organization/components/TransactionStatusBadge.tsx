import clsx from "clsx";

import { TransactionStatus } from "../types";

import styles from "./TransactionStatusBadge.module.css";

const STATUS_LABEL: Record<TransactionStatus, string> = {
  [TransactionStatus.ApprovalPending]: "承認待",
  [TransactionStatus.PaymentPending]: "支払待",
  [TransactionStatus.SettlementPending]: "清算待",
  [TransactionStatus.Completed]: "完了済",
  [TransactionStatus.Denied]: "却下済",
};

const STATUS_CLASS: Record<TransactionStatus, string> = {
  [TransactionStatus.ApprovalPending]: styles.approvalPending,
  [TransactionStatus.PaymentPending]: styles.paymentPending,
  [TransactionStatus.SettlementPending]: styles.settlementPending,
  [TransactionStatus.Completed]: styles.completed,
  [TransactionStatus.Denied]: styles.denied,
};

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
  // 入出金一覧の各行 (TransactionListRow) で使う縮小版
  compact?: boolean;
  className?: string;
};

// 会計処理詳細ページ上部の状態ラベル. 承認待 (blue)/支払待 (green)/清算待 (peach)/
// 完了済 (mauve)/却下済 (red) をそれぞれ塗りつぶし背景+Base色の太字で表現する
function TransactionStatusBadge({
  status,
  compact,
  className,
}: TransactionStatusBadgeProps) {
  return (
    <span
      className={clsx(
        styles.root,
        STATUS_CLASS[status],
        compact && styles.compact,
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export { TransactionStatusBadge };
