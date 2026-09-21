import { Icon } from "@src/components/ui/Icon";
import { IconTrash } from "@tabler/icons-react";
import { isValidNaturalNumberInput } from "@src/features/organization/purchaseItemDraft";

import {
  createBlankEquipmentLoanItem,
  type DraftEquipmentLoanItem,
  isBlankEquipmentLoanItem,
} from "../equipmentLoanItemDraft";
import { MOCK_EQUIPMENT_ITEMS } from "../mockData";
import { EquipmentAvailability } from "../types";
import { EquipmentItemSelectField } from "./EquipmentItemSelectField";

import styles from "./EquipmentLoanItemsInput.module.css";

type EquipmentLoanItemsInputProps = {
  items: DraftEquipmentLoanItem[];
  onChange: (items: DraftEquipmentLoanItem[]) => void;
};

// 借りる備品とその個数の入力. 「~/book/new の購入品目のリストを参考に作成して
// ほしい」という依頼のため, PurchaseItemsInput
// (「常に末尾に1件だけ空白行を保ち, いずれかのフィールドに値が入った瞬間に
// 新しい空白行を追加する」という挙動) と同じ構成の表ですが, 列は備品名/個数の
// 2つだけです (金額/概要/計に相当する概念が無いため). 備品名は自由入力では
// なく既存の備品一覧 (EquipmentItem) から選ぶ形にしています — 貸出中の備品を
// 選択肢から除外し, かつ他の行で既に選ばれている備品もその行の選択肢からは
// 除外する (同じ備品エントリを複数行で重複して選べないようにする) ことで,
// 実際の貸出リクエストらしい振る舞いにしています
function EquipmentLoanItemsInput({ items, onChange }: EquipmentLoanItemsInputProps) {
  const availableEquipment = MOCK_EQUIPMENT_ITEMS.filter(
    (equipmentItem) => equipmentItem.availability === EquipmentAvailability.Available,
  );

  const selectedElsewhere = (rowId: string) =>
    new Set(
      items
        .filter((item) => item.id !== rowId && item.equipmentItemId !== "")
        .map((item) => item.equipmentItemId),
    );

  const updateItem = (index: number, patch: Partial<DraftEquipmentLoanItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    const isLastRow = index === items.length - 1;
    if (isLastRow && !isBlankEquipmentLoanItem(next[index])) {
      next.push(createBlankEquipmentLoanItem());
    }
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [createBlankEquipmentLoanItem()]);
  };

  return (
    <table className={styles.table}>
      <colgroup>
        <col />
        <col className={styles.quantityColumn} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">備品名</th>
          <th scope="col" className={styles.numeric}>
            個数
          </th>
          <th scope="col" aria-label="削除" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const usedElsewhere = selectedElsewhere(item.id);
          const rowOptions = availableEquipment.filter(
            (equipmentItem) => !usedElsewhere.has(equipmentItem.id),
          );

          return (
            <tr key={item.id}>
              <td className={styles.nameCell}>
                <EquipmentItemSelectField
                  items={rowOptions}
                  value={item.equipmentItemId}
                  onChange={(equipmentItemId) => updateItem(index, { equipmentItemId })}
                />
              </td>
              <td className={styles.numeric}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(event) => {
                    if (!isValidNaturalNumberInput(event.target.value)) return;
                    updateItem(index, { quantity: event.target.value });
                  }}
                  aria-label="個数"
                  className={styles.cellInputNumeric}
                />
              </td>
              <td className={styles.deleteCell}>
                {!isBlankEquipmentLoanItem(item) && (
                  <button
                    type="button"
                    aria-label="この項目を削除"
                    onClick={() => removeItem(index)}
                    className={styles.deleteButton}
                  >
                    <Icon icon={IconTrash} size={16} aria-hidden="true" />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export { EquipmentLoanItemsInput };
