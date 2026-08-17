import type { ReactNode } from "react";

import styles from "./Label.module.css";

type LabelProps = {
  children: ReactNode;
};

// 背景透過+細いボーダーの丸いタグ. 文書の公開/非公開, 組織の種類など,
// 種類を示す短いラベル全般に使う汎用部品
function Label({ children }: LabelProps) {
  return <span className={styles.root}>{children}</span>;
}

export { Label };
