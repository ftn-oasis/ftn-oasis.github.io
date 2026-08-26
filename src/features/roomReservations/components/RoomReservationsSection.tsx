import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import { addDays, formatDate, startOfWeek } from "@src/features/organization/calendarUtils";
import { ViewMode, ViewModeToggle } from "@src/features/organization/components/ViewModeToggle";
import clsx from "clsx";
import { useMemo, useState } from "react";

import { ROOM_RESERVATION_FILTERS } from "../roomReservationFilters";
import {
  type RoomReservation,
  RoomReservationSortDirection,
  RoomReservationSortField,
} from "../types";
import { RoomReservationCalendarView } from "./RoomReservationCalendarView";
import { RoomReservationFilterSidebar } from "./RoomReservationFilterSidebar";
import { RoomReservationListBox } from "./RoomReservationListBox";
import { RoomReservationSearchBar } from "./RoomReservationSearchBar";

import styles from "./RoomReservationsSection.module.css";

const PAGE_SIZE = 20;

function sortReservations(
  reservations: RoomReservation[],
  field: RoomReservationSortField,
  direction: RoomReservationSortDirection,
): RoomReservation[] {
  const sorted = [...reservations].sort((a, b) => {
    if (field === RoomReservationSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === RoomReservationSortDirection.Asc ? sorted : sorted.reverse();
}

type RoomReservationsSectionProps = {
  reservations: RoomReservation[];
};

// ~/room-reservations の本文. 「~/orgs/:orgId/meetings
// (OrganizationMeetingsSection) を参考にしてほしい」という依頼のため, ほぼ
// 同じ構造 (検索バー+フィルターサイドバー+リスト/カレンダー表示切り替え+
// ページネーション付き一覧 Box) を踏襲しています. 組織/文書のネストした
// レイアウトには属さない単独のトップレベルページのため, .root 自身が
// max-width/中央寄せを持ちます (NotificationsSection と同じ考え方)
function RoomReservationsSection({ reservations }: RoomReservationsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<RoomReservationSortField>(
    RoomReservationSortField.StartsAt,
  );
  const [sortDirection, setSortDirection] = useState<RoomReservationSortDirection>(
    RoomReservationSortDirection.Desc,
  );
  const [page, setPage] = useState(1);
  // 既定はカレンダー表示 (会議一覧と同じ標準方針)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Calendar);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => startOfWeek(new Date()));

  const matchedFilter = ROOM_RESERVATION_FILTERS.find((filter) => filter.query === searchText);
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortReservations(reservations, sortField, sortDirection),
    [reservations, sortField, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  // サイドバーのミニカレンダーで週を選択したときの挙動 —
  // OrganizationMeetingsSection.handleCalendarWeekSelect と同じ考え方
  const handleCalendarWeekSelect = (weekStart: Date) => {
    if (viewMode === ViewMode.Calendar) {
      setCalendarWeekStart(weekStart);
      return;
    }
    const weekEnd = addDays(weekStart, 6);
    handleSearchChange(`期間: ${formatDate(weekStart)}-${formatDate(weekEnd)}`);
  };

  const showPagination = viewMode === ViewMode.List && pageCount > 1;

  return (
    <div
      className={clsx(styles.root, viewMode === ViewMode.Calendar && styles.rootCalendarMode)}
    >
      <RoomReservationFilterSidebar
        searchText={searchText}
        onSelect={handleSearchChange}
        calendarWeekStart={calendarWeekStart}
        viewMode={viewMode}
        onWeekSelect={handleCalendarWeekSelect}
      />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>

        <div className={styles.searchRow}>
          <RoomReservationSearchBar value={searchText} onChange={handleSearchChange} />
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === ViewMode.List ? (
          <>
            {showPagination && (
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            )}

            <RoomReservationListBox
              reservations={pageItems}
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
          </>
        ) : (
          <RoomReservationCalendarView
            reservations={reservations}
            weekStart={calendarWeekStart}
            onWeekStartChange={setCalendarWeekStart}
          />
        )}
      </main>
    </div>
  );
}

export { RoomReservationsSection };
