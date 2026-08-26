import { Icon } from "@src/components/ui/Icon";
import {
  addDays,
  dateKey,
  formatDate,
  formatYearMonth,
  getMonthGridDays,
  isSameDay,
  isSameMonth,
  isWeekend,
  WEEKDAY_KANJI,
} from "@src/features/organization/calendarUtils";
import navGroupStyles from "@src/features/organization/components/calendarNavGroup.module.css";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import clsx from "clsx";
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";

import styles from "./EquipmentDateRangePicker.module.css";

type DragMode = "start" | "end" | "range";

type EquipmentDateRangePickerProps = {
  startDate: Date;
  endDate: Date;
  onChange: (nextStart: Date, nextEnd: Date) => void;
};

// UTC 起点の日数差分 — ローカルタイムの Date 同士をそのまま引き算すると DST
// (夏時間) を挟む地域で1日ずれる可能性があるため, 年月日から組み立てた UTC
// ミリ秒同士で差分を取る (dateKey が toISOString() を避けて年月日から組み立てる
// のと対称的に, ここでは逆に UTC 化することでタイムゾーンの影響そのものを断つ)
function diffInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / (24 * 60 * 60 * 1000));
}

// 備品貸出申請 (~/equipment-loans/new) の「借りる期間」— 「ミニカレンダーに枠を
// 表示し, それをドラッグすることで選択範囲を調節してほしい」という依頼のため,
// MeetingDatePicker (単一の日をクリックで選ぶだけ) を参考にしつつ, 選択中の
// 期間 (startDate〜endDate) を表す枠を常時表示し, 次の3種類のドラッグ操作で
// 調節できるようにしています (「機能ごとに似た構成でも別コンポーネントとして
// 持つ」既存の方針のため MeetingDatePicker 自体は変更せず新規実装です):
//
// - 枠の左端 (開始日セルの左端の取っ手) をドラッグ — 開始日だけを変更します
//   (終了日を超えて右には動かせません).
// - 枠の右端 (終了日セルの右端の取っ手) をドラッグ — 終了日だけを変更します
//   (開始日を下回って左には動かせません).
// - 枠の中央 (取っ手以外の, 選択範囲内のセル) をドラッグ — 期間の長さを保った
//   まま範囲全体を移動します.
//
// ドラッグの検出は HTML5 Drag and Drop API ではなく, 各セルの mousedown で
// 開始し, 経由したセルの mouseenter で追跡し, window の mouseup で終了する
// という素朴な mouse イベントの組み合わせです — この種のグリッド上のドラッグ
// 選択に対して HTML5 DnD はドラッグ中のプレビュー画像/ドロップ判定など
// 本来オーバースペックな機能が多いため採用していません
function EquipmentDateRangePicker({ startDate, endDate, onChange }: EquipmentDateRangePickerProps) {
  const today = new Date();
  const [monthAnchor, setMonthAnchor] = useState(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1),
  );
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  // "range" (中央) ドラッグ中, 開始時点の (経由セルの日付, 開始日, 終了日) を
  // 保持し, 以降は「開始時点からの差分日数」を開始日/終了日の両方にそのまま
  // 適用する — 毎 mouseenter で startDate/endDate を直接書き換えると, 移動量の
  // 基準が徐々にずれて期間の長さが変わってしまうため, 常にドラッグ開始時点を
  // 基準にする
  const dragOriginRef = useRef<{ day: Date; start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (!dragMode) return;
    const handleMouseUp = () => setDragMode(null);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [dragMode]);

  const days = getMonthGridDays(monthAnchor);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  const goToPreviousMonth = () => {
    setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setMonthAnchor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const beginDrag = (mode: DragMode, day: Date) => (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragMode(mode);
    dragOriginRef.current = { day, start: startDate, end: endDate };
  };

  const handleDayEnter = (day: Date) => {
    if (!dragMode) return;
    // 開始日/終了日側それぞれのクランプは, day (常にローカル 00:00) と
    // startDate/endDate (呼び出し元の初期値次第では時刻を持ちうる) を dateKey
    // (年月日の文字列) で比較する — Date 同士の生の大小比較だと, 同じ暦日でも
    // startDate/endDate 側に 0 以外の時刻が乗っていた場合に誤って弾かれてしまう
    // (例: 終了日を開始日と同じ日までドラッグしても, 開始日の時刻が 00:00
    // より後だと day <= endDate が false 扱いになる)
    if (dragMode === "start") {
      onChange(dateKey(day) <= dateKey(endDate) ? day : endDate, endDate);
      return;
    }
    if (dragMode === "end") {
      onChange(startDate, dateKey(day) >= dateKey(startDate) ? day : startDate);
      return;
    }
    if (dragMode === "range" && dragOriginRef.current) {
      const delta = diffInDays(day, dragOriginRef.current.day);
      onChange(addDays(dragOriginRef.current.start, delta), addDays(dragOriginRef.current.end, delta));
    }
  };

  const startKey = dateKey(startDate);
  const endKey = dateKey(endDate);
  const dayCount = diffInDays(endDate, startDate) + 1;

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

      <div className={clsx(styles.weeks, dragMode && styles.weeksDragging)}>
        {weeks.map((week, weekIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 週は月内で常に一意な並び順を持つため安全
          <div key={weekIndex} className={styles.week}>
            {week.map((day) => {
              const inCurrentMonth = isSameMonth(day, monthAnchor);
              const isToday = isSameDay(day, today);
              const key = dateKey(day);
              const inRange = key >= startKey && key <= endKey;
              const isRangeStart = key === startKey;
              const isRangeEnd = key === endKey;

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: ドラッグ中に経由したセルを追跡するためだけの mouseenter — 実際に操作可能なのは中の各 <button> (rangeBackground/handleStart/handleEnd) で, ドラッグという性質上キーボード等価物も無い
                <div
                  key={day.toISOString()}
                  className={styles.day}
                  onMouseEnter={() => handleDayEnter(day)}
                >
                  {inRange && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      className={clsx(
                        styles.rangeBackground,
                        isRangeStart && styles.rangeStartCap,
                        isRangeEnd && styles.rangeEndCap,
                      )}
                      onMouseDown={beginDrag("range", day)}
                    />
                  )}
                  {isRangeStart && (
                    <button
                      type="button"
                      aria-label="開始日をドラッグで変更"
                      className={styles.handleStart}
                      onMouseDown={beginDrag("start", day)}
                    />
                  )}
                  {isRangeEnd && (
                    <button
                      type="button"
                      aria-label="終了日をドラッグで変更"
                      className={styles.handleEnd}
                      onMouseDown={beginDrag("end", day)}
                    />
                  )}
                  <span
                    className={clsx(
                      styles.dayInner,
                      !inCurrentMonth && styles.dayOutside,
                      inCurrentMonth && isWeekend(day) && styles.dayWeekend,
                      isToday && !inRange && styles.dayToday,
                      inRange && styles.dayInRange,
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className={styles.summary}>
        {formatDate(startDate)} 〜 {formatDate(endDate)} ({dayCount}日間)
      </p>
    </div>
  );
}

export { EquipmentDateRangePicker };
