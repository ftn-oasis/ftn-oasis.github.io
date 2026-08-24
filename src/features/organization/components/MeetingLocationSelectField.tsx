import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";

type MeetingLocationSelectFieldProps = {
  id?: string;
  locations: string[];
  value: string;
  onChange: (location: string) => void;
};

// 「議事録を作成」モードの場所 (部屋) 選択. OrganizationSelectField と同じ
// 土台 (selectFieldBase.module.css) を使うが, グループ/アバターの無い単純な
// 文字列の一覧のため BudgetLineItemSelectField よりさらに単純な構成
function MeetingLocationSelectField({
  id,
  locations,
  value,
  onChange,
}: MeetingLocationSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel} title={value}>
            {value}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {locations.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => {
                onChange(location);
                close();
              }}
              className={clsx(menuItemBase.root, location === value && menuItemBase.active)}
            >
              <span>{location}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { MeetingLocationSelectField };
