import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { getDocumentFilters } from "../documentFilters";
import {
  DocumentSortDirection,
  DocumentSortField,
  type OrganizationDocument,
} from "../types";
import { DocumentFilterSidebar } from "./DocumentFilterSidebar";
import { DocumentListBox } from "./DocumentListBox";
import { DocumentSearchBar } from "./DocumentSearchBar";

import styles from "./OrganizationDocumentsSection.module.css";

const PAGE_SIZE = 20;

function sortDocuments(
  documents: OrganizationDocument[],
  field: DocumentSortField,
  direction: DocumentSortDirection,
): OrganizationDocument[] {
  const sorted = [...documents].sort((a, b) => {
    if (field === DocumentSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === DocumentSortDirection.Asc ? sorted : sorted.reverse();
}

type OrganizationDocumentsSectionProps = {
  documents: OrganizationDocument[];
  // 組織プロフィールページ配下 (/orgs/:orgId/documents) から使う場合は true.
  // DocumentFilterSidebar にそのまま渡す (getDocumentFilters を参照)
  scopedToOrganization?: boolean;
};

function OrganizationDocumentsSection({
  documents,
  scopedToOrganization,
}: OrganizationDocumentsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<DocumentSortField>(
    DocumentSortField.EditedAt,
  );
  const [sortDirection, setSortDirection] = useState<DocumentSortDirection>(
    DocumentSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  // 検索欄の文字列がサイドバーのいずれかのフィルターと完全一致する場合だけ,
  // その見出しを表示する (フィルター自体はまだ実装しないため, 一覧は絞り込まれない)
  const matchedFilter = getDocumentFilters(Boolean(scopedToOrganization)).find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortDocuments(documents, sortField, sortDirection),
    [documents, sortField, sortDirection],
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
      <DocumentFilterSidebar
        searchText={searchText}
        onSelect={handleSearchChange}
        scopedToOrganization={scopedToOrganization}
      />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <DocumentSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <DocumentListBox
          documents={pageItems}
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

export { OrganizationDocumentsSection };
