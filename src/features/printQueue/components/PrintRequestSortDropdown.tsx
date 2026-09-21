import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { PrintRequestSortDirection, PrintRequestSortField } from "../types";

import styles from "./PrintRequestSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<PrintRequestSortField, string> = {
  [PrintRequestSortField.UpdatedAt]: "更新日時",
  [PrintRequestSortField.CreatedAt]: "依頼日時",
  [PrintRequestSortField.Title]: "名称",
};

const SORT_FIELDS: PrintRequestSortField[] = [
  PrintRequestSortField.UpdatedAt,
  PrintRequestSortField.CreatedAt,
  PrintRequestSortField.Title,
];

type PrintRequestSortDropdownProps = {
  field: PrintRequestSortField;
  direction: PrintRequestSortDirection;
  onChange: (field: PrintRequestSortField, direction: PrintRequestSortDirection) => void;
};

// DocumentSortDropdown と同じ構造の, 枠線無しドロップダウン. 同じ項目を選び
// 直すと昇順/降順がトグルし, 別の項目を選ぶとその項目の降順から始まる.
// 末尾には分割線を挟み, 項目に関わらず直接昇順/降順を選べる項目を追加している
function PrintRequestSortDropdown({
  field,
  direction,
  onChange,
}: PrintRequestSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: PrintRequestSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === PrintRequestSortDirection.Asc
          ? PrintRequestSortDirection.Desc
          : PrintRequestSortDirection.Asc,
      );
    } else {
      onChange(selectedField, PrintRequestSortDirection.Desc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: PrintRequestSortDirection) => {
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
            direction === PrintRequestSortDirection.Asc
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
            isActive={direction === PrintRequestSortDirection.Asc}
            onClick={() => handleSelectDirection(PrintRequestSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === PrintRequestSortDirection.Desc}
            onClick={() => handleSelectDirection(PrintRequestSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { PrintRequestSortDropdown };
