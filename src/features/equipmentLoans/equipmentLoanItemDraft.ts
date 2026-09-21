// 備品貸出申請フォーム (~/equipment-loans/new) の貸出品目1行分の入力中の値.
// PurchaseItemsInput (~/book/new) の DraftPurchaseItem と同じ考え方 — 個数は
// 数値でも一旦文字列として保持し (未入力/入力途中の状態をそのまま表現するため),
// EquipmentLoanItemsInput/NewEquipmentLoanSection の両方から使うため, どちらの
// コンポーネントファイルにも属さないこのファイルに置いている (react-refresh の
// "1ファイル1コンポーネント" 制約を避ける意図もある). 備品名は自由入力ではなく
// 既存の備品一覧 (EquipmentItem) から選ぶ形のため, 文字列ではなく equipmentItemId
// (未選択は空文字列) を持たせている
type DraftEquipmentLoanItem = {
  id: string;
  equipmentItemId: string;
  quantity: string;
};

function createBlankEquipmentLoanItem(): DraftEquipmentLoanItem {
  return { id: crypto.randomUUID(), equipmentItemId: "", quantity: "" };
}

function isBlankEquipmentLoanItem(item: DraftEquipmentLoanItem): boolean {
  return !item.equipmentItemId && !item.quantity;
}

export {
  createBlankEquipmentLoanItem,
  type DraftEquipmentLoanItem,
  isBlankEquipmentLoanItem,
};
