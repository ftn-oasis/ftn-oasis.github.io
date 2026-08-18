import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import clsx from "clsx";

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
// 昇順/降順を切り替え, 別のフィールドを選ぶと昇順で選び直す
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

export { MemberSortDropdown };
