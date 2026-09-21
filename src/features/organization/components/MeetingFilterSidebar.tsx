import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import clsx from "clsx";
import { useEffect, useReducer, useRef } from "react";

import { getMeetingFilters } from "../meetingFilters";
import { useFixedSidebarPosition } from "../useFixedSidebarPosition";
import { MiniCalendar } from "./MiniCalendar";
import { ViewMode } from "./ViewModeToggle";

import styles from "./MeetingFilterSidebar.module.css";

// カレンダーモードでは日付そのものを見て開催予定/過去を判別できるため,
// 「開催予定」/「過去の会議」フィルターは (リストモードでのみ意味を持つ絞り込み
// のため) カレンダーモード中は非表示にする — 対象の2件のキーをここに列挙する
const DATE_RANGE_FILTER_KEYS = new Set(["upcoming", "past"]);

type MeetingFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
  // MiniCalendar にそのまま渡す (メインのカレンダーモードとの連動用)
  calendarWeekStart: Date;
  // MiniCalendar の週ハイライト枠の表示可否 (リスト表示中は無関係なため非表示にする)
  viewMode: ViewMode;
  // MiniCalendar の週ボタンをクリックしたときにそのまま渡す
  onWeekSelect: (weekStart: Date) => void;
  // 組織プロフィールページ配下 (/orgs/:orgId/meetings) から使う場合は true
  // (getMeetingFilters@meetingFilters.ts を参照)
  scopedToOrganization?: boolean;
};

// メニュードロワーと同じ土台 (menuItemBase) を使った, 会議一覧の絞り込みボタン一覧.
// 選択中は検索欄の文字列と query が一致しているかどうかで判定する (フィルター自体は
// まだ実装しないため, 選択してもメイン側の一覧は絞り込まれない). 下部に分割線を挟み
// ミニカレンダー (MiniCalendar) を続けて表示する
function MeetingFilterSidebar({
  searchText,
  onSelect,
  calendarWeekStart,
  viewMode,
  onWeekSelect,
  scopedToOrganization,
}: MeetingFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);
  const filters = getMeetingFilters(Boolean(scopedToOrganization));
  // サイドバーの下端を window の下端ではなく div#root (アプリ全体の
  // マウント先, index.html) の下端に揃える — 「ミニカレンダーの最下部は,
  // windowの最下部ではなくdiv#rootの最下部に合わせてほしい」という依頼のため.
  // #root の下端は body.getBoundingClientRect() と同様 (詳細は
  // MeetingCalendarView.tsx を参照), position: fixed な子孫 (このサイドバー
  // 自身を含む) の分だけ膨張することはないため, 自分自身の高さを測るのに
  // 使っても循環参照にはならない. window.innerHeight (常に一定) と違い
  // #root の下端は viewport 相対の位置が scroll のたびに変わるため,
  // ここでも都度実測している — position (useFixedSidebarPosition が scroll
  // のたびに再計算して返す state) が変わるたびにこのコンポーネントも
  // 再描画されるため, scroll/resize に対しては専用のリスナーを別途持たなくても
  // 追従できる. ただし #root の高さは MeetingCalendarView 側の JS
  // (マウント後の rAF で高さを実測・確定する非同期処理, 詳細はそちらを参照)
  // によっても変わり得るため, ResizeObserver で #root 自体のサイズ変化も
  // 別途検知して再描画している — これが無いと, サイドバーが自身の
  // position/height を最初に計算した時点ではまだメイン側の高さが確定して
  // おらず, 古い #root の下端を元にした高さのまま取り残されることがあった
  const [, remeasure] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const rootBottom =
    document.getElementById("root")?.getBoundingClientRect().bottom ??
    window.innerHeight;
  const height =
    position === undefined ? undefined : Math.max(0, rootBottom - position.top);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <div className={styles.root} style={{ ...position, height }}>
        <nav aria-label="会議の絞り込み" className={styles.filterList}>
          {filters
            .filter(
              (filter) =>
                viewMode !== ViewMode.Calendar ||
                !DATE_RANGE_FILTER_KEYS.has(filter.key),
            )
            .map((filter) => {
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

        {/* サイドバーの縦幅いっぱいの .root の中で, 分割線+ミニカレンダーの
            ブロックだけを margin-top: auto で最下部に貼り付ける */}
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

export { MeetingFilterSidebar };
