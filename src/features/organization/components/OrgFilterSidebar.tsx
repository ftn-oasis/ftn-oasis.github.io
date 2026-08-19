import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconBallFootball,
  IconBuildingCommunity,
  IconGavel,
  IconHeart,
  IconHome,
  IconScale,
  IconSchool,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./OrgFilterSidebar.module.css";

type OrgFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// 全て + OrganizationType の6種類. フィルター自体はまだ実装しない (他の
// 一覧と同じく選択すると検索欄に文字列を入れるだけ)
const ORG_FILTERS: OrgFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "class", icon: IconSchool, label: "学級", query: "種別: 学級" },
  {
    key: "executive-body",
    icon: IconGavel,
    label: "執行機関",
    query: "種別: 執行機関",
  },
  {
    key: "decision-making-body",
    icon: IconScale,
    label: "議決機関",
    query: "種別: 議決機関",
  },
  {
    key: "independent-committee",
    icon: IconBuildingCommunity,
    label: "独立委員会",
    query: "種別: 独立委員会",
  },
  { key: "club", icon: IconBallFootball, label: "クラブ", query: "種別: クラブ" },
  { key: "volunteer", icon: IconHeart, label: "有志", query: "種別: 有志" },
];

type OrgFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// DocumentFilterSidebar と同じ土台 (menuItemBase + useFixedSidebarPosition)
// を使った, 組織一覧の絞り込みボタン一覧
function OrgFilterSidebar({ searchText, onSelect }: OrgFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav aria-label="組織の絞り込み" className={styles.root} style={position}>
        {ORG_FILTERS.map((filter) => {
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

export { ORG_FILTERS, OrgFilterSidebar };
