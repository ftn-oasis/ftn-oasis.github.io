import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { RoomReservationSortDirection, RoomReservationSortField } from "../types";

import styles from "./RoomReservationSortDropdown.module.css";

// MeetingSortDropdown の StartsAt/ScheduledAt/Title に相当 — 会議には無い
// 「編集日時」の代わりに, 利用日時/予約日時+予約名の組み合わせにしている
const SORT_FIELD_LABEL: Record<RoomReservationSortField, string> = {
  [RoomReservationSortField.StartsAt]: "利用日時",
  [RoomReservationSortField.ScheduledAt]: "予約日時",
  [RoomReservationSortField.Title]: "予約名",
};

const SORT_FIELDS: RoomReservationSortField[] = [
  RoomReservationSortField.StartsAt,
  RoomReservationSortField.ScheduledAt,
  RoomReservationSortField.Title,
];

type RoomReservationSortDropdownProps = {
  field: RoomReservationSortField;
  direction: RoomReservationSortDirection;
  onChange: (field: RoomReservationSortField, direction: RoomReservationSortDirection) => void;
};

// MeetingSortDropdown と同じ構造の, 枠線無しドロップダウン
function RoomReservationSortDropdown({
  field,
  direction,
  onChange,
}: RoomReservationSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: RoomReservationSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === RoomReservationSortDirection.Asc
          ? RoomReservationSortDirection.Desc
          : RoomReservationSortDirection.Asc,
      );
    } else {
      onChange(selectedField, RoomReservationSortDirection.Desc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: RoomReservationSortDirection) => {
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
            direction === RoomReservationSortDirection.Asc
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
            isActive={direction === RoomReservationSortDirection.Asc}
            onClick={() => handleSelectDirection(RoomReservationSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === RoomReservationSortDirection.Desc}
            onClick={() => handleSelectDirection(RoomReservationSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { RoomReservationSortDropdown };
