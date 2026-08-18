import { useEffect, useRef } from "react";

import type {
  OrganizationTransaction,
  TransactionSortDirection,
  TransactionSortField,
} from "../types";
import { TransactionListRow } from "./TransactionListRow";
import { TransactionSortDropdown } from "./TransactionSortDropdown";

import styles from "./TransactionListBox.module.css";

type TransactionListBoxProps = {
  transactions: OrganizationTransaction[];
  totalCount: number;
  // totalCount と同じ集合 (絞り込み後・ページ分割前) の amount 合計. 収入-支出の
  // 純額のため負の値になり得る (符号付きでそのまま表示する)
  totalAmount: number;
  sortField: TransactionSortField;
  sortDirection: TransactionSortDirection;
  onSortChange: (
    field: TransactionSortField,
    direction: TransactionSortDirection,
  ) => void;
  page: number;
};

// GitHub のリポジトリ一覧風の Box. DocumentListBox と同じ構造 (ページ切り替え時の
// 自動フォーカス, 矢印キーでの行移動を含む). ページネーションは Box の外
// (OrganizationBookSection 側) で上下に配置する
function TransactionListBox({
  transactions,
  totalCount,
  totalAmount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: TransactionListBoxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);

  // キーボード操作でページを変えても一覧の内容が変わったことに気付けるよう,
  // ページ切り替え時は一覧自体にフォーカスを移す (:focus-visible の青枠が
  // 目印になる). 初回マウント時は前回値と同じなので対象外.
  // 一覧自体は tabIndex={-1} (Tab の通常の移動順には含めず, この
  // useEffect からの .focus() でのみプログラム的にフォーカスされる) にしている
  useEffect(() => {
    if (previousPageRef.current !== page) {
      listRef.current?.focus();
    }
    previousPageRef.current = page;
  }, [page]);

  // 一覧内の行 (リンク) にフォーカスがある間は上下矢印キーで前後の行へ,
  // 一覧自体 (行以外) にフォーカスがある間は下矢印で一番下の行, 上矢印で
  // 一番上の行へフォーカスを移動する
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
        <div className={styles.summary}>
          <span className={styles.count}>{totalCount}件の入出金</span>
          <span className={styles.totalAmount}>計: {totalAmount}円</span>
        </div>
        <TransactionSortDropdown
          field={sortField}
          direction={sortDirection}
          onChange={onSortChange}
        />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        aria-label="入出金一覧"
        onKeyDown={handleKeyDown}
      >
        {transactions.map((transaction) => (
          <TransactionListRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}

export { TransactionListBox };
