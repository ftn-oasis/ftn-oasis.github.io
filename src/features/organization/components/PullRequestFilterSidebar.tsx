import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconGitMerge,
  IconGitPullRequest,
  IconGitPullRequestClosed,
  IconHome,
  IconUser,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./PullRequestFilterSidebar.module.css";

type PullRequestFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

const PULL_REQUEST_FILTERS: PullRequestFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "own", icon: IconUser, label: "自分の投稿", query: "投稿者: @私" },
  {
    key: "pending",
    icon: IconGitPullRequest,
    label: "修正待",
    query: "状態: 修正待",
  },
  { key: "fixed", icon: IconGitMerge, label: "修正済", query: "状態: 修正済" },
  {
    key: "rejected",
    icon: IconGitPullRequestClosed,
    label: "却下",
    query: "状態: 却下",
  },
];

type PullRequestFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// IssueFilterSidebar と同じ土台 (menuItemBase + useFixedSidebarPosition) を
// 使った, 修正提案一覧の絞り込みボタン一覧
function PullRequestFilterSidebar({
  searchText,
  onSelect,
}: PullRequestFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav aria-label="修正提案の絞り込み" className={styles.root} style={position}>
        {PULL_REQUEST_FILTERS.map((filter) => {
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

export { PULL_REQUEST_FILTERS, PullRequestFilterSidebar };
