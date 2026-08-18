import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import clsx from "clsx";

import { MeetingSortDirection, MeetingSortField } from "../types";

import styles from "./MeetingSortDropdown.module.css";

// DocumentSortDropdown の EditedAt/CreatedAt/Title に相当するが, 会議には
// 「編集日時」という概念が無いため, 開催日時/予定日時 (登録された日時) の
// 2つの日付+会議名という組み合わせにしている
const SORT_FIELD_LABEL: Record<MeetingSortField, string> = {
  [MeetingSortField.StartsAt]: "開催日時",
  [MeetingSortField.ScheduledAt]: "予定日時",
  [MeetingSortField.Title]: "会議名",
};

const SORT_FIELDS: MeetingSortField[] = [
  MeetingSortField.StartsAt,
  MeetingSortField.ScheduledAt,
  MeetingSortField.Title,
];

type MeetingSortDropdownProps = {
  field: MeetingSortField;
  direction: MeetingSortDirection;
  onChange: (field: MeetingSortField, direction: MeetingSortDirection) => void;
};

// 枠線無しのドロップダウン. 開いている一覧で選択中のフィールドをもう一度選ぶと
// 昇順/降順を切り替え, 別のフィールドを選ぶと降順で選び直す
function MeetingSortDropdown({
  field,
  direction,
  onChange,
}: MeetingSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: MeetingSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === MeetingSortDirection.Asc
          ? MeetingSortDirection.Desc
          : MeetingSortDirection.Asc,
      );
    } else {
      onChange(selectedField, MeetingSortDirection.Desc);
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
            direction === MeetingSortDirection.Asc
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

export { MeetingSortDropdown };
