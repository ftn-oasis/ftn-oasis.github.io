import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { MemberSortDirection, MemberSortField } from "../types";

import styles from "./MemberSortDropdown.module.css";

const SORT_FIELD_LABEL: Record<MemberSortField, string> = {
  [MemberSortField.Grade]: "学年",
  [MemberSortField.Class]: "学級",
  [MemberSortField.Name]: "名前",
};

const SORT_FIELDS: MemberSortField[] = [
  MemberSortField.Grade,
  MemberSortField.Class,
  MemberSortField.Name,
];

type MemberSortDropdownProps = {
  field: MemberSortField;
  direction: MemberSortDirection;
  onChange: (field: MemberSortField, direction: MemberSortDirection) => void;
};

// 枠線無しのドロップダウン. 開いている一覧で選択中のフィールドをもう一度選ぶと
// 昇順/降順を切り替え, 別のフィールドを選ぶと昇順で選び直す. 末尾には分割線を
// 挟み, フィールドに関わらず直接昇順/降順を選べる項目を追加している
// (DocumentSortDropdown と同じ依頼のため)
function MemberSortDropdown({
  field,
  direction,
  onChange,
}: MemberSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: MemberSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === MemberSortDirection.Asc
          ? MemberSortDirection.Desc
          : MemberSortDirection.Asc,
      );
    } else {
      onChange(selectedField, MemberSortDirection.Asc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: MemberSortDirection) => {
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
            direction === MemberSortDirection.Asc
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
            isActive={direction === MemberSortDirection.Asc}
            onClick={() => handleSelectDirection(MemberSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === MemberSortDirection.Desc}
            onClick={() => handleSelectDirection(MemberSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { MemberSortDropdown };
