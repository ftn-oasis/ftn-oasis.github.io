import { Icon } from "@src/components/ui/Icon";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

import {
  formatDate,
  formatYearMonth,
  getMonthGridDays,
  isSameDay,
  isSameMonth,
  isWeekend,
  WEEKDAY_KANJI,
} from "../calendarUtils";
import navGroupStyles from "./calendarNavGroup.module.css";

import styles from "./MiniCalendar.module.css";

// メインのカレンダーモードが表示中の週数 (MeetingCalendarView.tsx の WEEK_COUNT と揃える)
const HIGHLIGHT_WEEK_COUNT = 2;

type MiniCalendarProps = {
  // メインのカレンダーモードが表示中の期間の先頭 (日曜日). この期間を枠で囲んで,
  // メイン側と連動していることを示す
  highlightWeekStart: Date;
  // メインがリスト表示のときは, カレンダーモードの表示期間を示す枠が無関係になる
  // ため非表示にする (呼び出し元が viewMode === Calendar かどうかを渡す)
  showHighlight: boolean;
  // 週の行 (ボタン) をクリックしたときに, その週の先頭 (日曜日) を渡す.
  // メインがカレンダーモードならその週を先頭に表示, リストモードなら期間で
  // 検索欄を絞り込む, という判断は呼び出し元 (OrganizationMeetingsSection) が行う
  onWeekSelect: (weekStart: Date) => void;
};

// highlightWeekStart の月を6行 (42日) のグリッドで表示しようとしたとき,
// ハイライトする2週間 (HIGHLIGHT_WEEK_COUNT) の末尾が6行目 (末尾の行) に
// かかって見切れてしまうかどうかを判定する
function highlightOverflowsSixRows(monthAnchor: Date, highlightWeekStart: Date): boolean {
  const days = getMonthGridDays(monthAnchor);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const highlightWeekIndex = weeks.findIndex((week) => isSameDay(week[0], highlightWeekStart));
  return (
    highlightWeekIndex !== -1 && highlightWeekIndex + HIGHLIGHT_WEEK_COUNT - 1 >= weeks.length
  );
}

// highlightWeekStart が属する月を返す. ただしその月だと6行のグリッドで
// ハイライトが見切れてしまう場合は, 代わりに翌月を返す — 月末に近い週は
// 翌月グリッドの1行目 (前月末の前詰め) として必ず収まるため, 7行目を追加する
// のではなく「見切れる場合は翌月の表示にする」方針で回避する
function resolveHighlightMonthAnchor(highlightWeekStart: Date): Date {
  const ownMonth = new Date(highlightWeekStart.getFullYear(), highlightWeekStart.getMonth(), 1);
  if (!highlightOverflowsSixRows(ownMonth, highlightWeekStart)) {
    return ownMonth;
  }
  return new Date(ownMonth.getFullYear(), ownMonth.getMonth() + 1, 1);
}

// macOS のカレンダーアプリ左下にあるようなミニカレンダー. 表示月は自身の
// 前月/翌月/今日ボタンで独立して移動できるが, メイン側の表示期間 (週) が
// 変わった際は自動でその月に切り替わる (「メインの表示に合わせてカレンダーを
// 切り替える」ため) — 手動で別の月に移動していても, メイン側の状態が変わった
// 時点でそちらが優先される. この自動追従だけは resolveHighlightMonthAnchor
// を通し, ハイライトが見切れる月には自動では止まらないようにしている
// (手動の前月/翌月ボタンは単純な±1か月のままで, この回避処理の対象外)
function MiniCalendar({
  highlightWeekStart,
  showHighlight,
  onWeekSelect,
}: MiniCalendarProps) {
  const today = new Date();
  const [monthAnchor, setMonthAnchor] = useState(() =>
    resolveHighlightMonthAnchor(highlightWeekStart),
  );
  // highlightWeekStart (メイン側の表示期間) が変わったタイミングで, レンダー中に
  // monthAnchor を追従させる — 「メインの表示に合わせてカレンダーを切り替える」ため.
  // useEffect + setState だとカスケードする再レンダーになるため, レンダー中に
  // 直接 setState する React 公式の "props に応じて state を調整する" パターンを使う
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [prevHighlightWeekStart, setPrevHighlightWeekStart] = useState(highlightWeekStart);
  if (highlightWeekStart !== prevHighlightWeekStart) {
    setPrevHighlightWeekStart(highlightWeekStart);
    setMonthAnchor(resolveHighlightMonthAnchor(highlightWeekStart));
  }

  const days = getMonthGridDays(monthAnchor);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  // メイン側が表示中の期間のうち, 先頭週がこのグリッド内に見つかった場合だけ枠を表示する
  const highlightWeekIndex = weeks.findIndex((week) => isSameDay(week[0], highlightWeekStart));
  const highlightWeekEndIndex = highlightWeekIndex + HIGHLIGHT_WEEK_COUNT - 1;

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
            onClick={() => setMonthAnchor(new Date())}
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
        {weeks.map((week, weekIndex) => {
          const isHighlighted =
            showHighlight &&
            highlightWeekIndex !== -1 &&
            weekIndex >= highlightWeekIndex &&
            weekIndex <= highlightWeekEndIndex;

          return (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: 週は月内で常に一意な並び順を持つため安全
              key={weekIndex}
              aria-label={`${formatDate(week[0])}の週を表示`}
              className={clsx(
                styles.week,
                isHighlighted && styles.weekHighlighted,
                isHighlighted && weekIndex === highlightWeekIndex && styles.weekHighlightTop,
                isHighlighted &&
                  weekIndex === highlightWeekEndIndex &&
                  styles.weekHighlightBottom,
              )}
              onClick={() => onWeekSelect(week[0])}
            >
              {week.map((day) => {
                // 「当月」は今日ではなく, 現在表示中の月 (monthAnchor) が基準
                const inCurrentMonth = isSameMonth(day, monthAnchor);
                const isToday = isSameDay(day, today);

                return (
                  <span key={day.toISOString()} className={styles.day}>
                    <span
                      className={clsx(
                        styles.dayInner,
                        !inCurrentMonth && styles.dayOutside,
                        inCurrentMonth && isWeekend(day) && styles.dayWeekend,
                        isToday && styles.dayToday,
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MiniCalendar };
