import { useEffect, useRef } from "react";

import type { EquipmentItem, EquipmentSortDirection, EquipmentSortField } from "../types";
import { EquipmentListRow } from "./EquipmentListRow";
import { EquipmentSortDropdown } from "./EquipmentSortDropdown";

import styles from "./EquipmentListBox.module.css";

type EquipmentListBoxProps = {
  items: EquipmentItem[];
  totalCount: number;
  sortField: EquipmentSortField;
  sortDirection: EquipmentSortDirection;
  onSortChange: (field: EquipmentSortField, direction: EquipmentSortDirection) => void;
  page: number;
};

// MemberListBox と同じ構造の Box (ページネーションは Box の外,
// EquipmentLoansSection 側で上下に配置する). 各行 (EquipmentListRow) に
// リンク先が無いため, PrintRequestListBox/RoomReservationListBox と同じく
// 非対話的な静的リスト (<ul>/<li>) として構成し, 「矢印キーで行間を移動する」
// 操作は省略している — ページ切り替え時に一覧へフォーカスして変化に
// 気付けるようにする標準方針は行の有無に関わらず有効なため, そちらは踏襲している
function EquipmentListBox({
  items,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: EquipmentListBoxProps) {
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
        <span className={styles.count}>{totalCount}件の備品</span>
        <EquipmentSortDropdown field={sortField} direction={sortDirection} onChange={onSortChange} />
      </div>

      <ul ref={listRef} className={styles.list} tabIndex={-1} aria-label="備品一覧">
        {items.map((item) => (
          <li key={item.id}>
            <EquipmentListRow item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export { EquipmentListBox };
