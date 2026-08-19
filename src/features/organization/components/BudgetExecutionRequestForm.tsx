import clsx from "clsx";
import { useMemo, useState } from "react";

import { Button } from "@src/components/ui/Button";

import { MOCK_BUDGET_LINE_ITEMS } from "../budgetMockData";
import {
  createBlankPurchaseItem,
  type DraftPurchaseItem,
  isBlankPurchaseItem,
  purchaseItemSubtotal,
} from "../purchaseItemDraft";
import { SELECTABLE_ORGANIZATIONS } from "../selectableOrganizations";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { PurchaseItemsInput } from "./PurchaseItemsInput";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./requestFormBase.module.css";

// 「支払方法: 銀行口座･振り込み用紙･現金」— 既存の PaymentMethod
// (現金/銀行振込/引き落し. 実際に完了した会計処理の決済手段を表す型) とは
// 別概念のため (「振り込み用紙」は引き落しとは異なる, 用紙に記入して提出する
// 方式), このフォーム限定の型として独立させている
const BudgetPaymentMethod = {
  BankAccount: "bank-account",
  TransferSlip: "transfer-slip",
  Cash: "cash",
} as const;

type BudgetPaymentMethod =
  (typeof BudgetPaymentMethod)[keyof typeof BudgetPaymentMethod];

const PAYMENT_METHOD_OPTIONS: { value: BudgetPaymentMethod; label: string }[] = [
  { value: BudgetPaymentMethod.BankAccount, label: "銀行口座" },
  { value: BudgetPaymentMethod.TransferSlip, label: "振り込み用紙" },
  { value: BudgetPaymentMethod.Cash, label: "現金" },
];

// 「予算執行の申請」— 対象組織/対象予算項目/支払方法/支払先/購入品目の
// 5項目です. 購入品目は「支出の申請のものと同じリスト」という依頼のため,
// ExpenseRequestForm と同じ PurchaseItemsInput をそのまま再利用しています
function BudgetExecutionRequestForm() {
  const [organizationId, setOrganizationId] = useState(
    SELECTABLE_ORGANIZATIONS[0]?.id ?? "",
  );
  const [budgetLineItemId, setBudgetLineItemId] = useState(
    MOCK_BUDGET_LINE_ITEMS[0]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<BudgetPaymentMethod>(
    BudgetPaymentMethod.BankAccount,
  );
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [transferSlipInfo, setTransferSlipInfo] = useState("");
  const [cashPayee, setCashPayee] = useState("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [items, setItems] = useState<DraftPurchaseItem[]>([createBlankPurchaseItem()]);
  const [payeeTouched, setPayeeTouched] = useState(false);

  // 所管→組織の順にグループ化 (<optgroup> は1階層のみのため, ラベルを
  // "所管 - 組織" として連結することで3階層のうち上位2階層を表現し, 実際の
  // 選択肢 (<option>) を末尾の「項」にしている)
  const groupedBudgetLineItems = useMemo(() => {
    const groups = new Map<string, typeof MOCK_BUDGET_LINE_ITEMS>();
    for (const item of MOCK_BUDGET_LINE_ITEMS) {
      const groupLabel = `${item.jurisdiction} - ${item.organizationName}`;
      const group = groups.get(groupLabel) ?? [];
      group.push(item);
      groups.set(groupLabel, group);
    }
    return groups;
  }, []);

  const selectedOrganization = SELECTABLE_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const selectedBudgetLineItem = MOCK_BUDGET_LINE_ITEMS.find(
    (item) => item.id === budgetLineItemId,
  );
  const nonBlankItems = items.filter((item) => !isBlankPurchaseItem(item));
  const itemsTotal = nonBlankItems.reduce(
    (sum, item) => sum + purchaseItemSubtotal(item),
    0,
  );
  const itemsError =
    nonBlankItems.length === 0 ? "購入品目を1件以上入力してください." : undefined;

  const payeeSummary =
    paymentMethod === BudgetPaymentMethod.BankAccount
      ? bankAccountHolder && bankAccountNumber
        ? `${bankAccountHolder} (${bankAccountNumber})`
        : ""
      : paymentMethod === BudgetPaymentMethod.TransferSlip
        ? transferSlipInfo
        : cashPayee;
  const payeeError = !payeeSummary ? "支払先を入力してください." : undefined;

  const isValid = organizationId !== "" && budgetLineItemId !== "" && !payeeError && !itemsError;

  const {
    submitAttempted,
    confirmOpen,
    discardConfirmOpen,
    handleSubmit,
    handleConfirmedSubmit,
    handleRequestCancel,
    handleDiscard,
    closeConfirm,
    closeDiscardConfirm,
  } = useRequestSubmitFlow({
    isValid,
    pendingMessage: "予算執行申請を送信しています…",
    successMessage: "予算執行申請の送信が完了しました.",
  });

  const showPayeeError = (payeeTouched || submitAttempted) && payeeError;
  const showItemsError = submitAttempted && itemsError;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="budget-organization" className={styles.label}>
            1. 対象組織<span className={styles.required}>*</span>
          </label>
          <OrganizationSelectField
            id="budget-organization"
            organizations={SELECTABLE_ORGANIZATIONS}
            value={organizationId}
            onChange={setOrganizationId}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="budget-line-item" className={styles.label}>
            2. 対象予算項目<span className={styles.required}>*</span>
          </label>
          <select
            id="budget-line-item"
            value={budgetLineItemId}
            onChange={(event) => setBudgetLineItemId(event.target.value)}
            className={styles.select}
          >
            {Array.from(groupedBudgetLineItems.entries()).map(([groupLabel, groupItems]) => (
              <optgroup key={groupLabel} label={groupLabel}>
                {groupItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.itemName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            3. 支払方法<span className={styles.required}>*</span>
          </span>
          <div className={styles.paymentMethodOptions}>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <label key={option.value} className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  name="budgetPaymentMethod"
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className={styles.radio}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            4. 支払先<span className={styles.required}>*</span>
          </span>
          {paymentMethod === BudgetPaymentMethod.BankAccount && (
            <div className={styles.fieldRow}>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(event) => setBankAccountNumber(event.target.value)}
                onBlur={() => setPayeeTouched(true)}
                placeholder="口座番号 (1234567)"
                aria-label="口座番号"
                className={clsx(styles.input, showPayeeError && styles.inputError)}
              />
              <input
                type="text"
                value={bankAccountHolder}
                onChange={(event) => setBankAccountHolder(event.target.value)}
                onBlur={() => setPayeeTouched(true)}
                placeholder="名義 (フ)ンカサイジツコウイインカイ"
                aria-label="名義"
                className={clsx(styles.input, showPayeeError && styles.inputError)}
              />
            </div>
          )}
          {paymentMethod === BudgetPaymentMethod.TransferSlip && (
            <textarea
              value={transferSlipInfo}
              onChange={(event) => setTransferSlipInfo(event.target.value)}
              onBlur={() => setPayeeTouched(true)}
              placeholder="振り込み用紙に記載されている情報を入力してください."
              aria-label="振り込み用紙の情報"
              rows={3}
              className={clsx(styles.textarea, showPayeeError && styles.inputError)}
            />
          )}
          {paymentMethod === BudgetPaymentMethod.Cash && (
            <input
              type="text"
              value={cashPayee}
              onChange={(event) => setCashPayee(event.target.value)}
              onBlur={() => setPayeeTouched(true)}
              placeholder="支払先 (文化祭実行委員会 会計担当)"
              aria-label="支払先"
              className={clsx(styles.input, showPayeeError && styles.inputError)}
            />
          )}
          {showPayeeError && <p className={styles.error}>{payeeError}</p>}

          <div className={styles.nestedField}>
            <span className={styles.label}>参考となる画像 (任意)</span>
            <ReceiptUploadField files={referenceImages} onChange={setReferenceImages} />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            5. 購入品目<span className={styles.required}>*</span>
          </span>
          <PurchaseItemsInput items={items} onChange={setItems} />
          {showItemsError && <p className={styles.error}>{itemsError}</p>}
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            キャンセル
          </Button>
          <Button type="submit" color="green">
            予算執行申請を送信する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "対象組織", value: selectedOrganization?.name ?? "" },
            {
              label: "対象予算項目",
              value: selectedBudgetLineItem
                ? `${selectedBudgetLineItem.jurisdiction} / ${selectedBudgetLineItem.organizationName} / ${selectedBudgetLineItem.itemName}`
                : "",
            },
            {
              label: "支払方法",
              value: PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)
                ?.label ?? "",
            },
            { label: "支払先", value: payeeSummary },
            { label: "参考画像", value: `${referenceImages.length}件` },
            {
              label: "購入品目",
              value: `${nonBlankItems.length}件 (合計${itemsTotal}円)`,
            },
          ]}
          onEdit={closeConfirm}
          onCancel={handleRequestCancel}
          onConfirm={handleConfirmedSubmit}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmDialog onDiscard={handleDiscard} onKeepEditing={closeDiscardConfirm} />
      )}
    </>
  );
}

export { BudgetExecutionRequestForm };
