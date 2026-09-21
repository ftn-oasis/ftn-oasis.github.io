import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import { EQUIPMENT_FILTERS } from "../equipmentFilters";
import { type EquipmentItem, EquipmentSortDirection, EquipmentSortField } from "../types";
import { EquipmentFilterSidebar } from "./EquipmentFilterSidebar";
import { EquipmentListBox } from "./EquipmentListBox";
import { EquipmentSearchBar } from "./EquipmentSearchBar";

import styles from "./EquipmentLoansSection.module.css";

const PAGE_SIZE = 20;

function sortEquipmentItems(
  items: EquipmentItem[],
  field: EquipmentSortField,
  direction: EquipmentSortDirection,
): EquipmentItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === EquipmentSortField.Name) {
      return a.name.localeCompare(b.name, "ja");
    }
    if (field === EquipmentSortField.Availability) {
      return a.availability.localeCompare(b.availability);
    }
    return a.quantity - b.quantity;
  });
  return direction === EquipmentSortDirection.Asc ? sorted : sorted.reverse();
}

type EquipmentLoansSectionProps = {
  items: EquipmentItem[];
};

// ~/equipment-loans の本文. 「~/orgs/:orgId/members
// (OrganizationMembersSection) を参考にしてほしい」という依頼のため, 同じ構造
// (検索バー+フィルターサイドバー+ソート+ページネーション付き一覧 Box) を
// 踏襲しています. 組織/文書のネストしたレイアウトには属さない単独の
// トップレベルページのため, .root 自身が max-width/中央寄せを持ちます
// (NotificationsSection と同じ考え方)
function EquipmentLoansSection({ items }: EquipmentLoansSectionProps) {
  const [searchText, setSearchText] = useState("");
  // ソートの初期値は備品名の昇順 (構成員一覧の学年昇順に相当する, このページで
  // 自然な既定順) にしている
  const [sortField, setSortField] = useState<EquipmentSortField>(EquipmentSortField.Name);
  const [sortDirection, setSortDirection] = useState<EquipmentSortDirection>(
    EquipmentSortDirection.Asc,
  );
  const [page, setPage] = useState(1);

  const matchedFilter = EQUIPMENT_FILTERS.find((filter) => filter.query === searchText);
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortEquipmentItems(items, sortField, sortDirection),
    [items, sortField, sortDirection],
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
      <EquipmentFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <EquipmentSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}

        <EquipmentListBox
          items={pageItems}
          totalCount={sorted.length}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, direction) => {
            setSortField(field);
            setSortDirection(direction);
          }}
          page={page}
        />

        {showPagination && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
      </main>
    </div>
  );
}

export { EquipmentLoansSection };
