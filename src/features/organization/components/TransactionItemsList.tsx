import { Icon } from "@src/components/ui/Icon";
import {
  IconArrowsSort,
  IconCaretDownFilled,
  IconCaretUpFilled,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

import {
  type TransactionLineItem,
  TransactionItemSortDirection,
  TransactionItemSortField,
} from "../types";

import styles from "./TransactionItemsList.module.css";

type Column = {
  field: TransactionItemSortField;
  label: string;
  numeric?: boolean;
};

const COLUMNS: Column[] = [
  { field: TransactionItemSortField.Name, label: "名称" },
  { field: TransactionItemSortField.Description, label: "概要" },
  { field: TransactionItemSortField.UnitPrice, label: "金額", numeric: true },
  { field: TransactionItemSortField.Quantity, label: "個数", numeric: true },
  { field: TransactionItemSortField.Subtotal, label: "計", numeric: true },
];

function subtotalOf(item: TransactionLineItem): number {
  return item.unitPrice * item.quantity;
}

function sortItems(
  items: TransactionLineItem[],
  field: TransactionItemSortField,
  direction: TransactionItemSortDirection,
): TransactionLineItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === TransactionItemSortField.Name) {
      return a.name.localeCompare(b.name, "ja");
    }
    if (field === TransactionItemSortField.Description) {
      return a.description.localeCompare(b.description, "ja");
    }
    if (field === TransactionItemSortField.Subtotal) {
      return subtotalOf(a) - subtotalOf(b);
    }
    return a[field] - b[field];
  });
  return direction === TransactionItemSortDirection.Asc ? sorted : sorted.reverse();
}

type TransactionItemsListProps = {
  items: TransactionLineItem[];
};

// 金額内訳タブ (/orgs/:orgId/book/:transactionId) の本文. 名称/概要/金額/個数/計
// の5列を持つ表で, 各列見出しをクリックすると昇順/降順で並び替えられる
// (同じ列をもう一度押すと反転, 別の列を押すとその列の昇順から始める). 最下部に
// 合計行 (名称列を "合計" とし, 計列に全項目のsubtotal合計を表示, 背景を暗くする)
// を追加する
function TransactionItemsList({ items }: TransactionItemsListProps) {
  const [sortField, setSortField] = useState<TransactionItemSortField>(
    TransactionItemSortField.Name,
  );
  const [sortDirection, setSortDirection] = useState<TransactionItemSortDirection>(
    TransactionItemSortDirection.Asc,
  );

  const sorted = useMemo(
    () => sortItems(items, sortField, sortDirection),
    [items, sortField, sortDirection],
  );
  const total = useMemo(
    () => items.reduce((sum, item) => sum + subtotalOf(item), 0),
    [items],
  );

  const handleSortClick = (field: TransactionItemSortField) => {
    if (field === sortField) {
      setSortDirection(
        sortDirection === TransactionItemSortDirection.Asc
          ? TransactionItemSortDirection.Desc
          : TransactionItemSortDirection.Asc,
      );
      return;
    }
    setSortField(field);
    setSortDirection(TransactionItemSortDirection.Asc);
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((column) => {
            const isActive = column.field === sortField;
            const sortIcon = isActive
              ? sortDirection === TransactionItemSortDirection.Asc
                ? IconCaretUpFilled
                : IconCaretDownFilled
              : IconArrowsSort;
            return (
              <th key={column.field} scope="col">
                <button
                  type="button"
                  className={clsx(styles.headerButton, isActive && styles.headerButtonActive)}
                  onClick={() => handleSortClick(column.field)}
                >
                  {column.label}
                  <Icon
                    icon={sortIcon}
                    size={14}
                    aria-hidden="true"
                    className={styles.sortIcon}
                  />
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className={styles.description}>{item.description}</td>
            <td className={styles.numeric}>{item.unitPrice}円</td>
            <td className={styles.numeric}>{item.quantity}</td>
            <td className={styles.numeric}>{subtotalOf(item)}円</td>
          </tr>
        ))}
        <tr className={styles.totalRow}>
          <td>合計</td>
          <td />
          <td />
          <td />
          <td className={styles.numeric}>{total}円</td>
        </tr>
      </tbody>
    </table>
  );
}

export { TransactionItemsList };
