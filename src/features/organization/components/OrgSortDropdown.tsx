import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { SortMenuItem } from "@src/components/ui/SortMenuItem";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import {
  IconCaretDownFilled,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";

import { OrgSortDirection, OrgSortField } from "../types";

import styles from "./OrgSortDropdown.module.css";

// 組織には文書/入出金のような一貫した日付フィールドが無いため, 名前/所属人数
// の2種類にしている
const SORT_FIELD_LABEL: Record<OrgSortField, string> = {
  [OrgSortField.Name]: "名前",
  [OrgSortField.MemberCount]: "所属人数",
};

const SORT_FIELDS: OrgSortField[] = [OrgSortField.Name, OrgSortField.MemberCount];

type OrgSortDropdownProps = {
  field: OrgSortField;
  direction: OrgSortDirection;
  onChange: (field: OrgSortField, direction: OrgSortDirection) => void;
};

// MeetingSortDropdown と同じ構造の, 枠線無しドロップダウン. 「1年→3年」の
// ような強い既定が無いため, 別フィールドを選び直した際の既定方向は
// MemberSortDropdown と同じ昇順にしている (OrgsSection.tsx を参照). 末尾には
// 分割線を挟み, フィールドに関わらず直接昇順/降順を選べる項目を追加している
// (DocumentSortDropdown と同じ依頼のため)
function OrgSortDropdown({ field, direction, onChange }: OrgSortDropdownProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  const handleSelect = (selectedField: OrgSortField) => {
    if (selectedField === field) {
      onChange(
        field,
        direction === OrgSortDirection.Asc
          ? OrgSortDirection.Desc
          : OrgSortDirection.Asc,
      );
    } else {
      onChange(selectedField, OrgSortDirection.Asc);
    }
    close();
  };

  const handleSelectDirection = (selectedDirection: OrgSortDirection) => {
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
            direction === OrgSortDirection.Asc
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
            isActive={direction === OrgSortDirection.Asc}
            onClick={() => handleSelectDirection(OrgSortDirection.Asc)}
          />
          <SortMenuItem
            label="降順"
            icon={IconSortAscendingLetters}
            isActive={direction === OrgSortDirection.Desc}
            onClick={() => handleSelectDirection(OrgSortDirection.Desc)}
          />
        </div>
      )}
    </div>
  );
}

export { OrgSortDropdown };
