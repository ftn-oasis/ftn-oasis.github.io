import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { getTransactionFilters } from "../transactionFilters";
import {
  type OrganizationTransaction,
  TransactionSortDirection,
  TransactionSortField,
} from "../types";
import { TransactionFilterSidebar } from "./TransactionFilterSidebar";
import { TransactionListBox } from "./TransactionListBox";
import { TransactionSearchBar } from "./TransactionSearchBar";
import { TransactionSummaryBox } from "./TransactionSummaryBox";

import styles from "./OrganizationBookSection.module.css";

const PAGE_SIZE = 20;

function sortTransactions(
  transactions: OrganizationTransaction[],
  field: TransactionSortField,
  direction: TransactionSortDirection,
): OrganizationTransaction[] {
  const sorted = [...transactions].sort((a, b) => {
    if (field === TransactionSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === TransactionSortDirection.Asc ? sorted : sorted.reverse();
}

type OrganizationBookSectionProps = {
  transactions: OrganizationTransaction[];
  // 組織プロフィールページ配下 (/orgs/:orgId/book) から使う場合は true.
  // TransactionFilterSidebar にそのまま渡す (getTransactionFilters を参照)
  scopedToOrganization?: boolean;
};

// OrganizationDocumentsSection と同じ構造 (検索バー + フィルターサイドバー +
// ページネーション付きの一覧 Box) の, 入出金一覧 (/orgs/:orgId/book) の本文
function OrganizationBookSection({
  transactions,
  scopedToOrganization,
}: OrganizationBookSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<TransactionSortField>(
    TransactionSortField.EditedAt,
  );
  const [sortDirection, setSortDirection] = useState<TransactionSortDirection>(
    TransactionSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  // 検索欄の文字列がサイドバーのいずれかのフィルターと完全一致する場合だけ,
  // その見出しを表示する (フィルター自体はまだ実装しないため, 一覧は絞り込まれない)
  const matchedFilter = getTransactionFilters(Boolean(scopedToOrganization)).find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortTransactions(transactions, sortField, sortDirection),
    [transactions, sortField, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 残金/支出合計/収入合計 (TransactionSummaryBox) は絞り込みに関わらず全件が
  // 対象. 一覧上部の「計」(sorted の合計) とは異なる集合であることに注意
  const { incomeTotal, expenseTotal } = useMemo(
    () => ({
      incomeTotal: transactions
        .filter((transaction) => transaction.amount >= 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      expenseTotal: transactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    }),
    [transactions],
  );
  const balance = incomeTotal - expenseTotal;

  // 一覧上部の「計」— 絞り込み後 (sorted, ページ分割前) の amount 合計
  const sortedTotal = useMemo(
    () => sorted.reduce((sum, transaction) => sum + transaction.amount, 0),
    [sorted],
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const showPagination = pageCount > 1;

  return (
    <div className={styles.root}>
      <TransactionSummaryBox
        balance={balance}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
      />

      <Divider />

      <div className={styles.body}>
        <TransactionFilterSidebar
          searchText={searchText}
          onSelect={handleSearchChange}
          scopedToOrganization={scopedToOrganization}
        />

        <Divider orientation="vertical" />

        <main className={styles.main}>
          <h1 className={styles.heading}>{heading}</h1>
          <TransactionSearchBar value={searchText} onChange={handleSearchChange} />

          {showPagination && (
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          )}

          <TransactionListBox
            transactions={pageItems}
            totalCount={sorted.length}
            totalAmount={sortedTotal}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(field, direction) => {
              setSortField(field);
              setSortDirection(direction);
            }}
            page={page}
          />

          {showPagination && (
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          )}
        </main>
      </div>
    </div>
  );
}

export { OrganizationBookSection };
