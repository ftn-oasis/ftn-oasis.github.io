import { Divider } from "@src/components/ui/Divider";
import { Pagination } from "@src/components/ui/Pagination";
import clsx from "clsx";
import { useMemo, useState } from "react";

import { addDays, formatDate, startOfWeek } from "../calendarUtils";
import { getMeetingFilters } from "../meetingFilters";
import {
  MeetingSortDirection,
  MeetingSortField,
  type OrganizationMeeting,
} from "../types";
import { MeetingCalendarView } from "./MeetingCalendarView";
import { MeetingFilterSidebar } from "./MeetingFilterSidebar";
import { MeetingListBox } from "./MeetingListBox";
import { MeetingSearchBar } from "./MeetingSearchBar";
import { ViewMode, ViewModeToggle } from "./ViewModeToggle";

import styles from "./OrganizationMeetingsSection.module.css";

const PAGE_SIZE = 20;

function sortMeetings(
  meetings: OrganizationMeeting[],
  field: MeetingSortField,
  direction: MeetingSortDirection,
): OrganizationMeeting[] {
  const sorted = [...meetings].sort((a, b) => {
    if (field === MeetingSortField.Title) {
      return a.title.localeCompare(b.title, "ja");
    }
    return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
  });
  return direction === MeetingSortDirection.Asc ? sorted : sorted.reverse();
}

type OrganizationMeetingsSectionProps = {
  meetings: OrganizationMeeting[];
  // 組織プロフィールページ配下 (/orgs/:orgId/meetings) から使う場合は true.
  // MeetingFilterSidebar にそのまま渡す (getMeetingFilters を参照)
  scopedToOrganization?: boolean;
};

// OrganizationDocumentsSection と同じ構造 (検索バー + フィルターサイドバー +
// ページネーション付きの一覧 Box) をベースに, リスト/カレンダーの表示切り替えを
// 追加した, 会議一覧 (/orgs/:orgId/meetings) の本文
function OrganizationMeetingsSection({
  meetings,
  scopedToOrganization,
}: OrganizationMeetingsSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<MeetingSortField>(
    MeetingSortField.StartsAt,
  );
  const [sortDirection, setSortDirection] = useState<MeetingSortDirection>(
    MeetingSortDirection.Desc,
  );
  const [page, setPage] = useState(1);
  // 既定はカレンダー表示 (「カレンダー表示が標準になるようにしてほしい」という依頼のため)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Calendar);
  // カレンダーモードで表示する2週間の先頭 (日曜日). 既定は今日を含む週
  const [calendarWeekStart, setCalendarWeekStart] = useState(() =>
    startOfWeek(new Date()),
  );

  // 検索欄の文字列がサイドバーのいずれかのフィルターと完全一致する場合だけ,
  // その見出しを表示する (フィルター自体はまだ実装しないため, 一覧は絞り込まれない)
  const matchedFilter = getMeetingFilters(Boolean(scopedToOrganization)).find(
    (filter) => filter.query === searchText,
  );
  const heading = matchedFilter ? matchedFilter.label : "全て";

  const sorted = useMemo(
    () => sortMeetings(meetings, sortField, sortDirection),
    [meetings, sortField, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  // サイドバーのミニカレンダーで週を選択したときの挙動 — カレンダーモードなら
  // その週を先頭に表示 (「その週が上に来るような表示」), リストモードなら
  // 他のフィルターと同じ「ラベル: 値」形式の文字列を検索欄に入れて絞り込む
  // (フィルター自体はまだ実装しないため, 実際には一覧は絞り込まれない)
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
      className={clsx(
        styles.root,
        viewMode === ViewMode.Calendar && styles.rootCalendarMode,
      )}
    >
      <MeetingFilterSidebar
        searchText={searchText}
        onSelect={handleSearchChange}
        calendarWeekStart={calendarWeekStart}
        viewMode={viewMode}
        onWeekSelect={handleCalendarWeekSelect}
        scopedToOrganization={scopedToOrganization}
      />

      <Divider orientation="vertical" />

      <main className={styles.main}>
        <h1 className={styles.heading}>{heading}</h1>

        <div className={styles.searchRow}>
          <MeetingSearchBar value={searchText} onChange={handleSearchChange} />
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === ViewMode.List ? (
          <>
            {showPagination && (
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            )}

            <MeetingListBox
              meetings={pageItems}
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
          <MeetingCalendarView
            meetings={meetings}
            weekStart={calendarWeekStart}
            onWeekStartChange={setCalendarWeekStart}
          />
        )}
      </main>
    </div>
  );
}

export { OrganizationMeetingsSection };
