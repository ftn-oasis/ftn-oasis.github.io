// /orgs/:orgId/meetings のカレンダー表示 (サイドバーのミニカレンダー/メインの
// 2週間カレンダー) で共通して使う日付計算. 週の始まりは日曜日で統一している

const WEEKDAY_KANJI = ["日", "月", "火", "水", "木", "金", "土"];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 日曜日始まりの週の先頭 (時刻は 0:00) を返す
function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 月を rowCount 行×7列で表示するための, 日曜日始まりのグリッド用日付配列.
// 月によって実際の週数は変わるが, ミニカレンダーの高さを揃えるため既定では
// 常に6行分返す. MiniCalendar がハイライトする2週間が月末にかかり6行に
// 収まらない場合だけ, 呼び出し側が rowCount を7に増やして呼び出す
function getMonthGridDays(monthAnchor: Date, rowCount = 6): Date[] {
  const gridStart = startOfWeek(startOfMonth(monthAnchor));
  return Array.from({ length: rowCount * 7 }, (_, index) => addDays(gridStart, index));
}

// weekStart (日曜日) を起点に, weekCount 週間分の日付配列を返す
// (メインのカレンダーモードの表示週数分, ミニカレンダーのハイライト範囲の計算, 両方で使う)
function getWeeksGridDays(weekStart: Date, weekCount: number): Date[] {
  return Array.from({ length: weekCount * 7 }, (_, index) => addDays(weekStart, index));
}

// 表示中の日付群 (days) のうち, 最も日数の多い月を表す Date (日は1固定) を返す.
// 同数の場合は先頭週 (weekStart) の月を優先する — MeetingCalendarView が
// 見出しの年月, および月をまたぐ日付の MM/DD 表示判定に使う
function getDominantMonthAnchor(weekStart: Date, days: Date[]): Date {
  const counts = new Map<string, number>();
  for (const day of days) {
    const key = `${day.getFullYear()}-${day.getMonth()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const topWeekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
  let bestKey = topWeekKey;
  let bestCount = counts.get(topWeekKey) ?? 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }
  const [year, month] = bestKey.split("-").map(Number);
  return new Date(year, month, 1);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

// カレンダー表示で「同じ日か」をグルーピングするためのキー. Date.toISOString()
// は UTC に変換されてしまい, ローカルタイムゾーンが UTC からずれていると
// getDate() 等 (ローカル基準) の表示と1日ずれる不具合になるため, 必ずローカルの
// 年月日から組み立てる
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}/${pad2(date.getMonth() + 1)}`;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

// 見出しに表示中の月と日付の月が異なる場合 (月をまたぐ週) に, その日付を
// 「DD」ではなく「MM/DD」として表示するための書式
function formatMonthDay(date: Date): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

function formatTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export {
  addDays,
  dateKey,
  formatDate,
  formatDateTime,
  formatMonthDay,
  formatTime,
  formatYearMonth,
  getDominantMonthAnchor,
  getMonthGridDays,
  getWeeksGridDays,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfWeek,
  WEEKDAY_KANJI,
};
