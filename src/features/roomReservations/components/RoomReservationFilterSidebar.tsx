import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MiniCalendar } from "@src/features/organization/components/MiniCalendar";
import { ViewMode } from "@src/features/organization/components/ViewModeToggle";
import { useFixedSidebarPosition } from "@src/features/organization/useFixedSidebarPosition";
import clsx from "clsx";
import { useEffect, useReducer, useRef } from "react";

import { ROOM_RESERVATION_FILTERS } from "../roomReservationFilters";

import styles from "./RoomReservationFilterSidebar.module.css";

// カレンダーモードでは日付そのものを見て使用予定/過去を判別できるため,
// 「使用予定」/「過去の利用」フィルターは (リストモードでのみ意味を持つ絞り込み
// のため) カレンダーモード中は非表示にする (MeetingFilterSidebar の
// DATE_RANGE_FILTER_KEYS と同じ考え方)
const DATE_RANGE_FILTER_KEYS = new Set(["upcoming", "past"]);

type RoomReservationFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
  // MiniCalendar にそのまま渡す (メインのカレンダーモードとの連動用)
  calendarWeekStart: Date;
  viewMode: ViewMode;
  onWeekSelect: (weekStart: Date) => void;
};

// MeetingFilterSidebar と同じ構造 (menuItemBase の絞り込みボタン一覧+下部に
// 分割線+ミニカレンダー, position: fixed でスクロール追従, 高さを div#root の
// 下端に揃える) — 会議のような「子組織を含む」概念が無いぶんフィルター数が
// 少ないだけで, MiniCalendar/useFixedSidebarPosition は features/organization/
// のものをそのまま再利用しています (どちらも会議固有のデータに依存しない
// 汎用の下回りのため — 詳細は各ファイルのコメントを参照)
function RoomReservationFilterSidebar({
  searchText,
  onSelect,
  calendarWeekStart,
  viewMode,
  onWeekSelect,
}: RoomReservationFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  // サイドバーの下端を window の下端ではなく div#root の下端に揃える
  // (MeetingFilterSidebar と全く同じ理由 — 詳細はそちらのコメントを参照)
  const [, remeasure] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const rootBottom =
    document.getElementById("root")?.getBoundingClientRect().bottom ?? window.innerHeight;
  const height = position === undefined ? undefined : Math.max(0, rootBottom - position.top);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <div className={styles.root} style={{ ...position, height }}>
        <nav aria-label="新館予約の絞り込み" className={styles.filterList}>
          {ROOM_RESERVATION_FILTERS.filter(
            (filter) => viewMode !== ViewMode.Calendar || !DATE_RANGE_FILTER_KEYS.has(filter.key),
          ).map((filter) => {
            const isActive = filter.query === searchText;
            return (
              <button
                key={filter.key}
                type="button"
                className={clsx(menuItemBase.root, isActive && menuItemBase.active)}
                onClick={() => onSelect(filter.query)}
              >
                {isActive && <CurrentContentBar />}
                <Icon icon={filter.icon} aria-hidden="true" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.calendarSection}>
          <Divider />
          <MiniCalendar
            highlightWeekStart={calendarWeekStart}
            showHighlight={viewMode === ViewMode.Calendar}
            onWeekSelect={onWeekSelect}
          />
        </div>
      </div>
    </div>
  );
}

export { RoomReservationFilterSidebar };
