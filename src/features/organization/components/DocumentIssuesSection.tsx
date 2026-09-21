import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { DocumentIssueSortDirection, DocumentIssueSortField, type DocumentIssue } from "../types";
import { ISSUE_FILTERS, IssueFilterSidebar } from "./IssueFilterSidebar";
import { IssueListBox } from "./IssueListBox";
import { IssueSearchBar } from "./IssueSearchBar";

import styles from "./DocumentIssuesSection.module.css";

const PAGE_SIZE = 20;

function sortIssues(
  issues: DocumentIssue[],
  field: DocumentIssueSortField,
  direction: DocumentIssueSortDirection,
): DocumentIssue[] {
  const sorted = [...issues].sort((a, b) => {
    if (field === DocumentIssueSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === DocumentIssueSortDirection.Asc ? sorted : sorted.reverse();
}

type DocumentIssuesSectionProps = {
  issues: DocumentIssue[];
};

// 指摘事項タブ (/orgs/:orgId/documents/:documentId/issues) の本文.
// 「../../meetingsのリスト形式で」という依頼のため, OrganizationMeetingsSection
// のリスト表示部分 (検索バー+フィルターサイドバー+ソート+ページネーション付き
// 一覧 Box) と同じ構造を踏襲している (カレンダー表示は指摘事項には無関係のため
// 対象外). 「~/issues のページも同じ構造で, 内容は組織を横断したものとして
// ほしい」という依頼のため, organizationId/documentId は受け取らず issues
// (どちらのページでも渡す配列を差し替えるだけ) だけを prop にしている —
// 特定の文書向け (呼び出し元が documentId で絞り込んだ配列を渡す) と組織を
// 横断する全件向け (呼び出し元が全件をそのまま渡す) の両方をこの1つの
// コンポーネントで兼ねている (`IssuesPage`/`OrganizationDocumentIssuesPage`
// を参照)
function DocumentIssuesSection({ issues }: DocumentIssuesSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<DocumentIssueSortField>(
    DocumentIssueSortField.PostedAt,
  );
  const [sortDirection, setSortDirection] = useState<DocumentIssueSortDirection>(
    DocumentIssueSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  const matchedFilter = ISSUE_FILTERS.find((filter) => filter.query === searchText);
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortIssues(issues, sortField, sortDirection),
    [issues, sortField, sortDirection],
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
      <IssueFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <IssueSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <IssueListBox
          issues={pageItems}
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

export { DocumentIssuesSection };
