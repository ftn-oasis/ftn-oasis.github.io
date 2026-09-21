import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { useMemo } from "react";

import type { BudgetLineItem } from "../budgetMockData";

type BudgetLineItemSelectFieldProps = {
  id?: string;
  items: BudgetLineItem[];
  value: string;
  onChange: (budgetLineItemId: string) => void;
};

// 予算執行申請フォーム (~/book/new) の対象予算項目選択. 「組織のドロップダウン
// (OrganizationSelectField) と同じ形式にしてほしい, 今後ドロップダウンを
// 実装する場合もそうしてほしい」という依頼のため, 見た目の土台
// (selectFieldBase.module.css) を共有する形でネイティブ <select> から
// 置き換えたものです. 所管→組織の順のグループ化 (ネイティブ <select> の
// <optgroup> 相当) は, この選択欄専用の関心事のためコンポーネント内に
// 留めています (以前は呼び出し元の BudgetExecutionRequestForm 側にありました)
function BudgetLineItemSelectField({
  id,
  items,
  value,
  onChange,
}: BudgetLineItemSelectFieldProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();
  const selected = items.find((item) => item.id === value);

  // 所管→組織の順にグループ化 (ラベルを "所管 - 組織" として連結することで
  // 3階層のうち上位2階層を表現し, 実際の選択肢は末尾の「項」にしている)
  const groupedItems = useMemo(() => {
    const groups = new Map<string, BudgetLineItem[]>();
    for (const item of items) {
      const groupLabel = `${item.jurisdiction} - ${item.organizationName}`;
      const group = groups.get(groupLabel) ?? [];
      group.push(item);
      groups.set(groupLabel, group);
    }
    return groups;
  }, [items]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel} title={selected?.itemName ?? ""}>
            {selected?.itemName ?? ""}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {Array.from(groupedItems.entries()).map(([groupLabel, groupItems]) => (
            <div key={groupLabel} className={styles.group}>
              <div className={styles.groupLabel}>{groupLabel}</div>
              {groupItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    close();
                  }}
                  className={clsx(menuItemBase.root, item.id === value && menuItemBase.active)}
                >
                  <span>{item.itemName}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { BudgetLineItemSelectField };
