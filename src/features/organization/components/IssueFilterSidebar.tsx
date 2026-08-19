import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconHome,
  IconUser,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./IssueFilterSidebar.module.css";

type IssueFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

const ISSUE_FILTERS: IssueFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "own", icon: IconUser, label: "自分の投稿", query: "投稿者: @私" },
  { key: "open", icon: IconExclamationCircle, label: "未解決", query: "状態: 未解決" },
  { key: "resolved", icon: IconCircleCheck, label: "解決済", query: "状態: 解決済" },
  { key: "rejected", icon: IconCircleX, label: "却下済", query: "状態: 却下済" },
];

type IssueFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// DocumentFilterSidebar と同じ土台 (menuItemBase + useFixedSidebarPosition)
// を使った, 指摘事項一覧の絞り込みボタン一覧
function IssueFilterSidebar({ searchText, onSelect }: IssueFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav aria-label="指摘事項の絞り込み" className={styles.root} style={position}>
        {ISSUE_FILTERS.map((filter) => {
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
    </div>
  );
}

export { ISSUE_FILTERS, IssueFilterSidebar };
