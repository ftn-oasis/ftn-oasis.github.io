import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { type OrganizationDetail, OrgSortDirection, OrgSortField } from "../types";
import { ORG_FILTERS, OrgFilterSidebar } from "./OrgFilterSidebar";
import { OrgListBox } from "./OrgListBox";
import { OrgSearchBar } from "./OrgSearchBar";

import styles from "./OrgsSection.module.css";

const PAGE_SIZE = 20;

function sortOrganizations(
  organizations: OrganizationDetail[],
  field: OrgSortField,
  direction: OrgSortDirection,
): OrganizationDetail[] {
  const sorted = [...organizations].sort((a, b) => {
    if (field === OrgSortField.Name) {
      return a.name.localeCompare(b.name, "ja");
    }
    return a.memberCount - b.memberCount;
  });
  return direction === OrgSortDirection.Asc ? sorted : sorted.reverse();
}

type OrgsSectionProps = {
  organizations: OrganizationDetail[];
};

// ~/orgs の本文. 「./組織ID/documents を参考にしてほしい」という依頼のため,
// OrganizationDocumentsSection と同じ構造 (検索バー+フィルターサイドバー+
// ソート+ページネーション付き一覧 Box, グリッド比率 1fr auto 3fr) を踏襲
// している. 単独のトップレベルページのため .root 自身が max-width を持つ
function OrgsSection({ organizations }: OrgsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<OrgSortField>(OrgSortField.Name);
  const [sortDirection, setSortDirection] = useState<OrgSortDirection>(
    OrgSortDirection.Asc,
  );
  const [page, setPage] = useState(1);

  const matchedFilter = ORG_FILTERS.find((filter) => filter.query === searchText);
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortOrganizations(organizations, sortField, sortDirection),
    [organizations, sortField, sortDirection],
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
      <OrgFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <OrgSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <OrgListBox
          organizations={pageItems}
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

export { OrgsSection };
