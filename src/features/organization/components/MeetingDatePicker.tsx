import { Icon } from "@src/components/ui/Icon";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

import {
  formatYearMonth,
  getMonthGridDays,
  isSameDay,
  isSameMonth,
  isWeekend,
  WEEKDAY_KANJI,
} from "../calendarUtils";
import navGroupStyles from "./calendarNavGroup.module.css";

import styles from "./MeetingDatePicker.module.css";

type MeetingDatePickerProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
};

// 会議作成フォーム (~/meetings/new) の日付選択. 「~/orgs/組織ID/meetings の
// サイドバーに表示するミニカレンダー (MiniCalendar) が表示され, そこから
// 選択できるようにしてほしい」という依頼のため, 見た目 (macOS のカレンダー
// アプリ風, calendarUtils/calendarNavGroup.module.css を共有) は MiniCalendar
// を踏襲していますが, MiniCalendar は「週」単位の選択 (カレンダーモードの
// 表示期間切り替え用) なのに対し, こちらは会議の開催「日」単位の選択が
// 必要なため, 別コンポーネントとして新規実装しています (「機能ごとに
// 似た構成でも別コンポーネントとして持つ」という既存の方針を踏襲)
function MeetingDatePicker({ selectedDate, onSelect }: MeetingDatePickerProps) {
  const today = new Date();
  const [monthAnchor, setMonthAnchor] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const days = getMonthGridDays(monthAnchor);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  const goToPreviousMonth = () => {
    setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>{formatYearMonth(monthAnchor)}</span>
        <div className={navGroupStyles.root}>
          <button
            type="button"
            aria-label="前の月"
            className={clsx(styles.navButton, navGroupStyles.item, navGroupStyles.tooltip)}
            onClick={goToPreviousMonth}
          >
            <Icon icon={IconChevronLeft} size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={clsx(styles.todayButton, navGroupStyles.item)}
            onClick={() => setMonthAnchor(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            今日
          </button>
          <button
            type="button"
            aria-label="次の月"
            className={clsx(styles.navButton, navGroupStyles.item, navGroupStyles.tooltip)}
            onClick={goToNextMonth}
          >
            <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.weekdayRow}>
        {WEEKDAY_KANJI.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div className={styles.weeks}>
        {weeks.map((week, weekIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 週は月内で常に一意な並び順を持つため安全
          <div key={weekIndex} className={styles.week}>
            {week.map((day) => {
              const inCurrentMonth = isSameMonth(day, monthAnchor);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  aria-label={`${day.getFullYear()}/${day.getMonth() + 1}/${day.getDate()}を選択`}
                  aria-pressed={isSelected}
                  className={styles.day}
                  onClick={() => onSelect(day)}
                >
                  <span
                    className={clsx(
                      styles.dayInner,
                      !inCurrentMonth && styles.dayOutside,
                      inCurrentMonth && isWeekend(day) && styles.dayWeekend,
                      isToday && !isSelected && styles.dayToday,
                      isSelected && styles.daySelected,
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { MeetingDatePicker };
