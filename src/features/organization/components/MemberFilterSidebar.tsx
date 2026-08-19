import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { IconBinaryTree, IconHome, IconUserOff } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { useRef } from "react";

import { useFixedSidebarPosition } from "../useFixedSidebarPosition";

import styles from "./MemberFilterSidebar.module.css";

type MemberFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// 選択中の判定 (検索欄の文字列と query の一致) は呼び出し元 (親コンポーネント) が
// この配列を見て行うため export する
const MEMBER_FILTERS: MemberFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  {
    key: "own-org-only",
    icon: IconBinaryTree,
    label: "子組織を含む",
    query: "子組織: true",
  },
  {
    key: "inactive",
    icon: IconUserOff,
    label: "退出済",
    query: "参加: false",
  },
];

type MemberFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// メニュードロワーと同じ土台 (menuItemBase) を使った, 構成員一覧の絞り込みボタン一覧.
// 選択中は検索欄の文字列と query が一致しているかどうかで判定する (フィルター自体は
// まだ実装しないため, 選択してもメイン側の一覧は絞り込まれない)
function MemberFilterSidebar({ searchText, onSelect }: MemberFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav
        aria-label="構成員の絞り込み"
        className={styles.root}
        style={position}
      >
        {MEMBER_FILTERS.map((filter) => {
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

export { MEMBER_FILTERS, MemberFilterSidebar };
