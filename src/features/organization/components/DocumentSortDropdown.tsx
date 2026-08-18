import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import clsx from "clsx";

import { DocumentSortDirection, DocumentSortField } from "../types";

import styles from "./DocumentSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<DocumentSortField, string> = {
  [DocumentSortField.EditedAt]: "最新編集日時",
  [DocumentSortField.CreatedAt]: "作成日",
  [DocumentSortField.Title]: "名称",
};

const SORT_FIELDS: DocumentSortField[] = [
  DocumentSortField.EditedAt,
  DocumentSortField.CreatedAt,
  DocumentSortField.Title,
];

type DocumentSortDropdownProps = {
  field: DocumentSortField;
  direction: DocumentSortDirection;
  onChange: (field: DocumentSortField, direction: DocumentSortDirection) => void;
};

// 枠線無しのドロップダウン. 開いている一覧で選択中のフィールドをもう一度選ぶと
// 昇順/降順を切り替え, 別のフィールドを選ぶと降順で選び直す
function DocumentSortDropdown({
  field,
  direction,
  onChange,
}: DocumentSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: DocumentSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === DocumentSortDirection.Asc
          ? DocumentSortDirection.Desc
          : DocumentSortDirection.Asc,
      );
    } else {
      onChange(selectedField, DocumentSortDirection.Desc);
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
            direction === DocumentSortDirection.Asc
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

export { DocumentSortDropdown };
