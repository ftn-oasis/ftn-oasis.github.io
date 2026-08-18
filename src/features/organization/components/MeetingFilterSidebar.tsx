import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconArchive,
  IconBinaryTree,
  IconCalendarEvent,
  IconCalendarOff,
  IconCalendarRepeat,
  IconHome,
  IconUsers,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useReducer, useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";
import { MiniCalendar } from "./MiniCalendar";
import { ViewMode } from "./ViewModeToggle";

import styles from "./MeetingFilterSidebar.module.css";

type MeetingFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// 選択中の判定 (検索欄の文字列と query の一致) は呼び出し元 (親コンポーネント) が
// この配列を見て行うため export する
const MEETING_FILTERS: MeetingFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  {
    key: "own-org-only",
    icon: IconBinaryTree,
    label: "組織内のみ",
    query: "子組織: false",
  },
  {
    key: "upcoming",
    icon: IconCalendarEvent,
    label: "開催予定",
    query: "開催日: 未来",
  },
  {
    key: "required",
    icon: IconUsers,
    label: "要参加",
    query: "参加者: @私",
  },
  {
    key: "postponed",
    icon: IconCalendarRepeat,
    label: "延会",
    query: "延会: true",
  },
  {
    key: "canceled",
    icon: IconCalendarOff,
    label: "流会",
    query: "流会: true",
  },
  {
    key: "past",
    icon: IconArchive,
    label: "過去の会議",
    query: "開催日: 過去",
  },
];

type MeetingFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
  // MiniCalendar にそのまま渡す (メインのカレンダーモードとの連動用)
  calendarWeekStart: Date;
  // MiniCalendar の週ハイライト枠の表示可否 (リスト表示中は無関係なため非表示にする)
  viewMode: ViewMode;
  // MiniCalendar の週ボタンをクリックしたときにそのまま渡す
  onWeekSelect: (weekStart: Date) => void;
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
}: MeetingFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);
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
          {MEETING_FILTERS.map((filter) => {
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

export { MEETING_FILTERS, MeetingFilterSidebar };
