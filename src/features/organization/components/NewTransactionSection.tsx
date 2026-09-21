import clsx from "clsx";
import { useState } from "react";

import { BudgetExecutionRequestForm } from "./BudgetExecutionRequestForm";
import { DonationRequestForm } from "./DonationRequestForm";
import { ExpenseRequestForm } from "./ExpenseRequestForm";

import styles from "./requestFormBase.module.css";

// 「申請の最上部に "支出の申請" "予算執行の申請" "寄付の申請" というラジオ
// ボタンを3つ横並びに配置してほしい」という依頼のため, どの申請を作るかの
// トップレベルのモードとして独立させている. 会計処理の実データ
// (OrganizationTransaction) 側の概念とは異なる, このフォーム限定の分類
const RequestMode = {
  Expense: "expense",
  BudgetExecution: "budget-execution",
  Donation: "donation",
} as const;

type RequestMode = (typeof RequestMode)[keyof typeof RequestMode];

const REQUEST_MODE_OPTIONS: { value: RequestMode; label: string; description: string }[] = [
  {
    value: RequestMode.Expense,
    label: "支出の申請",
    description: "仮払/立替による, 物品などの購入を申請します.",
  },
  {
    value: RequestMode.BudgetExecution,
    label: "予算執行の申請",
    description: "年度始めの予算から, 対象の予算項目を使って支払います.",
  },
  {
    value: RequestMode.Donation,
    label: "寄付の申請",
    description: "返済や精算を伴わない, 組織への寄付を申請します.",
  },
];

// ~/book/new の本文. 「支出」「予算執行」「寄付」の3種類の申請を, 最上部の
// ラジオボタンで切り替える構成です. バックエンドが無いため実際の申請作成
// 処理は行いません — 各モードの実際のフォーム/送信 UX は
// ExpenseRequestForm/BudgetExecutionRequestForm/DonationRequestForm
// (いずれも同じ useRequestSubmitFlow/RequestConfirmDialog/
// DiscardConfirmDialog を使う) にそれぞれ委ねています
function NewTransactionSection() {
  const [mode, setMode] = useState<RequestMode>(RequestMode.Expense);

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>会計申請を作成</h1>
      <p className={styles.subtitle}>作成する申請の種類を選んでください.</p>

      <div className={styles.field}>
        <div className={styles.modeOptions}>
          {REQUEST_MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={clsx(
                styles.requestTypeOption,
                mode === option.value && styles.requestTypeOptionSelected,
              )}
            >
              <input
                type="radio"
                name="requestMode"
                value={option.value}
                checked={mode === option.value}
                onChange={() => setMode(option.value)}
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

      {mode === RequestMode.Expense && <ExpenseRequestForm />}
      {mode === RequestMode.BudgetExecution && <BudgetExecutionRequestForm />}
      {mode === RequestMode.Donation && <DonationRequestForm />}
    </div>
  );
}

export { NewTransactionSection };
