import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { Icon } from "@src/components/ui/Icon";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";

import type { EquipmentItem } from "../types";

type EquipmentItemSelectFieldProps = {
  id?: string;
  // 呼び出し元 (EquipmentLoanItemsInput) が「貸出可のみ, かつ他の行で既に
  // 選ばれていない備品」まで絞り込んだ上で渡す — このコンポーネント自身は
  // フィルタリングを行わない
  items: EquipmentItem[];
  value: string;
  onChange: (equipmentItemId: string) => void;
};

// 備品貸出申請フォーム (~/equipment-loans/new) の, 貸出品目1行ごとの備品名
// ドロップダウン. MeetingSelectField と同じ土台 (selectFieldBase.module.css)
// ですが, グループ/特別な選択肢は無い単純な一覧のため MeetingLocationSelectField
// に近い構成です. 未選択時は「選択...」をプレースホルダーとして表示します
function EquipmentItemSelectField({ id, items, value, onChange }: EquipmentItemSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();
  const selectedItem = items.find((item) => item.id === value);
  const triggerLabel = selectedItem?.name ?? "選択...";

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel} title={triggerLabel}>
            {triggerLabel}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                close();
              }}
              className={clsx(menuItemBase.root, item.id === value && menuItemBase.active)}
            >
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { EquipmentItemSelectField };
