import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconArchive,
  IconBinaryTree,
  IconHome,
  IconMoneybagMinus,
  IconMoneybagPlus,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./TransactionFilterSidebar.module.css";

type TransactionFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// 選択中の判定 (検索欄の文字列と query の一致) は呼び出し元 (親コンポーネント) が
// この配列を見て行うため export する
const TRANSACTION_FILTERS: TransactionFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  {
    key: "own-org-only",
    icon: IconBinaryTree,
    label: "組織内のみ",
    query: "子組織: false",
  },
  {
    key: "expense",
    icon: IconMoneybagMinus,
    label: "支出",
    query: "種別: 支出 有効: true",
  },
  {
    key: "income",
    icon: IconMoneybagPlus,
    label: "収入",
    query: "種別: 収入 有効: true",
  },
  {
    key: "archived",
    icon: IconArchive,
    label: "無効化済",
    query: "有効: false",
  },
];

type TransactionFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// メニュードロワーと同じ土台 (menuItemBase) を使った, 入出金一覧の絞り込みボタン一覧.
// 選択中は検索欄の文字列と query が一致しているかどうかで判定する (フィルター自体は
// まだ実装しないため, 選択してもメイン側の一覧は絞り込まれない)
function TransactionFilterSidebar({
  searchText,
  onSelect,
}: TransactionFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav
        aria-label="入出金の絞り込み"
        className={styles.root}
        style={position}
      >
        {TRANSACTION_FILTERS.map((filter) => {
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

export { TRANSACTION_FILTERS, TransactionFilterSidebar };
