import { Label } from "@src/components/ui/Label";

import { EquipmentAvailability, type EquipmentItem } from "../types";

import styles from "./EquipmentListRow.module.css";

const AVAILABILITY_LABEL: Record<EquipmentAvailability, string> = {
  [EquipmentAvailability.Available]: "貸出可",
  [EquipmentAvailability.Lent]: "貸出中",
};

type EquipmentListRowProps = {
  item: EquipmentItem;
};

// 備品貸出一覧の1行. 依頼された3項目 (備品名/ラベル/個数) だけの単純な
// 1行構成です — MemberListRow (アバター+2行) とは異なり, 対応する詳細ページも
// まだ無いため PrintRequestListRow/RoomReservationListRow と同じく行全体は
// リンクにしていません (<div>)
function EquipmentListRow({ item }: EquipmentListRowProps) {
  return (
    <div className={styles.root}>
      <span className={styles.title} title={item.name}>
        {item.name}
      </span>
      <Label color={item.availability === EquipmentAvailability.Available ? "green" : "red"}>
        {AVAILABILITY_LABEL[item.availability]}
      </Label>
      <span className={styles.quantity}>{item.quantity}点</span>
    </div>
  );
}

export { EquipmentListRow };
