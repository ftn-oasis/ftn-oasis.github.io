import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { DocumentIssueSortDirection, DocumentIssueSortField } from "../types";

import styles from "./IssueSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<DocumentIssueSortField, string> = {
  [DocumentIssueSortField.PostedAt]: "投稿日",
  [DocumentIssueSortField.Title]: "タイトル",
};

const SORT_FIELDS: DocumentIssueSortField[] = [
  DocumentIssueSortField.PostedAt,
  DocumentIssueSortField.Title,
];

type IssueSortDropdownProps = {
  field: DocumentIssueSortField;
  direction: DocumentIssueSortDirection;
  onChange: (field: DocumentIssueSortField, direction: DocumentIssueSortDirection) => void;
};

// MeetingSortDropdown と同じ構造の, 枠線無しドロップダウン. 末尾には分割線を
// 挟み, フィールドに関わらず直接昇順/降順を選べる項目を追加している
// (DocumentSortDropdown と同じ依頼のため)
function IssueSortDropdown({ field, direction, onChange }: IssueSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: DocumentIssueSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === DocumentIssueSortDirection.Asc
          ? DocumentIssueSortDirection.Desc
          : DocumentIssueSortDirection.Asc,
      );
    } else {
      onChange(selectedField, DocumentIssueSortDirection.Desc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: DocumentIssueSortDirection) => {
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
            direction === DocumentIssueSortDirection.Asc
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
            isActive={direction === DocumentIssueSortDirection.Asc}
            onClick={() => handleSelectDirection(DocumentIssueSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === DocumentIssueSortDirection.Desc}
            onClick={() => handleSelectDirection(DocumentIssueSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { IssueSortDropdown };
