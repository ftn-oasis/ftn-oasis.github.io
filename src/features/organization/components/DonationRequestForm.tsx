import clsx from "clsx";
import { useState } from "react";

import { Button } from "@src/components/ui/Button";

import { isValidNaturalNumberInput } from "../purchaseItemDraft";
import { SELECTABLE_ORGANIZATIONS } from "../selectableOrganizations";
import { PaymentMethod } from "../types";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./requestFormBase.module.css";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "現金",
  [PaymentMethod.BankTransfer]: "銀行口座への振込",
  [PaymentMethod.DirectDebit]: "引き落し",
};

// 「寄付の申請」— 対象組織/支払方法/金額の3項目だけの, 支出の申請より単純な
// フォームです. 支払方法は現金/銀行口座の2択で, 銀行口座は対象組織が
// 口座を登録している場合だけ選べます (Organization.hasBankAccount)
function DonationRequestForm() {
  const [organizationId, setOrganizationId] = useState(
    SELECTABLE_ORGANIZATIONS[0]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [amount, setAmount] = useState("");

  const selectedOrganization = SELECTABLE_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const canUseBankTransfer = Boolean(selectedOrganization?.hasBankAccount);
  const effectivePaymentMethod =
    canUseBankTransfer || paymentMethod === PaymentMethod.Cash
      ? paymentMethod
      : PaymentMethod.Cash;

  const amountError = amount === "" ? "金額を入力してください." : undefined;
  const isValid = organizationId !== "" && !amountError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (組織の先頭選択/現金)
  // から変わっていない状態を「未入力」とみなす
  const isDirty =
    organizationId !== (SELECTABLE_ORGANIZATIONS[0]?.id ?? "") ||
    paymentMethod !== PaymentMethod.Cash ||
    amount !== "";

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
    isDirty,
    pendingMessage: "寄付申請を送信しています…",
    successMessage: "寄付申請の送信が完了しました.",
  });

  const showAmountError = submitAttempted && amountError;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="donation-organization" className={styles.label}>
            1. 対象組織<span className={styles.required}>*</span>
          </label>
          <OrganizationSelectField
            id="donation-organization"
            organizations={SELECTABLE_ORGANIZATIONS}
            value={organizationId}
            onChange={setOrganizationId}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            2. 支払方法<span className={styles.required}>*</span>
          </span>
          <div className={styles.paymentMethodOptions}>
            <label className={styles.paymentMethodOption}>
              <input
                type="radio"
                name="donationPaymentMethod"
                checked={effectivePaymentMethod === PaymentMethod.Cash}
                onChange={() => setPaymentMethod(PaymentMethod.Cash)}
                className={styles.radio}
              />
              現金
            </label>
            {/* 対象組織が銀行口座を登録している場合だけ選べる */}
            {canUseBankTransfer && (
              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  name="donationPaymentMethod"
                  checked={effectivePaymentMethod === PaymentMethod.BankTransfer}
                  onChange={() => setPaymentMethod(PaymentMethod.BankTransfer)}
                  className={styles.radio}
                />
                銀行口座
              </label>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="donation-amount" className={styles.label}>
            3. 金額<span className={styles.required}>*</span>
          </label>
          <span className={styles.amountFieldWrapper}>
            <input
              id="donation-amount"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(event) => {
                if (!isValidNaturalNumberInput(event.target.value)) return;
                setAmount(event.target.value);
              }}
              aria-invalid={Boolean(showAmountError)}
              placeholder="10000"
              className={clsx(
                styles.input,
                styles.amountField,
                showAmountError && styles.inputError,
              )}
            />
            <span className={styles.currencySuffix} aria-hidden="true">
              円
            </span>
          </span>
          {showAmountError && <p className={styles.error}>{amountError}</p>}
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            寄付申請を送信する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "対象組織", value: selectedOrganization?.name ?? "" },
            { label: "支払方法", value: PAYMENT_METHOD_LABEL[effectivePaymentMethod] },
            { label: "金額", value: `${amount || 0}円` },
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

export { DonationRequestForm };
