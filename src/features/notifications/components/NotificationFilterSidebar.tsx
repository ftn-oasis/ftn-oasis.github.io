import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { IconHome, IconMailOpened, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

import styles from "./NotificationFilterSidebar.module.css";

type NotificationFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

const NOTIFICATION_FILTERS: NotificationFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  { key: "unread", icon: IconMailOpened, label: "未読のみ", query: "既読: false" },
];

type NotificationFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// menuItemBase を土台にした, 通知一覧の絞り込みボタン一覧. 「既読/未読の
// 区別も追加してほしい」という依頼のため, 全て/未読のみの2件にしている
// (他のサイドバーと違い, 通知一覧はページ単独の一覧のため
// useFixedSidebarPosition は使わず通常のフローのまま配置している)
function NotificationFilterSidebar({
  searchText,
  onSelect,
}: NotificationFilterSidebarProps) {
  return (
    <nav aria-label="通知の絞り込み" className={styles.root}>
      {NOTIFICATION_FILTERS.map((filter) => {
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
  );
}

export { NOTIFICATION_FILTERS, NotificationFilterSidebar };
