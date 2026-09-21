import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import clsx from "clsx";
import { useRef } from "react";

import { getTransactionFilters } from "../transactionFilters";
import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./TransactionFilterSidebar.module.css";

type TransactionFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
  // 組織プロフィールページ配下 (/orgs/:orgId/book) から使う場合は true
  // (getTransactionFilters@transactionFilters.ts を参照)
  scopedToOrganization?: boolean;
};

// メニュードロワーと同じ土台 (menuItemBase) を使った, 入出金一覧の絞り込みボタン一覧.
// 選択中は検索欄の文字列と query が一致しているかどうかで判定する (フィルター自体は
// まだ実装しないため, 選択してもメイン側の一覧は絞り込まれない)
function TransactionFilterSidebar({
  searchText,
  onSelect,
  scopedToOrganization,
}: TransactionFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);
  const filters = getTransactionFilters(Boolean(scopedToOrganization));

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav
        aria-label="入出金の絞り込み"
        className={styles.root}
        style={position}
      >
        {filters.map((filter) => {
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

export { TransactionFilterSidebar };
