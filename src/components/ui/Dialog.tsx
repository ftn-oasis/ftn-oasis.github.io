import type { ReactNode } from "react";

import { useEscapeKey } from "./useEscapeKey";

import styles from "./Dialog.module.css";

type DialogProps = {
  // オーバーレイのクリック/Escape で呼ばれる. 呼び出し側は「軽い (破壊的では
  // ない) 意味の閉じ方」をここに割り当てる想定 (RequestConfirmDialog/
  // DiscardConfirmDialog はどちらも, より安全な側の操作をここに割り当てている)
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
};

// モーダルダイアログ共通の土台 (全画面オーバーレイ+画面中央に浮くパネル).
// NavDrawer の全画面オーバーレイ (position: fixed の透過ボタン) と同じ手法.
// 会計申請作成フォームの確認画面 (RequestConfirmDialog) とキャンセル確認画面
// (DiscardConfirmDialog) の両方が同じ見た目を必要としたため, この土台部分
// だけを切り出した — 中身 (見出し/本文/ボタンの配置) は呼び出し側ごとに
// 異なるため children としてそのまま委ねている
function Dialog({ onClose, labelledBy, children }: DialogProps) {
  useEscapeKey(true, onClose);

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={styles.panel}
      >
        {children}
      </div>
    </>
  );
}

export { Dialog };
