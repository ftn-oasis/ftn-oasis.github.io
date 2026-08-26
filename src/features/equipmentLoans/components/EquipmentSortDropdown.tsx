import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { EquipmentSortDirection, EquipmentSortField } from "../types";

import styles from "./EquipmentSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<EquipmentSortField, string> = {
  [EquipmentSortField.Name]: "備品名",
  [EquipmentSortField.Quantity]: "個数",
  [EquipmentSortField.Availability]: "状態",
};

const SORT_FIELDS: EquipmentSortField[] = [
  EquipmentSortField.Name,
  EquipmentSortField.Quantity,
  EquipmentSortField.Availability,
];

type EquipmentSortDropdownProps = {
  field: EquipmentSortField;
  direction: EquipmentSortDirection;
  onChange: (field: EquipmentSortField, direction: EquipmentSortDirection) => void;
};

// MemberSortDropdown と同じ構造の, 枠線無しドロップダウン. 学年/学級/名前と
// 同じく「新しい順」のような強い既定が無いフィールド構成のため, 別の項目を
// 選び直した場合の既定方向は (Document/TransactionSortDropdown の降順とは
// 異なり) 昇順にしている
function EquipmentSortDropdown({ field, direction, onChange }: EquipmentSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: EquipmentSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === EquipmentSortDirection.Asc
          ? EquipmentSortDirection.Desc
          : EquipmentSortDirection.Asc,
      );
    } else {
      onChange(selectedField, EquipmentSortDirection.Asc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: EquipmentSortDirection) => {
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
            direction === EquipmentSortDirection.Asc
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
            isActive={direction === EquipmentSortDirection.Asc}
            onClick={() => handleSelectDirection(EquipmentSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === EquipmentSortDirection.Desc}
            onClick={() => handleSelectDirection(EquipmentSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { EquipmentSortDropdown };
