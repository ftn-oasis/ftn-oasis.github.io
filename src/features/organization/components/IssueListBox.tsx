import { useEffect, useRef } from "react";

import type { DocumentIssue, DocumentIssueSortDirection, DocumentIssueSortField } from "../types";
import { IssueListRow } from "./IssueListRow";
import { IssueSortDropdown } from "./IssueSortDropdown";

import styles from "./IssueListBox.module.css";

type IssueListBoxProps = {
  issues: DocumentIssue[];
  totalCount: number;
  sortField: DocumentIssueSortField;
  sortDirection: DocumentIssueSortDirection;
  onSortChange: (
    field: DocumentIssueSortField,
    direction: DocumentIssueSortDirection,
  ) => void;
  page: number;
};

// 指摘事項タブの一覧 Box. MeetingListBox と同じ構造 (ページ切り替え時の
// 自動フォーカス, 矢印キーでの行移動を含む). ~/orgs/組織ID/documents/文書ID/issues
// (特定の文書のみ) と ~/issues (組織を横断) の両方から issues の中身だけを
// 差し替えてそのまま再利用する — 行ごとのリンク先の組織 ID は IssueListRow
// 自身が issue.documentId から解決するため, ここでは中継不要
function IssueListBox({
  issues,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: IssueListBoxProps) {
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
        <span className={styles.count}>{totalCount}件の指摘事項</span>
        <IssueSortDropdown field={sortField} direction={sortDirection} onChange={onSortChange} />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        aria-label="指摘事項一覧"
        onKeyDown={handleKeyDown}
      >
        {issues.map((issue) => (
          <IssueListRow key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}

export { IssueListBox };
