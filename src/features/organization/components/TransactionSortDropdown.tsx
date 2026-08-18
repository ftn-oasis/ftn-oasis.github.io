import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import clsx from "clsx";

import { TransactionSortDirection, TransactionSortField } from "../types";

import styles from "./TransactionSortDropdown.module.css";

// DocumentSortDropdown の Title ("名称") に相当するが, title は金額を整形した
// 文字列のため, ラベルは「金額」にしている
const SORT_FIELD_LABEL: Record<TransactionSortField, string> = {
  [TransactionSortField.EditedAt]: "最新編集日時",
  [TransactionSortField.CreatedAt]: "作成日",
  [TransactionSortField.Title]: "金額",
};

const SORT_FIELDS: TransactionSortField[] = [
  TransactionSortField.EditedAt,
  TransactionSortField.CreatedAt,
  TransactionSortField.Title,
];

type TransactionSortDropdownProps = {
  field: TransactionSortField;
  direction: TransactionSortDirection;
  onChange: (
    field: TransactionSortField,
    direction: TransactionSortDirection,
  ) => void;
};

// 枠線無しのドロップダウン. 開いている一覧で選択中のフィールドをもう一度選ぶと
// 昇順/降順を切り替え, 別のフィールドを選ぶと降順で選び直す
function TransactionSortDropdown({
  field,
  direction,
  onChange,
}: TransactionSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: TransactionSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === TransactionSortDirection.Asc
          ? TransactionSortDirection.Desc
          : TransactionSortDirection.Asc,
      );
    } else {
      onChange(selectedField, TransactionSortDirection.Desc);
    }
    close();
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={styles.trigger}
      >
        <Icon
          icon={
            direction === TransactionSortDirection.Asc
              ? IconSortAscendingLetters
              : IconSortDescendingLetters
          }
          size={16}
          aria-hidden="true"
        />
        {SORT_FIELD_LABEL[field]}
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {SORT_FIELDS.map((sortField) => (
            <button
              key={sortField}
              type="button"
              role="menuitemradio"
              aria-checked={sortField === field}
              onClick={() => handleSelect(sortField)}
              className={clsx(
                menuItemBase.root,
                sortField === field && menuItemBase.active,
              )}
            >
              {SORT_FIELD_LABEL[sortField]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { TransactionSortDropdown };
