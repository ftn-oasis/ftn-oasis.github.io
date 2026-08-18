import { CurrentContentBar } from "@src/components/ui/CurrentContentBar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconArchive,
  IconBinaryTree,
  IconEyeCheck,
  IconEyeOff,
  IconFileCode2,
  IconHome,
  IconPencil,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

import styles from "./DocumentFilterSidebar.module.css";

type DocumentFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// 選択中の判定 (検索欄の文字列と query の一致) は呼び出し元 (親コンポーネント) が
// この配列を見て行うため export する
const DOCUMENT_FILTERS: DocumentFilter[] = [
  { key: "all", icon: IconHome, label: "全て", query: "" },
  {
    key: "own-org-only",
    icon: IconBinaryTree,
    label: "組織内のみ",
    query: "子組織: false",
  },
  {
    key: "involved",
    icon: IconUsers,
    label: "作成に関与",
    query: "関与: @私",
  },
  {
    key: "managed",
    icon: IconSettings,
    label: "管理下",
    query: "管理権限: @私 有効: true",
  },
  {
    key: "editable",
    icon: IconPencil,
    label: "編集可",
    query: "編集権限: @私 有効: true",
  },
  {
    key: "public",
    icon: IconEyeCheck,
    label: "公開中",
    query: "公開: true 有効: true",
  },
  {
    key: "private",
    icon: IconEyeOff,
    label: "非公開",
    query: "公開: false 有効: true",
  },
  {
    key: "archived",
    icon: IconArchive,
    label: "無効化済",
    query: "有効: false",
  },
  {
    key: "template",
    icon: IconFileCode2,
    label: "雛形",
    query: "雛形: true 有効: true",
  },
];

type DocumentFilterSidebarProps = {
  searchText: string;
  onSelect: (query: string) => void;
};

// メニュードロワーと同じ土台 (menuItemBase) を使った, 文書一覧の絞り込みボタン一覧.
// 選択中は検索欄の文字列と query が一致しているかどうかで判定する (フィルター自体は
// まだ実装しないため, 選択してもメイン側の一覧は絞り込まれない)
function DocumentFilterSidebar({
  searchText,
  onSelect,
}: DocumentFilterSidebarProps) {
  return (
    <nav aria-label="文書の絞り込み" className={styles.root}>
      {DOCUMENT_FILTERS.map((filter) => {
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

export { DOCUMENT_FILTERS, DocumentFilterSidebar };
