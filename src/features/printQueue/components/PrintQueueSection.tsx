import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { PRINT_REQUEST_FILTERS } from "../printRequestFilters";
import {
  type PrintRequest,
  PrintRequestSortDirection,
  PrintRequestSortField,
} from "../types";
import { PrintRequestFilterSidebar } from "./PrintRequestFilterSidebar";
import { PrintRequestListBox } from "./PrintRequestListBox";
import { PrintRequestSearchBar } from "./PrintRequestSearchBar";

import styles from "./PrintQueueSection.module.css";

const PAGE_SIZE = 20;

function sortPrintRequests(
  printRequests: PrintRequest[],
  field: PrintRequestSortField,
  direction: PrintRequestSortDirection,
): PrintRequest[] {
  const sorted = [...printRequests].sort((a, b) => {
    if (field === PrintRequestSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === PrintRequestSortDirection.Asc ? sorted : sorted.reverse();
}

type PrintQueueSectionProps = {
  printRequests: PrintRequest[];
};

// ~/print-queue の本文. 「~/documents (OrganizationDocumentsSection) を
// 参考にしてほしい」という依頼のため, 同じ構造 (検索バー+フィルターサイド
// バー+ソート+ページネーション付き一覧 Box) を踏襲している. 組織/文書ページの
// ネストしたレイアウトには属さない単独のトップレベルページのため, .root
// 自身が max-width/中央寄せを持つ (NotificationsSection と同じ考え方)
function PrintQueueSection({ printRequests }: PrintQueueSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<PrintRequestSortField>(
    PrintRequestSortField.UpdatedAt,
  );
  const [sortDirection, setSortDirection] = useState<PrintRequestSortDirection>(
    PrintRequestSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  // 検索欄の文字列がサイドバーのいずれかのフィルターと完全一致する場合だけ,
  // その見出しを表示する (フィルター自体はまだ実装しないため, 一覧は絞り込まれない)
  const matchedFilter = PRINT_REQUEST_FILTERS.find((filter) => filter.query === searchText);
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortPrintRequests(printRequests, sortField, sortDirection),
    [printRequests, sortField, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const showPagination = pageCount > 1;

  return (
    <div className={styles.root}>
      <PrintRequestFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <PrintRequestSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <PrintRequestListBox
          printRequests={pageItems}
          totalCount={sorted.length}
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
  );
}

export { PrintQueueSection };
