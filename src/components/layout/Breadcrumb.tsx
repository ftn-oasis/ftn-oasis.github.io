import type { Ref } from "react";

import styles from "./Breadcrumb.module.css";

type BreadcrumbProps = {
  segments: string[];
  ref?: Ref<HTMLSpanElement>;
};

// 各要素が1階層分の表示名. 最後の要素 (表示中のページ) だけボールドにする
function Breadcrumb({ segments, ref }: BreadcrumbProps) {
  return (
    <span ref={ref} className={styles.root} title={segments.join(" / ")}>
      {segments.map((segment, index) => (
        <span key={segment}>
          {index > 0 && " / "}
          {index === segments.length - 1 ? (
            <span className={styles.current}>{segment}</span>
          ) : (
            segment
          )}
        </span>
      ))}
    </span>
  );
}

export { Breadcrumb };
