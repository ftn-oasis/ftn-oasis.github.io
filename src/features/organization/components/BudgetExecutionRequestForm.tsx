import clsx from "clsx";
import { useState } from "react";

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
import { BudgetLineItemSelectField } from "./BudgetLineItemSelectField";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { PurchaseItemsInput } from "./PurchaseItemsInput";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./requestFormBase.module.css";

// 「支払方法: 口座振込･払込票 (ゆうちょ銀行)･現金」— 既存の PaymentMethod
// (現金/銀行振込/引き落し. 実際に完了した会計処理の決済手段を表す型) とは
// 別概念のため (「払込票」は引き落しとは異なる, 用紙に記入して提出する
// 方式), このフォーム限定の型として独立させている. コード上の識別子
// (BankAccount/TransferSlip) は「銀行口座」「振り込み用紙」と呼んでいた頃の
// 名残だが, 値自体は変わっていないため表示ラベルの変更だけに留めている
const BudgetPaymentMethod = {
  BankAccount: "bank-account",
  TransferSlip: "transfer-slip",
  Cash: "cash",
} as const;

type BudgetPaymentMethod =
  (typeof BudgetPaymentMethod)[keyof typeof BudgetPaymentMethod];

const PAYMENT_METHOD_OPTIONS: { value: BudgetPaymentMethod; label: string }[] = [
  { value: BudgetPaymentMethod.BankAccount, label: "口座振込" },
  { value: BudgetPaymentMethod.TransferSlip, label: "払込票 (ゆうちょ銀行)" },
  { value: BudgetPaymentMethod.Cash, label: "現金" },
];

const BANK_CODE_LENGTH = 4;
const BRANCH_CODE_LENGTH = 3;
// ゆうちょ銀行の口座記号番号 (例: 12345-6-78901234) — 記号5桁/検査数字1桁/
// 番号最大8桁の3区分. 番号は口座により桁数が異なるため, 上限8桁までのうち
// 1桁以上埋まっていれば有効とする (左詰め入力, 0始まりも許容)
const POSTAL_SYMBOL_LENGTH = 5;
const POSTAL_CHECK_DIGIT_LENGTH = 1;
const POSTAL_NUMBER_MAX_LENGTH = 8;

// 銀行コード/支店番号/口座番号/口座記号番号の入力を検証する — 数字のみを
// 受け付けるが, purchaseItemDraft.ts の isValidNaturalNumberInput とは異なり
// 先頭の "0" も許容する (口座番号などは "0" 始まりの表記が実在するため).
// maxLength を渡すと桁数の上限も検証する (口座番号のみ上限無し)
function isValidDigitsInput(value: string, maxLength?: number): boolean {
  if (value === "") return true;
  if (!/^\d+$/.test(value)) return false;
  return maxLength === undefined || value.length <= maxLength;
}

// 口座名義の入力を検証する — 全角カタカナ (小書き文字/長音符/中点を含む) と
// 空白 (姓名の区切り用) のみを受け付ける
const KATAKANA_INPUT_PATTERN = /^[゠-ヿ\s]*$/;
function isValidKatakanaInput(value: string): boolean {
  return KATAKANA_INPUT_PATTERN.test(value);
}

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
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [postalSymbol, setPostalSymbol] = useState("");
  const [postalCheckDigit, setPostalCheckDigit] = useState("");
  const [postalNumber, setPostalNumber] = useState("");
  const [postalAccountHolder, setPostalAccountHolder] = useState("");
  const [cashPayee, setCashPayee] = useState("");
  const [remarks, setRemarks] = useState("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [items, setItems] = useState<DraftPurchaseItem[]>([createBlankPurchaseItem()]);
  const [payeeTouched, setPayeeTouched] = useState(false);

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

  const bankAccountValid =
    bankName.trim() !== "" &&
    bankCode.length === BANK_CODE_LENGTH &&
    branchName.trim() !== "" &&
    branchCode.length === BRANCH_CODE_LENGTH &&
    accountNumber !== "" &&
    Number(accountNumber) > 0 &&
    accountHolder.trim() !== "";

  const postalPayeeValid =
    postalSymbol.length === POSTAL_SYMBOL_LENGTH &&
    postalCheckDigit.length === POSTAL_CHECK_DIGIT_LENGTH &&
    postalNumber.length >= 1 &&
    postalAccountHolder.trim() !== "";

  const payeeSummary =
    paymentMethod === BudgetPaymentMethod.BankAccount
      ? bankAccountValid
        ? `${bankName}(${bankCode}) ${branchName}(${branchCode}) 口座番号:${accountNumber} 名義:${accountHolder}`
        : ""
      : paymentMethod === BudgetPaymentMethod.TransferSlip
        ? postalPayeeValid
          ? `${postalSymbol}-${postalCheckDigit}-${postalNumber} 加入者名:${postalAccountHolder}`
          : ""
        : cashPayee;
  const payeeError = !payeeSummary
    ? paymentMethod === BudgetPaymentMethod.BankAccount
      ? "口座振込の情報を全て正しい形式で入力してください."
      : paymentMethod === BudgetPaymentMethod.TransferSlip
        ? "口座記号番号と加入者名を入力してください."
        : "支払先を入力してください."
    : undefined;

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
          <BudgetLineItemSelectField
            id="budget-line-item"
            items={MOCK_BUDGET_LINE_ITEMS}
            value={budgetLineItemId}
            onChange={setBudgetLineItemId}
          />
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
            <>
              <div className={styles.fieldRow}>
                <div className={styles.subField}>
                  <label htmlFor="budget-bank-name" className={styles.subLabel}>
                    銀行名
                  </label>
                  <input
                    id="budget-bank-name"
                    type="text"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="奈梨野銀行"
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
                <div className={styles.subField}>
                  <label htmlFor="budget-bank-code" className={styles.subLabel}>
                    銀行コード
                  </label>
                  <input
                    id="budget-bank-code"
                    type="text"
                    inputMode="numeric"
                    value={bankCode}
                    onChange={(event) => {
                      if (!isValidDigitsInput(event.target.value, BANK_CODE_LENGTH)) return;
                      setBankCode(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="0000"
                    maxLength={BANK_CODE_LENGTH}
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.subField}>
                  <label htmlFor="budget-branch-name" className={styles.subLabel}>
                    支店名
                  </label>
                  <input
                    id="budget-branch-name"
                    type="text"
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="戸古加支店"
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
                <div className={styles.subField}>
                  <label htmlFor="budget-branch-code" className={styles.subLabel}>
                    支店番号
                  </label>
                  <input
                    id="budget-branch-code"
                    type="text"
                    inputMode="numeric"
                    value={branchCode}
                    onChange={(event) => {
                      if (!isValidDigitsInput(event.target.value, BRANCH_CODE_LENGTH)) return;
                      setBranchCode(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="999"
                    maxLength={BRANCH_CODE_LENGTH}
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.subField}>
                  <label htmlFor="budget-account-number" className={styles.subLabel}>
                    口座番号
                  </label>
                  <input
                    id="budget-account-number"
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(event) => {
                      if (!isValidDigitsInput(event.target.value)) return;
                      setAccountNumber(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="1234567"
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
                <div className={styles.subField}>
                  <label htmlFor="budget-account-holder" className={styles.subLabel}>
                    口座名義
                  </label>
                  <input
                    id="budget-account-holder"
                    type="text"
                    value={accountHolder}
                    onChange={(event) => {
                      if (!isValidKatakanaInput(event.target.value)) return;
                      setAccountHolder(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="ドコカノクミンホール"
                    className={clsx(styles.input, showPayeeError && styles.inputError)}
                  />
                </div>
              </div>
              <ul className={styles.hints}>
                <li>銀行コードは{BANK_CODE_LENGTH}桁, 支店番号は{BRANCH_CODE_LENGTH}桁で入力してください (0始まり可).</li>
                <li>口座名義はカナのみで入力してください.</li>
              </ul>
            </>
          )}
          {paymentMethod === BudgetPaymentMethod.TransferSlip && (
            <>
              <div className={styles.subField}>
                <label htmlFor="budget-postal-symbol" className={styles.subLabel}>
                  口座記号番号
                </label>
                <div className={styles.postalAccountRow}>
                  <input
                    id="budget-postal-symbol"
                    type="text"
                    inputMode="numeric"
                    value={postalSymbol}
                    onChange={(event) => {
                      if (!isValidDigitsInput(event.target.value, POSTAL_SYMBOL_LENGTH)) return;
                      setPostalSymbol(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="12345"
                    maxLength={POSTAL_SYMBOL_LENGTH}
                    aria-label="記号"
                    className={clsx(
                      styles.input,
                      styles.postalSegmentSymbol,
                      showPayeeError && styles.inputError,
                    )}
                  />
                  <span className={styles.postalSeparator} aria-hidden="true">
                    -
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={postalCheckDigit}
                    onChange={(event) => {
                      if (
                        !isValidDigitsInput(event.target.value, POSTAL_CHECK_DIGIT_LENGTH)
                      )
                        return;
                      setPostalCheckDigit(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="6"
                    maxLength={POSTAL_CHECK_DIGIT_LENGTH}
                    aria-label="検査数字"
                    className={clsx(
                      styles.input,
                      styles.postalSegmentCheckDigit,
                      showPayeeError && styles.inputError,
                    )}
                  />
                  <span className={styles.postalSeparator} aria-hidden="true">
                    -
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={postalNumber}
                    onChange={(event) => {
                      if (!isValidDigitsInput(event.target.value, POSTAL_NUMBER_MAX_LENGTH))
                        return;
                      setPostalNumber(event.target.value);
                    }}
                    onBlur={() => setPayeeTouched(true)}
                    placeholder="78901234"
                    maxLength={POSTAL_NUMBER_MAX_LENGTH}
                    aria-label="番号"
                    className={clsx(
                      styles.input,
                      styles.postalSegmentNumber,
                      showPayeeError && styles.inputError,
                    )}
                  />
                </div>
              </div>
              <div className={clsx(styles.subField, styles.nestedField)}>
                <label htmlFor="budget-postal-account-holder" className={styles.subLabel}>
                  加入者名
                </label>
                <input
                  id="budget-postal-account-holder"
                  type="text"
                  value={postalAccountHolder}
                  onChange={(event) => setPostalAccountHolder(event.target.value)}
                  onBlur={() => setPayeeTouched(true)}
                  placeholder="戸古加野区民ホール"
                  className={clsx(styles.input, showPayeeError && styles.inputError)}
                />
              </div>
              <ul className={styles.hints}>
                <li>
                  口座記号番号は{POSTAL_SYMBOL_LENGTH}桁-{POSTAL_CHECK_DIGIT_LENGTH}桁-
                  {POSTAL_NUMBER_MAX_LENGTH}桁の形式で入力してください (0始まり可).
                </li>
                <li>番号欄は左詰めで入力し, 1桁以上埋まっていれば構いません.</li>
              </ul>
            </>
          )}
          {paymentMethod === BudgetPaymentMethod.Cash && (
            <div className={styles.subField}>
              <label htmlFor="budget-cash-payee" className={styles.subLabel}>
                支払先
              </label>
              <input
                id="budget-cash-payee"
                type="text"
                value={cashPayee}
                onChange={(event) => setCashPayee(event.target.value)}
                onBlur={() => setPayeeTouched(true)}
                placeholder="戸古加野区民ホール 事務局"
                className={clsx(styles.input, showPayeeError && styles.inputError)}
              />
            </div>
          )}
          {showPayeeError && <p className={styles.error}>{payeeError}</p>}

          <div className={styles.nestedField}>
            <span className={styles.label}>備考 (任意)</span>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="補足事項があれば入力してください."
              rows={2}
              className={styles.textarea}
            />
          </div>

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
            入力内容を破棄
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
            { label: "備考", value: remarks || "(なし)" },
            { label: "参考画像", value: `${referenceImages.length}件` },
            {
              label: "購入品目",
              value: `${nonBlankItems.length}件 (合計${itemsTotal}円)`,
            },
          ]}
          onEdit={closeConfirm}
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
