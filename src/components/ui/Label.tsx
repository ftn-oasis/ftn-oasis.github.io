import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./Label.module.css";

type LabelProps = {
  children: ReactNode;
  // 既定は背景透過+text色 (種別バッジなど). 会議の延会/流会のように, 状態を
  // 色でも示したい場合だけ Catppuccin のアクセントカラーを指定する
  color?: "sky" | "mauve";
};

// 背景透過+細いボーダーの丸いタグ. 文書の公開/非公開, 組織の種類など,
// 種類を示す短いラベル全般に使う汎用部品
function Label({ children, color }: LabelProps) {
  return (
    <span className={clsx(styles.root, color && styles[color])}>
      {children}
    </span>
  );
}

export { Label };
