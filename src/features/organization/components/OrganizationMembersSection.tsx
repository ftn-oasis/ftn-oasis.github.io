import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import {
  MemberSortDirection,
  MemberSortField,
  type OrganizationMember,
} from "../types";
import { MEMBER_FILTERS, MemberFilterSidebar } from "./MemberFilterSidebar";
import { MemberListBox } from "./MemberListBox";
import { MemberSearchBar } from "./MemberSearchBar";

import styles from "./OrganizationMembersSection.module.css";

const PAGE_SIZE = 20;

function sortMembers(
  members: OrganizationMember[],
  field: MemberSortField,
  direction: MemberSortDirection,
): OrganizationMember[] {
  const sorted = [...members].sort((a, b) => {
    if (field === MemberSortField.Name) {
      return a.name.localeCompare(b.name, "ja");
    }
    if (field === MemberSortField.Class) {
      return a.class.localeCompare(b.class, "ja");
    }
    return a.grade - b.grade;
  });
  return direction === MemberSortDirection.Asc ? sorted : sorted.reverse();
}

type OrganizationMembersSectionProps = {
  members: OrganizationMember[];
};

// OrganizationDocumentsSection と同じ構造 (検索バー + フィルターサイドバー +
// ページネーション付きの一覧 Box) の, 構成員一覧 (/orgs/:orgId/members) の本文
function OrganizationMembersSection({
  members,
}: OrganizationMembersSectionProps) {
  const [searchText, setSearchText] = useState("");
  // ソートの初期値は学年昇順 (documents/book の最新編集日時降順に相当する,
  // このページで自然な既定順) にしている
  const [sortField, setSortField] = useState<MemberSortField>(
    MemberSortField.Grade,
  );
  const [sortDirection, setSortDirection] = useState<MemberSortDirection>(
    MemberSortDirection.Asc,
  );
  const [page, setPage] = useState(1);

  // 検索欄の文字列がサイドバーのいずれかのフィルターと完全一致する場合だけ,
  // その見出しを表示する (フィルター自体はまだ実装しないため, 一覧は絞り込まれない)
  const matchedFilter = MEMBER_FILTERS.find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortMembers(members, sortField, sortDirection),
    [members, sortField, sortDirection],
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
      <MemberFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <MemberSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <MemberListBox
          members={pageItems}
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

export { OrganizationMembersSection };
