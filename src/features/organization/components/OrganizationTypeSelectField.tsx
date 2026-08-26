import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";

import {
  ORGANIZATION_CREATION_TYPE_LABEL,
  ORGANIZATION_CREATION_TYPES,
  type OrganizationCreationType,
} from "../organizationCreationTypes";

type OrganizationTypeSelectFieldProps = {
  id?: string;
  value: OrganizationCreationType;
  onChange: (type: OrganizationCreationType) => void;
};

// MeetingLocationSelectField と同じ構成 (グループ/アバターの無い単純な一覧) の,
// 組織作成フォーム (~/orgs/new) の組織種別選択欄
function OrganizationTypeSelectField({ id, value, onChange }: OrganizationTypeSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel}>{ORGANIZATION_CREATION_TYPE_LABEL[value]}</span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {ORGANIZATION_CREATION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onChange(type);
                close();
              }}
              className={clsx(menuItemBase.root, type === value && menuItemBase.active)}
            >
              <span>{ORGANIZATION_CREATION_TYPE_LABEL[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { OrganizationTypeSelectField };
