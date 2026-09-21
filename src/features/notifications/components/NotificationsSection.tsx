import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { useMemo, useState } from "react";

import {
  type Notification,
  NotificationSortDirection,
  NotificationSortField,
} from "../types";
import { NOTIFICATION_FILTERS, NotificationFilterSidebar } from "./NotificationFilterSidebar";
import { NotificationListBox } from "./NotificationListBox";
import { NotificationSearchBar } from "./NotificationSearchBar";

import styles from "./NotificationsSection.module.css";

const PAGE_SIZE = 20;

function sortNotifications(
  notifications: Notification[],
  field: NotificationSortField,
  direction: NotificationSortDirection,
): Notification[] {
  const sorted = [...notifications].sort((a, b) => {
    if (field === NotificationSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === NotificationSortDirection.Asc ? sorted : sorted.reverse();
}

type NotificationsSectionProps = {
  notifications: Notification[];
};

// ~/notifications の本文. 「指摘事項/修正提案のリスト形式を踏襲しつつ,
// 既読/未読の区別も追加してほしい」という依頼のため, OrganizationDocumentsSection
// と同じ構造 (検索バー+フィルターサイドバー+ソート+ページネーション付き
// 一覧 Box) を踏襲している. 組織/文書ページのネストしたレイアウトには属さない
// 単独のトップレベルページのため, .root 自身が max-width/中央寄せを持つ
function NotificationsSection({ notifications }: NotificationsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<NotificationSortField>(
    NotificationSortField.OccurredAt,
  );
  const [sortDirection, setSortDirection] = useState<NotificationSortDirection>(
    NotificationSortDirection.Desc,
  );
  const [page, setPage] = useState(1);

  const matchedFilter = NOTIFICATION_FILTERS.find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortNotifications(notifications, sortField, sortDirection),
    [notifications, sortField, sortDirection],
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
      <NotificationFilterSidebar searchText={searchText} onSelect={handleSearchChange} />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>
        <NotificationSearchBar value={searchText} onChange={handleSearchChange} />

        {showPagination && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}

        <NotificationListBox
          notifications={pageItems}
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

export { NotificationsSection };
