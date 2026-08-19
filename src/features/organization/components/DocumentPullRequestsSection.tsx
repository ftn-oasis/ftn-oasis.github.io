import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import {
  type DocumentPullRequest,
  DocumentPullRequestSortDirection,
  DocumentPullRequestSortField,
} from "../types";
import { PULL_REQUEST_FILTERS, PullRequestFilterSidebar } from "./PullRequestFilterSidebar";
import { PullRequestListBox } from "./PullRequestListBox";
import { PullRequestSearchBar } from "./PullRequestSearchBar";

import styles from "./DocumentPullRequestsSection.module.css";

const PAGE_SIZE = 20;

function sortPullRequests(
  pullRequests: DocumentPullRequest[],
  field: DocumentPullRequestSortField,
  direction: DocumentPullRequestSortDirection,
): DocumentPullRequest[] {
  const sorted = [...pullRequests].sort((a, b) => {
    if (field === DocumentPullRequestSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === DocumentPullRequestSortDirection.Asc ? sorted : sorted.reverse();
}

type DocumentPullRequestsSectionProps = {
  pullRequests: DocumentPullRequest[];
};

// 修正提案タブ (/orgs/:orgId/documents/:documentId/pulls) の本文.
// 「../../meetingsのリスト形式で」という依頼のため, OrganizationMeetingsSection
// のリスト表示部分 (検索バー+フィルターサイドバー+ソート+ページネーション付き
// 一覧 Box) と同じ構造を踏襲している (カレンダー表示は修正提案には無関係のため
// 対象外). DocumentIssuesSection と同じ理由で organizationId/documentId は
// 受け取らない (`PullsPage`/`OrganizationDocumentPullsPage` の両方から
// pullRequests の中身だけを差し替えて再利用する)
function DocumentPullRequestsSection({
  pullRequests,
}: DocumentPullRequestsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<DocumentPullRequestSortField>(
    DocumentPullRequestSortField.PostedAt,
  );
  const [sortDirection, setSortDirection] = useState<DocumentPullRequestSortDirection>(
    DocumentPullRequestSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  const matchedFilter = PULL_REQUEST_FILTERS.find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortPullRequests(pullRequests, sortField, sortDirection),
    [pullRequests, sortField, sortDirection],
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
      <PullRequestFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <PullRequestSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <PullRequestListBox
          pullRequests={pageItems}
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

export { DocumentPullRequestsSection };
