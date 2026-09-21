import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

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
// 昇順/降順を切り替え, 別のフィールドを選ぶと降順で選び直す. 末尾には分割線を
// 挟み, フィールドに関わらず直接昇順/降順を選べる項目を追加している
// (「ドロップダウンの一番下に分割線と昇順/降順のオプションも追加してほしい」
// という依頼のため)
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

  const handleSelectDirection = (selectedDirection: DocumentSortDirection) => {
    onChange(field, selectedDirection);
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
            <SortMenuItem
              key={sortField}
              label={SORT_FIELD_LABEL[sortField]}
              isActive={sortField === field}
              onClick={() => handleSelect(sortField)}
            />
          ))}

          <Divider />

          <SortMenuItem
            label="昇順"
            icon={IconSortDescendingLetters}
            isActive={direction === DocumentSortDirection.Asc}
            onClick={() => handleSelectDirection(DocumentSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === DocumentSortDirection.Desc}
            onClick={() => handleSelectDirection(DocumentSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { DocumentSortDropdown };
