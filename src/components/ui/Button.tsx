import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./Button.module.css";

type ButtonProps = {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  // 塗りつぶしの色 (variant="filled" のときのみ有効). 既定は既存の呼び出し元
  // (文書作成フォームの送信ボタンなど) と同じ青
  color?: "blue" | "green";
  // "ghost" は背景透過+枠線のみ (会計申請の確認画面のキャンセルボタン用に追加)
  variant?: "filled" | "ghost";
};

// 塗りつぶしの主要アクションボタン (GitHub の "Create repository" のような
// フォーム送信ボタンを想定). README.md/CLAUDE.md では以前から想定されて
// いましたが実体が無かったため, 文書作成フォーム (NewDocumentSection) の
// 実装にあわせて新設しました
function Button({
  type = "button",
  disabled,
  onClick,
  className,
  children,
  color = "blue",
  variant = "filled",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        styles.root,
        variant === "ghost" ? styles.ghost : styles[color],
        className,
      )}
    >
      {children}
    </button>
  );
}

export { Button };
