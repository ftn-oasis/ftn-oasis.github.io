import { Icon } from "@src/components/ui/Icon";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

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
} from "../calendarUtils";
import type { OrganizationMeeting } from "../types";
import navGroupStyles from "./calendarNavGroup.module.css";
import { MeetingCalendarCard } from "./MeetingCalendarCard";

import styles from "./MeetingCalendarView.module.css";

// 表示する週数 (MiniCalendar.tsx の HIGHLIGHT_WEEK_COUNT と揃える —
// サイドバーのハイライト枠がメインの表示期間と一致するようにするため)
const WEEK_COUNT = 2;

// .dayCellTopRow/.dayCellBottomRow の min-height (200px/100px,
// MeetingCalendarView.module.css) の合計. 「現在の状態を下限として window の
// 下まで伸ばす」の「現在の状態」に相当する, 実測が小さすぎる場合の
// フォールバック下限
const MIN_GRID_HEIGHT = 300;

// 列インデックス (0=日曜日, 6=土曜日) — 会議が1件も無い場合に幅を圧縮する対象
const WEEKEND_COLUMNS = [0, 6];
// 「元の70%まで圧縮」— 圧縮しない列は 1fr のまま. fr 単位のため, 圧縮した分の
// 余白は他の列に自動的に再分配される (CSS Grid の fr の性質をそのまま利用)
const COMPRESSED_COLUMN = "0.7fr";
const NORMAL_COLUMN = "1fr";

type MeetingCalendarViewProps = {
  // ページ分割前の全件. カレンダーは「ページ」ではなく日付で区切って表示するため
  meetings: OrganizationMeeting[];
  // 表示するWEEK_COUNT週間の先頭 (日曜日)
  weekStart: Date;
  onWeekStartChange: (weekStart: Date) => void;
};

// 「今日」ボタンを上下の矢印 (1週間ずつ) で挟んだ, WEEK_COUNT週間分の
// カレンダー. リストモードのページネーションと同じ位置に表示する.
// ナビゲーションの移動量 (1週間) は表示週数 (WEEK_COUNT) とは独立している
// — 「1週間ずつ表示が切り替わるようにしてほしい」という依頼のため, 表示は
// 2週間分のまま, 矢印を押すたびに1週間だけスライドする.
//
// 縦幅は JS で実測して, その最下部が window の下端に来るようにしている —
// 「メインがカレンダー表示の場合には, その最下部がミニカレンダーの
// 最下部に来るようにしてほしい」という依頼のため. 当初は親の `.main` が
// CSS Grid の行の高さとしてサイドバーと揃って伸びるのに便乗する
// (`flex: 1 1 auto`) 方式でしたが, サイドバーを `position: fixed`
// (`useFixedSidebarPosition` を参照) にしたことでサイドバーがグリッドの
// 行の高さ計算に一切寄与しなくなり, この便乗方式が効かなくなりました
// (「サイドバーにはミニカレンダーも含めてください」という指摘はこの
// 不具合を指しています) — そのため, ここで改めて JS 実測に戻しています.
//
// **`MeetingFilterSidebar` (ミニカレンダー) は現在 `window.innerHeight`
// ではなく `div#root` の下端を目標にしていますが, ここ (.grid) は意図的に
// `window.innerHeight` のまま揃えていません** — 「ミニカレンダーの最下部は,
// windowの最下部ではなくdiv#rootの最下部に合わせてほしい」という依頼のため
// サイドバー側だけ切り替えました. `.grid` は通常のフロー上の要素で,
// その高さ自体が `#root` の下端を決める要因の1つなので, もし `.grid`
// の高さの目標を `#root` の下端から逆算すると「今の高さを反映した `#root`
// の下端」を次の目標にしてしまい, 測るたびに `OrganizationMeetingsSection`
// の `.root` の padding-bottom (24px) 分だけ際限なく伸び続ける循環になります
// — `MeetingFilterSidebar` は position: fixed で `#root` の下端の算出に
// 寄与しないため同じ問題が起きませんが (詳細はそちらの項を参照),
// こちらは `.grid` 自身に依存しない `window.innerHeight` を使い続ける
// 必要があります. **結果として `.grid` の下端はミニカレンダーの下端より
// padding-bottom 分 (24px) だけ浅い位置で止まります** — 「メイン最下部と
// ミニカレンダー最下部を一致させる」という当初の依頼に対しては厳密には
// 一致しなくなりましたが, 上記の循環を避けるための意図的なトレードオフです.
// ページ全体は依然として window よりわずかに (24px) 高くなり縦スクロール
// バーが出ます — サイドバー側は position: fixed で常にこの高さちょうどに
// 固定されているのに対し, メイン側 (`.main`) は通常のフロー上の要素の
// ままである, という非対称な構造上避けられないトレードオフです.
function MeetingCalendarView({
  meetings,
  weekStart,
  onWeekStartChange,
}: MeetingCalendarViewProps) {
  const today = new Date();
  const days = getWeeksGridDays(weekStart, WEEK_COUNT);
  // 見出しに表示する年月 — 表示中の2週間のうち日数の多い方の月 (同数なら上の週)
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
    // マウント直後の1回だけだと, 初回ペイント時点でまだ window の実際の
    // ビューポートが確定しきっておらず, ずれた高さで測ってしまうことが
    // あった (MeetingFilterSidebar の位置計測で確認済みの不具合と同種) —
    // 次のフレームでもう一度測り直すことで補正する
    const frame = requestAnimationFrame(updateGridHeight);
    window.addEventListener("resize", updateGridHeight);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateGridHeight);
    };
  }, []);

  const meetingsByDay = new Map<string, OrganizationMeeting[]>();
  for (const day of days) {
    meetingsByDay.set(dateKey(day), []);
  }
  for (const meeting of meetings) {
    const key = dateKey(new Date(meeting.startsAt));
    meetingsByDay.get(key)?.push(meeting);
  }
  for (const dayMeetings of meetingsByDay.values()) {
    dayMeetings.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  // 土日の列は, 上段/下段どちらの日にも会議が無ければ幅を70%に圧縮する.
  // 曜日見出し (.weekdayRow) にも同じ列幅を適用し, 圧縮後も曜日の文字が
  // その日の列の中央に来るようにする (どちらも grid-template-columns を
  // 動的に切り替えるだけで, 中央揃え自体は既存の text-align: center に任せる)
  const columnFractions = Array.from({ length: 7 }, (_, column) => {
    if (!WEEKEND_COLUMNS.includes(column)) return NORMAL_COLUMN;
    const isEmpty = [days[column], days[column + 7]].every(
      (day) => (meetingsByDay.get(dateKey(day)) ?? []).length === 0,
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
          // 木/金/土 (列4-6) はポップオーバーを右揃えにし, 画面右にはみ出さないようにする
          const popoverAlign = index % 7 >= 4 ? "right" : "left";
          // 上段の週 (今週) は次週の2倍程度の高さを取り, カードもその分
          // 拡張して詳細を直接表示する (「上の週はその次の週の2倍程度の幅を
          // 取り, カードを拡張してより詳細な内容を表示する」という依頼のため)
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
              <div className={styles.dayMeetings}>
                {(meetingsByDay.get(dateKey(day)) ?? []).map((meeting) => (
                  <MeetingCalendarCard
                    key={meeting.id}
                    meeting={meeting}
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

export { MeetingCalendarView };
