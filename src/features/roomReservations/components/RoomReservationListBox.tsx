import { useEffect, useRef } from "react";

import type {
  RoomReservation,
  RoomReservationSortDirection,
  RoomReservationSortField,
} from "../types";
import { RoomReservationListRow } from "./RoomReservationListRow";
import { RoomReservationSortDropdown } from "./RoomReservationSortDropdown";

import styles from "./RoomReservationListBox.module.css";

type RoomReservationListBoxProps = {
  reservations: RoomReservation[];
  totalCount: number;
  sortField: RoomReservationSortField;
  sortDirection: RoomReservationSortDirection;
  onSortChange: (
    field: RoomReservationSortField,
    direction: RoomReservationSortDirection,
  ) => void;
  page: number;
};

// MeetingListBox と同じ構造の Box (ページネーションは Box の外,
// RoomReservationsSection 側で上下に配置する). 各行 (RoomReservationListRow)
// にリンク先が無いため, PrintRequestListBox と同じく非対話的な静的リスト
// (<ul>/<li>) として構成し, 「矢印キーで行間を移動する」操作は省略している —
// ページ切り替え時に一覧へフォーカスして変化に気付けるようにする標準方針は
// 行の有無に関わらず有効なため, そちらは踏襲している
function RoomReservationListBox({
  reservations,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: RoomReservationListBoxProps) {
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
        <span className={styles.count}>{totalCount}件の新館予約</span>
        <RoomReservationSortDropdown
          field={sortField}
          direction={sortDirection}
          onChange={onSortChange}
        />
      </div>

      <ul ref={listRef} className={styles.list} tabIndex={-1} aria-label="新館予約一覧">
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            <RoomReservationListRow reservation={reservation} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export { RoomReservationListBox };
