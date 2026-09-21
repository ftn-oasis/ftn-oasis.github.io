import { useEffect, useRef } from "react";

import type { OrganizationDetail, OrgSortDirection, OrgSortField } from "../types";
import { OrgListRow } from "./OrgListRow";
import { OrgSortDropdown } from "./OrgSortDropdown";

import styles from "./OrgListBox.module.css";

type OrgListBoxProps = {
  organizations: OrganizationDetail[];
  totalCount: number;
  sortField: OrgSortField;
  sortDirection: OrgSortDirection;
  onSortChange: (field: OrgSortField, direction: OrgSortDirection) => void;
  page: number;
};

// 組織一覧の Box. 他の一覧 (MeetingListBox など) と同じ構造 (ページ切り替え時の
// 自動フォーカス, 矢印キーでの行移動を含む)
function OrgListBox({
  organizations,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: OrgListBoxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);

  useEffect(() => {
    if (previousPageRef.current !== page) {
      listRef.current?.focus();
    }
    previousPageRef.current = page;
  }, [page]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const rows = Array.from(event.currentTarget.querySelectorAll("a"));
    if (rows.length === 0) return;

    const currentIndex = rows.indexOf(document.activeElement as HTMLAnchorElement);

    event.preventDefault();

    if (currentIndex === -1) {
      const edgeIndex = event.key === "ArrowDown" ? rows.length - 1 : 0;
      rows[edgeIndex]?.focus();
      return;
    }

    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(currentIndex + 1, rows.length - 1)
        : Math.max(currentIndex - 1, 0);
    rows[nextIndex]?.focus();
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{totalCount}件の組織</span>
        <OrgSortDropdown field={sortField} direction={sortDirection} onChange={onSortChange} />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        aria-label="組織一覧"
        onKeyDown={handleKeyDown}
      >
        {organizations.map((organization) => (
          <OrgListRow key={organization.id} organization={organization} />
        ))}
      </div>
    </div>
  );
}

export { OrgListBox };
