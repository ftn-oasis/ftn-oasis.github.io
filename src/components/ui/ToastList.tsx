import { type ToastItem, ToastStatus } from "@src/contexts/toastTypes";
import { IconCircleCheckFilled, IconLoader2, IconX } from "@tabler/icons-react";

import { Icon } from "./Icon";
import styles from "./ToastList.module.css";

type ToastListProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

// 画面右上に固定表示するトーストの一覧. ToastProvider (src/contexts/) から
// 状態だけを受け取って描画する, 見た目専用の部品 (HeaderBottomSlotContext/
// HeaderBottomPortal と同じ, Context 側とレンダリング側を分ける考え方)
function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast} role="status">
          {toast.status === ToastStatus.Pending ? (
            <Icon
              icon={IconLoader2}
              size={18}
              aria-hidden="true"
              className={styles.spinner}
            />
          ) : (
            <Icon
              icon={IconCircleCheckFilled}
              size={18}
              aria-hidden="true"
              className={styles.successIcon}
            />
          )}
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            aria-label="閉じる"
            className={styles.close}
            onClick={() => onDismiss(toast.id)}
          >
            <Icon icon={IconX} size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

export { ToastList };
