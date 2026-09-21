import { useEffect, useRef } from "react";

import type {
  PrintRequest,
  PrintRequestSortDirection,
  PrintRequestSortField,
} from "../types";
import { PrintRequestListRow } from "./PrintRequestListRow";
import { PrintRequestSortDropdown } from "./PrintRequestSortDropdown";

import styles from "./PrintRequestListBox.module.css";

type PrintRequestListBoxProps = {
  printRequests: PrintRequest[];
  totalCount: number;
  sortField: PrintRequestSortField;
  sortDirection: PrintRequestSortDirection;
  onSortChange: (
    field: PrintRequestSortField,
    direction: PrintRequestSortDirection,
  ) => void;
  page: number;
};

// DocumentListBox と同じ構造の Box (ページネーションは Box の外, PrintQueueSection
// 側で上下に配置する). 各行 (PrintRequestListRow) にリンク先が無いため,
// DocumentListBox にある「矢印キーで行間を移動する」操作は対象が無く省略
// している — ただし「ページを切り替えたら一覧が変わったことに気付けるように」
// という標準方針 (DocumentListBox 等) は行の有無に関わらず有効なため,
// ページ切り替え時に一覧自体へフォーカスする挙動はそのまま残している.
// 非対話的な静的リストのため, 実際の <ul>/<li> (biome の
// lint/a11y/useSemanticElements が role="list" な <div> より
// こちらを推奨するため) で構成している
function PrintRequestListBox({
  printRequests,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: PrintRequestListBoxProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const previousPageRef = useRef(page);

  useEffect(() => {
    if (previousPageRef.current !== page) {
      listRef.current?.focus();
    }
    previousPageRef.current = page;
  }, [page]);

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{totalCount}件の印刷依頼</span>
        <PrintRequestSortDropdown
          field={sortField}
          direction={sortDirection}
          onChange={onSortChange}
        />
      </div>

      <ul ref={listRef} className={styles.list} tabIndex={-1} aria-label="印刷依頼一覧">
        {printRequests.map((printRequest) => (
          <li key={printRequest.id}>
            <PrintRequestListRow printRequest={printRequest} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PrintRequestListBox };
