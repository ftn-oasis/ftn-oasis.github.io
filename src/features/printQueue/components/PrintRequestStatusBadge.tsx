import clsx from "clsx";

import { PRINT_REQUEST_STATUS_LABEL, PrintRequestStatus } from "../types";

import styles from "./PrintRequestStatusBadge.module.css";

const STATUS_CLASS: Record<PrintRequestStatus, string> = {
  [PrintRequestStatus.Requesting]: styles.requesting,
  [PrintRequestStatus.Queued]: styles.queued,
  [PrintRequestStatus.AwaitingPickup]: styles.awaitingPickup,
  [PrintRequestStatus.Completed]: styles.completed,
  [PrintRequestStatus.Canceled]: styles.canceled,
};

type PrintRequestStatusBadgeProps = {
  status: PrintRequestStatus;
  // 一覧の各行 (PrintRequestListRow) で使う縮小版 — TransactionStatusBadge
  // の compact と同じ
  compact?: boolean;
  className?: string;
};

// TransactionStatusBadge (会計処理詳細ページ上部の状態ラベル) と同じ,
// 左右が半円のピル型ラベル. 依頼中 (blue)/印刷待 (teal)/受取待 (peach)/
// 完了済 (green)/取消済 (red) をそれぞれ塗りつぶし背景+Base色の太字で表現する
function PrintRequestStatusBadge({
  status,
  compact,
  className,
}: PrintRequestStatusBadgeProps) {
  return (
    <span
      className={clsx(styles.root, STATUS_CLASS[status], compact && styles.compact, className)}
    >
      {PRINT_REQUEST_STATUS_LABEL[status]}
    </span>
  );
}

export { PrintRequestStatusBadge };
