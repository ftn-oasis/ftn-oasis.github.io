import { Icon } from "@src/components/ui/Icon";
import { IconTrash } from "@tabler/icons-react";

import {
  createBlankPurchaseItem,
  type DraftPurchaseItem,
  isBlankPurchaseItem,
  isValidNaturalNumberInput,
  purchaseItemSubtotal,
} from "../purchaseItemDraft";

import styles from "./PurchaseItemsInput.module.css";

type PurchaseItemsInputProps = {
  items: DraftPurchaseItem[];
  onChange: (items: DraftPurchaseItem[]) => void;
  // 仮払 (TransactionRequestType.AdvancePayment) 選択時は, 支払前の見込み額
  // であることを示すため「金額」「合計」の見出しをそれぞれ「金額 (概算)」/
  // 「合計 (概算)」に切り替える (行ごとの「計」は対象外 — 依頼文で名指しされた
  // のは「金額」「合計」の2箇所のみ)
  isEstimate?: boolean;
};

// 購入品目の入力. ~/orgs/組織ID/book/会計処理ID の金額内訳タブ
// (TransactionItemsList) と同じ列構成 (名称/概要/金額/個数/計) の表だが,
// こちらは入力用のため各セルが編集可能で, 並び替えは無い. 「リストの最下段の
// 要素に空白の要素を表示する, 概要や金額などどれか一つでも入力された場合,
// その下に新たな空白の要素を追加する」という依頼のため, 常に末尾に1件だけ
// 空白の行を保つ (最下段の行のいずれかのフィールドに値が入った瞬間, さらに
// 下へ新しい空白行を追加する)
function PurchaseItemsInput({ items, onChange, isEstimate }: PurchaseItemsInputProps) {
  const total = items.reduce((sum, item) => sum + purchaseItemSubtotal(item), 0);

  const updateItem = (index: number, patch: Partial<DraftPurchaseItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    const isLastRow = index === items.length - 1;
    if (isLastRow && !isBlankPurchaseItem(next[index])) {
      next.push(createBlankPurchaseItem());
    }
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [createBlankPurchaseItem()]);
  };

  return (
    <table className={styles.table}>
      <colgroup>
        <col />
        <col />
        <col className={styles.amountColumn} />
        <col className={styles.quantityColumn} />
        <col className={styles.amountColumn} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">名称</th>
          <th scope="col">概要</th>
          <th scope="col" className={styles.numeric}>
            {isEstimate ? "金額 (概算)" : "金額"}
          </th>
          <th scope="col" className={styles.numeric}>
            個数
          </th>
          <th scope="col" className={styles.numeric}>
            計
          </th>
          <th scope="col" aria-label="削除" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id}>
            <td>
              <input
                type="text"
                value={item.name}
                onChange={(event) => updateItem(index, { name: event.target.value })}
                aria-label="名称"
                placeholder={index === 0 ? "プラダン3mm厚 1820x90" : undefined}
                title={item.name || undefined}
                className={styles.cellInput}
              />
            </td>
            <td>
              <input
                type="text"
                value={item.description}
                onChange={(event) =>
                  updateItem(index, { description: event.target.value })
                }
                aria-label="概要"
                placeholder={index === 0 ? "書割の構造体に使用" : undefined}
                title={item.description || undefined}
                className={styles.cellInput}
              />
            </td>
            <td className={styles.numeric}>
              <span className={styles.amountInputWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.unitPrice}
                  onChange={(event) => {
                    if (!isValidNaturalNumberInput(event.target.value)) return;
                    updateItem(index, { unitPrice: event.target.value });
                  }}
                  aria-label="金額"
                  placeholder={index === 0 ? "1290" : undefined}
                  className={styles.cellInputNumeric}
                />
                <span className={styles.currencySuffix} aria-hidden="true">
                  円
                </span>
              </span>
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
                placeholder={index === 0 ? "4" : undefined}
                className={styles.cellInputNumeric}
              />
            </td>
            <td className={styles.numeric}>
              {item.unitPrice === "" || item.quantity === ""
                ? "- 円"
                : `${purchaseItemSubtotal(item)}円`}
            </td>
            <td className={styles.deleteCell}>
              {!isBlankPurchaseItem(item) && (
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
        ))}
        <tr className={styles.totalRow}>
          <td>{isEstimate ? "合計 (概算)" : "合計"}</td>
          <td />
          <td />
          <td />
          <td className={styles.numeric}>{total}円</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

export { PurchaseItemsInput };
