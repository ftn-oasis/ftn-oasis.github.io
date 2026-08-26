import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useFixedSidebarPosition } from "@src/features/organization/useFixedSidebarPosition";
import clsx from "clsx";
import { useRef } from "react";

import { EQUIPMENT_FILTERS } from "../equipmentFilters";

import styles from "./EquipmentFilterSidebar.module.css";

type EquipmentFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// MemberFilterSidebar と同じ構造 (menuItemBase の絞り込みボタン一覧,
// position: fixed でスクロール追従) — useFixedSidebarPosition は
// features/organization/ のものをそのまま再利用しています (会議固有の
// データに依存しない汎用フックのため. 詳細は新館予約状況ページの同様の
// 判断を参照)
function EquipmentFilterSidebar({ searchText, onSelect }: EquipmentFilterSidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const position = useFixedSidebarPosition(placeholderRef);

  return (
    <div ref={placeholderRef} className={styles.placeholder}>
      <nav aria-label="備品の絞り込み" className={styles.root} style={position}>
        {EQUIPMENT_FILTERS.map((filter) => {
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

export { EquipmentFilterSidebar };
