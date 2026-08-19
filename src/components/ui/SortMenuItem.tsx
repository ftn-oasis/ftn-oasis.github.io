import { IconCheck, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

import { Icon } from "./Icon";
import menuItemBase from "./menuItemBase.module.css";
import styles from "./SortMenuItem.module.css";

type SortMenuItemProps = {
  label: string;
  // 昇順/降順を直接選ぶ項目 (DocumentSortDropdown など末尾の「昇順」/「降順」)
  // でだけ使う, ラベルの前に置くアイコン. 通常のフィールド項目 (「最新編集日時」
  // など) では指定しない
  icon?: TablerIcon;
  isActive: boolean;
  onClick: () => void;
};

// 並び替えドロップダウン (DocumentSortDropdown など) のメニュー項目の共通部品.
// 「選択されているものの左横に IconCheck を表示してほしい」という依頼のため,
// 選択中の項目にだけチェックマークを表示する — 非選択時もチェックマーク分の
// 幅を確保したままにし (visibility: hidden), ラベルの開始位置が項目間で
// ずれないようにしている
function SortMenuItem({ label, icon: OptionIcon, isActive, onClick }: SortMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={isActive}
      onClick={onClick}
      className={clsx(menuItemBase.root, isActive && menuItemBase.active)}
    >
      <Icon
        icon={IconCheck}
        size={14}
        aria-hidden="true"
        className={clsx(styles.check, !isActive && styles.checkHidden)}
      />
      {OptionIcon && <Icon icon={OptionIcon} size={14} aria-hidden="true" />}
      {label}
    </button>
  );
}

export { SortMenuItem };
