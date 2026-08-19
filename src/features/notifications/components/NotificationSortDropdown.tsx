import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import clsx from "clsx";

import { NotificationSortDirection, NotificationSortField } from "../types";

import styles from "./NotificationSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<NotificationSortField, string> = {
  [NotificationSortField.OccurredAt]: "通知日時",
  [NotificationSortField.Title]: "タイトル",
};

const SORT_FIELDS: NotificationSortField[] = [
  NotificationSortField.OccurredAt,
  NotificationSortField.Title,
];

type NotificationSortDropdownProps = {
  field: NotificationSortField;
  direction: NotificationSortDirection;
  onChange: (field: NotificationSortField, direction: NotificationSortDirection) => void;
};

// IssueSortDropdown と同じ構造の, 枠線無しドロップダウン
function NotificationSortDropdown({
  field,
  direction,
  onChange,
}: NotificationSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: NotificationSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === NotificationSortDirection.Asc
          ? NotificationSortDirection.Desc
          : NotificationSortDirection.Asc,
      );
    } else {
      onChange(selectedField, NotificationSortDirection.Desc);
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
            direction === NotificationSortDirection.Asc
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

export { NotificationSortDropdown };
