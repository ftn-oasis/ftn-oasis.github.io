import { Icon } from "@src/components/ui/Icon";
import navGroupStyles from "@src/features/organization/components/calendarNavGroup.module.css";
import {
  addDays,
  dateKey,
  formatMonthDay,
  formatYearMonth,
  getDominantMonthAnchor,
  getWeeksGridDays,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfWeek,
  WEEKDAY_KANJI,
} from "@src/features/organization/calendarUtils";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import type { RoomReservation } from "../types";
import { RoomReservationCalendarCard } from "./RoomReservationCalendarCard";

import styles from "./RoomReservationCalendarView.module.css";

// 表示する週数 (MiniCalendar.tsx の HIGHLIGHT_WEEK_COUNT と揃える —
// サイドバーのハイライト枠がメインの表示期間と一致するようにするため.
// MeetingCalendarView.tsx と同じ値)
const WEEK_COUNT = 2;

// MeetingCalendarView.module.css の .dayCellTopRow/.dayCellBottomRow の
// min-height (200px/100px) の合計 — 実測が小さすぎる場合のフォールバック下限
const MIN_GRID_HEIGHT = 300;

// 列インデックス (0=日曜日, 6=土曜日) — 予約が1件も無い場合に幅を圧縮する対象
const WEEKEND_COLUMNS = [0, 6];
const COMPRESSED_COLUMN = "0.7fr";
const NORMAL_COLUMN = "1fr";

type RoomReservationCalendarViewProps = {
  // ページ分割前の全件. カレンダーは「ページ」ではなく日付で区切って表示するため
  reservations: RoomReservation[];
  weekStart: Date;
  onWeekStartChange: (weekStart: Date) => void;
};

// MeetingCalendarView と全く同じ構造 (「今日」ボタンを上下の矢印で挟んだ
// WEEK_COUNT週間分のカレンダー, 縦幅を window の下端に合わせて実測する仕組み,
// 予約の無い土日列の圧縮など) — 差分はデータの型 (OrganizationMeeting →
// RoomReservation, startsAt のみで判定) だけです. 実測の仕組みの詳細な理由
// (position: fixed のサイドバーが #root の高さ計算に寄与しないため, ここは
// window.innerHeight を使い続ける必要がある, など) は MeetingCalendarView.tsx
// のコメントを参照してください
function RoomReservationCalendarView({
  reservations,
  weekStart,
  onWeekStartChange,
}: RoomReservationCalendarViewProps) {
  const today = new Date();
  const days = getWeeksGridDays(weekStart, WEEK_COUNT);
  const displayMonthAnchor = getDominantMonthAnchor(weekStart, days);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState<number>();

  useEffect(() => {
    function updateGridHeight() {
      const grid = gridRef.current;
      if (!grid) return;
      const top = grid.getBoundingClientRect().top;
      setGridHeight(Math.max(MIN_GRID_HEIGHT, window.innerHeight - top));
    }
    updateGridHeight();
    const frame = requestAnimationFrame(updateGridHeight);
    window.addEventListener("resize", updateGridHeight);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateGridHeight);
    };
  }, []);

  const reservationsByDay = new Map<string, RoomReservation[]>();
  for (const day of days) {
    reservationsByDay.set(dateKey(day), []);
  }
  for (const reservation of reservations) {
    const key = dateKey(new Date(reservation.startsAt));
    reservationsByDay.get(key)?.push(reservation);
  }
  for (const dayReservations of reservationsByDay.values()) {
    dayReservations.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const columnFractions = Array.from({ length: 7 }, (_, column) => {
    if (!WEEKEND_COLUMNS.includes(column)) return NORMAL_COLUMN;
    const isEmpty = [days[column], days[column + 7]].every(
      (day) => (reservationsByDay.get(dateKey(day)) ?? []).length === 0,
    );
    return isEmpty ? COMPRESSED_COLUMN : NORMAL_COLUMN;
  });
  const gridTemplateColumns = columnFractions.join(" ");

  return (
    <div className={styles.root}>
      <div className={styles.nav}>
        <span className={styles.yearMonth}>{formatYearMonth(displayMonthAnchor)}</span>

        <div className={navGroupStyles.root}>
          <button
            type="button"
            aria-label="前週"
            className={clsx(styles.navButton, navGroupStyles.item)}
            onClick={() => onWeekStartChange(addDays(weekStart, -7))}
          >
            <Icon icon={IconChevronUp} size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={clsx(styles.todayButton, navGroupStyles.item)}
            onClick={() => onWeekStartChange(startOfWeek(today))}
          >
            今日
          </button>
          <button
            type="button"
            aria-label="次週"
            className={clsx(styles.navButton, navGroupStyles.item)}
            onClick={() => onWeekStartChange(addDays(weekStart, 7))}
          >
            <Icon icon={IconChevronDown} size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.weekdayRow} style={{ gridTemplateColumns }}>
        {WEEKDAY_KANJI.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div
        ref={gridRef}
        className={styles.grid}
        style={{ height: gridHeight, gridTemplateColumns }}
      >
        {days.map((day, index) => {
          const popoverAlign = index % 7 >= 4 ? "right" : "left";
          const isTopRow = index < 7;

          return (
            <div
              key={dateKey(day)}
              className={clsx(
                styles.dayCell,
                isTopRow ? styles.dayCellTopRow : styles.dayCellBottomRow,
                isWeekend(day) && styles.dayCellWeekend,
              )}
            >
              <span
                className={clsx(
                  styles.dayNumber,
                  isSameDay(day, today) && styles.dayNumberToday,
                )}
              >
                {isSameMonth(day, displayMonthAnchor)
                  ? day.getDate()
                  : formatMonthDay(day)}
              </span>
              <div className={styles.dayReservations}>
                {(reservationsByDay.get(dateKey(day)) ?? []).map((reservation) => (
                  <RoomReservationCalendarCard
                    key={reservation.id}
                    reservation={reservation}
                    popoverAlign={popoverAlign}
                    expanded={isTopRow}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { RoomReservationCalendarView };
