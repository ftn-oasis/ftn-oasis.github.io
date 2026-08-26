import { Button } from "@src/components/ui/Button";
import clsx from "clsx";
import { useState } from "react";

import { SELECTABLE_ORGANIZATIONS } from "../selectableOrganizations";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import {
  createBlankPurchaseItem,
  type DraftPurchaseItem,
  isBlankPurchaseItem,
  purchaseItemSubtotal,
} from "../purchaseItemDraft";
import { TransactionRequestType } from "../types";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { PurchaseItemsInput } from "./PurchaseItemsInput";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./requestFormBase.module.css";

const PURPOSE_MIN_LENGTH = 4;

const REQUEST_TYPE_OPTIONS: {
  value: TransactionRequestType;
  label: string;
  description: string;
}[] = [
  {
    value: TransactionRequestType.AdvancePayment,
    label: "仮払",
    description: "購入前に代金を受け取ります.",
  },
  {
    value: TransactionRequestType.Reimbursement,
    label: "立替",
    description: "自分で立て替えて購入し, 後日その代金の精算を受けます.",
  },
];

// 「支出の申請」— ~/book/new の最上部の3種類 (支出/予算執行/寄付) のうち
// 従来からある画面. GitHub の New repository ページを参考にした構成の
// 会計申請作成フォームです. バックエンドが無いため実際の申請作成処理は
// 行いませんが, 送信/キャンセルの一連の UX は useRequestSubmitFlow (3フォーム
// 共通) で再現しています
function ExpenseRequestForm() {
  const [organizationId, setOrganizationId] = useState(
    SELECTABLE_ORGANIZATIONS[0]?.id ?? "",
  );
  const [purpose, setPurpose] = useState("");
  const [requestType, setRequestType] = useState<TransactionRequestType>(
    TransactionRequestType.AdvancePayment,
  );
  const [items, setItems] = useState<DraftPurchaseItem[]>([createBlankPurchaseItem()]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [purposeTouched, setPurposeTouched] = useState(false);

  const trimmedPurpose = purpose.trim();
  const purposeError =
    trimmedPurpose.length < PURPOSE_MIN_LENGTH
      ? `購入名目は${PURPOSE_MIN_LENGTH}文字以上で入力してください.`
      : undefined;

  const selectedOrganization = SELECTABLE_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const selectedRequestTypeLabel = REQUEST_TYPE_OPTIONS.find(
    (option) => option.value === requestType,
  )?.label;
  const nonBlankItems = items.filter((item) => !isBlankPurchaseItem(item));
  const itemsTotal = nonBlankItems.reduce(
    (sum, item) => sum + purchaseItemSubtotal(item),
    0,
  );
  const itemsError =
    nonBlankItems.length === 0 ? "購入品目を1件以上入力してください." : undefined;

  const isValid = !purposeError && organizationId !== "" && !itemsError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (組織の先頭選択/仮払)
  // から変わっていない状態を「未入力」とみなす
  const isDirty =
    organizationId !== (SELECTABLE_ORGANIZATIONS[0]?.id ?? "") ||
    purpose !== "" ||
    requestType !== TransactionRequestType.AdvancePayment ||
    nonBlankItems.length > 0 ||
    receiptFiles.length > 0;

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
    pendingMessage: "会計申請を送信しています…",
    successMessage: "会計申請の送信が完了しました.",
  });

  const showPurposeError = (purposeTouched || submitAttempted) && purposeError;
  const showItemsError = submitAttempted && itemsError;
  const isReimbursement = requestType === TransactionRequestType.Reimbursement;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="expense-organization" className={styles.label}>
            1. 組織<span className={styles.required}>*</span>
          </label>
          <OrganizationSelectField
            id="expense-organization"
            organizations={SELECTABLE_ORGANIZATIONS}
            value={organizationId}
            onChange={setOrganizationId}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="expense-purpose" className={styles.label}>
            2. 購入名目<span className={styles.required}>*</span>
          </label>
          <input
            id="expense-purpose"
            type="text"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            onBlur={() => setPurposeTouched(true)}
            aria-invalid={Boolean(showPurposeError)}
            placeholder="附高祭の大道具･小道具の材料の購入…"
            className={clsx(styles.input, showPurposeError && styles.inputError)}
          />
          <ul className={styles.hints}>
            <li>{PURPOSE_MIN_LENGTH}文字以上で簡潔な, 判りやすい名目を入力してください.</li>
          </ul>
          {showPurposeError && <p className={styles.error}>{purposeError}</p>}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            3. 種類<span className={styles.required}>*</span>
          </span>
          <div className={styles.requestTypeOptions}>
            {REQUEST_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  styles.requestTypeOption,
                  requestType === option.value && styles.requestTypeOptionSelected,
                )}
              >
                <input
                  type="radio"
                  name="requestType"
                  value={option.value}
                  checked={requestType === option.value}
                  onChange={() => setRequestType(option.value)}
                  className={styles.radio}
                />
                <span className={styles.requestTypeText}>
                  <span className={styles.requestTypeLabel}>{option.label}</span>
                  <span className={styles.requestTypeDescription}>
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            4. 購入品目<span className={styles.required}>*</span>
          </span>
          <PurchaseItemsInput
            items={items}
            onChange={setItems}
            isEstimate={requestType === TransactionRequestType.AdvancePayment}
          />
          {showItemsError && <p className={styles.error}>{itemsError}</p>}
        </div>

        {isReimbursement && (
          <div className={styles.field}>
            <span className={styles.label}>5. 証憑画像</span>
            <ReceiptUploadField files={receiptFiles} onChange={setReceiptFiles} />
          </div>
        )}

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            会計申請を送信する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "組織", value: selectedOrganization?.name ?? "" },
            { label: "購入名目", value: purpose },
            { label: "種類", value: selectedRequestTypeLabel ?? "" },
            {
              label: "合計金額",
              value: `${itemsTotal}円 (${nonBlankItems.length}件)`,
            },
            ...(isReimbursement
              ? [{ label: "証憑画像", value: `${receiptFiles.length}件` }]
              : []),
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

export { ExpenseRequestForm };
