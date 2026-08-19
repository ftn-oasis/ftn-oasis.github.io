import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { DocumentPullRequestSortDirection, DocumentPullRequestSortField } from "../types";

import styles from "./PullRequestSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<DocumentPullRequestSortField, string> = {
  [DocumentPullRequestSortField.PostedAt]: "投稿日",
  [DocumentPullRequestSortField.Title]: "タイトル",
};

const SORT_FIELDS: DocumentPullRequestSortField[] = [
  DocumentPullRequestSortField.PostedAt,
  DocumentPullRequestSortField.Title,
];

type PullRequestSortDropdownProps = {
  field: DocumentPullRequestSortField;
  direction: DocumentPullRequestSortDirection;
  onChange: (field: DocumentPullRequestSortField, direction: DocumentPullRequestSortDirection) => void;
};

// MeetingSortDropdown と同じ構造の, 枠線無しドロップダウン. 末尾には分割線を
// 挟み, フィールドに関わらず直接昇順/降順を選べる項目を追加している
// (DocumentSortDropdown と同じ依頼のため)
function PullRequestSortDropdown({ field, direction, onChange }: PullRequestSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: DocumentPullRequestSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === DocumentPullRequestSortDirection.Asc
          ? DocumentPullRequestSortDirection.Desc
          : DocumentPullRequestSortDirection.Asc,
      );
    } else {
      onChange(selectedField, DocumentPullRequestSortDirection.Desc);
    }
    close();
  };

  const handleSelectDirection = (
    selectedDirection: DocumentPullRequestSortDirection,
  ) => {
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
            direction === DocumentPullRequestSortDirection.Asc
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
            isActive={direction === DocumentPullRequestSortDirection.Asc}
            onClick={() =>
              handleSelectDirection(DocumentPullRequestSortDirection.Asc)
            }
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === DocumentPullRequestSortDirection.Desc}
            onClick={() =>
              handleSelectDirection(DocumentPullRequestSortDirection.Desc)
            }
          />
        </div>
      )}
    </div>
  );
}

export { PullRequestSortDropdown };
