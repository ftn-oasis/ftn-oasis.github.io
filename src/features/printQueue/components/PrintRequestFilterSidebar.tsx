import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import clsx from "clsx";

import { PRINT_REQUEST_FILTERS } from "../printRequestFilters";

import styles from "./PrintRequestFilterSidebar.module.css";

type PrintRequestFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// menuItemBase を土台にした, 印刷状況一覧の絞り込みボタン一覧. 選択中は検索欄の
// 文字列と query が一致しているかどうかで判定する (フィルター自体はまだ実装
// しないため, 選択してもメイン側の一覧は絞り込まれない — DocumentFilterSidebar
// と同じ考え方). ~/print-queue は組織ページのネストしたレイアウトに属さない
// 単独のトップレベルページのため, NotificationFilterSidebar と同じく
// useFixedSidebarPosition (features/organization/) は使わず通常のフローの
// まま配置している
function PrintRequestFilterSidebar({ searchText, onSelect }: PrintRequestFilterSidebarProps) {
  return (
    <nav aria-label="印刷依頼の絞り込み" className={styles.root}>
      {PRINT_REQUEST_FILTERS.map((filter) => {
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

export { PrintRequestFilterSidebar };
