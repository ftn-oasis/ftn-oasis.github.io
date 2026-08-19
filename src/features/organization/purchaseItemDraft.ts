// 会計申請作成フォーム (/book/new) の購入品目1行分の入力中の値. 入力欄は
// 数値でも一旦文字列として保持し (未入力/入力途中の状態をそのまま表現するため),
// 計 (小計) の算出時だけ数値に変換する — TransactionLineItem (一覧/詳細表示用の
// 確定した値を持つ型) とは別に, フォームの下書き専用の型として独立させている.
// PurchaseItemsInput/NewTransactionSection の両方から使うため, どちらの
// コンポーネントファイルにも属さないこのファイルに置いている (react-refresh の
// "1ファイル1コンポーネント" 制約を避ける意図もある)
type DraftPurchaseItem = {
  id: string;
  name: string;
  description: string;
  unitPrice: string;
  quantity: string;
};

function createBlankPurchaseItem(): DraftPurchaseItem {
  return { id: crypto.randomUUID(), name: "", description: "", unitPrice: "", quantity: "" };
}

function isBlankPurchaseItem(item: DraftPurchaseItem): boolean {
  return !item.name && !item.description && !item.unitPrice && !item.quantity;
}

function purchaseItemSubtotal(item: DraftPurchaseItem): number {
  return (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0);
}

// 金額/個数の入力を検証する — 自然数 (0/負数/小数を含まない) のみを受け付け,
// 先頭が "0" の表記 ("0"/"01" など) も禁止する. 空文字列 (未入力/全消去の
// 途中状態) だけは例外的に許可する. PurchaseItemsInput の onChange で,
// この関数が false を返す入力はそもそも state に反映しない (=
// 無効な文字はそのまま弾かれ, 入力欄に現れない) ことで制約を実現している
function isValidNaturalNumberInput(value: string): boolean {
  return value === "" || /^[1-9]\d*$/.test(value);
}

export {
  createBlankPurchaseItem,
  type DraftPurchaseItem,
  isBlankPurchaseItem,
  isValidNaturalNumberInput,
  purchaseItemSubtotal,
};
