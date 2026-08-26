import { Button } from "@src/components/ui/Button";
import { DiscardConfirmDialog } from "@src/features/organization/components/DiscardConfirmDialog";
import { OrganizationSelectField } from "@src/features/organization/components/OrganizationSelectField";
import { RequestConfirmDialog } from "@src/features/organization/components/RequestConfirmDialog";
import requestFormStyles from "@src/features/organization/components/requestFormBase.module.css";
import { useRequestSubmitFlow } from "@src/features/organization/useRequestSubmitFlow";
import { formatDate } from "@src/features/organization/calendarUtils";
import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";
import { useState } from "react";

import {
  createBlankEquipmentLoanItem,
  type DraftEquipmentLoanItem,
  isBlankEquipmentLoanItem,
} from "../equipmentLoanItemDraft";
import { EquipmentDateRangePicker } from "./EquipmentDateRangePicker";
import { EquipmentLoanItemsInput } from "./EquipmentLoanItemsInput";

// 貸出先の区分 — 「組織として借りるか個人として借りるか」という依頼のための
// このフォーム限定の型 (どちらのリストとも紐付かない create-form 専用の
// 概念のため, BudgetPaymentMethod 等と同じく shared types.ts ではなくここに
// ローカルで定義しています)
const EquipmentLoanOwnerType = {
  Individual: "individual",
  Organization: "organization",
} as const;

type EquipmentLoanOwnerType = (typeof EquipmentLoanOwnerType)[keyof typeof EquipmentLoanOwnerType];

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function diffInDaysInclusive(start: Date, end: Date): number {
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / (24 * 60 * 60 * 1000)) + 1;
}

// ~/equipment-loans/new — CreateButton の「備品貸出を申請」が指すページです.
// 依頼された4項目を, ExpenseRequestForm/NewOrganizationSection と同じ単一
// 画面のフォーム (useRequestSubmitFlow による確認画面/破棄確認/離脱ガード)
// として実装しています:
//
// 1. 借りる備品とその個数 — 「~/book/new の購入品目のリストを参考に作成して
//    ほしい」という依頼のため PurchaseItemsInput と同じ「常に末尾に空白行を
//    保つ編集可能な表」の構成 (EquipmentLoanItemsInput) ですが, 備品名は
//    自由入力ではなく既存の備品一覧からドロップダウンで選ぶ形にしています
//    (貸出中の備品/他の行で選択済みの備品は選択肢から除外).
// 2. 借りる期間 — 「ミニカレンダーに枠を表示し, それをドラッグすることで
//    選択範囲を調節してほしい」という依頼のため, 新規実装の
//    EquipmentDateRangePicker (詳細はそちらのコメントを参照) を使います.
// 3. 借り方 (個人として借りるか組織として借りるか) — シンプルな2択ラジオ.
// 4. 借りる組織 — 「借り方」で組織が選ばれた場合だけ表示するドロップダウン
//    (自身が所属する組織一覧, StandardDocumentForm 等と同じ
//    features/user/mockData.ts の MOCK_ORGANIZATIONS を使用).
function NewEquipmentLoanSection() {
  const [items, setItems] = useState<DraftEquipmentLoanItem[]>([createBlankEquipmentLoanItem()]);

  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState(getToday);
  // isDirty 判定 (下記) のための, マウント時点の日付 (= 既定値) を保持するだけの
  // state (以後は更新しない) — NewMeetingSection の initialDate と同じ考え方
  const [initialStartDate] = useState(startDate);
  const [initialEndDate] = useState(endDate);

  const [ownerType, setOwnerType] = useState<EquipmentLoanOwnerType>(
    EquipmentLoanOwnerType.Individual,
  );
  const defaultOrganizationId = MOCK_MY_ORGANIZATIONS[0]?.id ?? "";
  const [organizationId, setOrganizationId] = useState(defaultOrganizationId);

  const nonBlankItems = items.filter((item) => !isBlankEquipmentLoanItem(item));
  const itemsError =
    nonBlankItems.length === 0 ? "借りる備品を1件以上入力してください." : undefined;

  const isOrganizationOwner = ownerType === EquipmentLoanOwnerType.Organization;
  const isValid = !itemsError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 — 初期値 (空の備品行/今日1日分の期間/個人/所属組織の先頭) から
  // 変わっていない状態を「未入力」とみなす
  const isDirty =
    nonBlankItems.length > 0 ||
    startDate.getTime() !== initialStartDate.getTime() ||
    endDate.getTime() !== initialEndDate.getTime() ||
    ownerType !== EquipmentLoanOwnerType.Individual ||
    organizationId !== defaultOrganizationId;

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
    pendingMessage: "備品貸出を申請しています…",
    successMessage: "備品貸出の申請が完了しました.",
  });

  const showItemsError = submitAttempted && itemsError;

  const selectedOrganization = MOCK_MY_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const totalQuantity = nonBlankItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const dayCount = diffInDaysInclusive(startDate, endDate);

  return (
    <div className={requestFormStyles.root}>
      <h1 className={requestFormStyles.heading}>備品貸出を申請</h1>
      <p className={requestFormStyles.subtitle}>新しく備品貸出を申請します.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            1. 借りる備品<span className={requestFormStyles.required}>*</span>
          </span>
          <EquipmentLoanItemsInput items={items} onChange={setItems} />
          {showItemsError && <p className={requestFormStyles.error}>{itemsError}</p>}
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            2. 借りる期間<span className={requestFormStyles.required}>*</span>
          </span>
          <EquipmentDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(nextStart, nextEnd) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            3. 借り方<span className={requestFormStyles.required}>*</span>
          </span>
          <div className={requestFormStyles.paymentMethodOptions}>
            <label className={requestFormStyles.paymentMethodOption}>
              <input
                type="radio"
                name="equipmentLoanOwnerType"
                checked={ownerType === EquipmentLoanOwnerType.Individual}
                onChange={() => setOwnerType(EquipmentLoanOwnerType.Individual)}
                className={requestFormStyles.radio}
              />
              個人として借りる
            </label>
            <label className={requestFormStyles.paymentMethodOption}>
              <input
                type="radio"
                name="equipmentLoanOwnerType"
                checked={isOrganizationOwner}
                onChange={() => setOwnerType(EquipmentLoanOwnerType.Organization)}
                className={requestFormStyles.radio}
              />
              組織として借りる
            </label>
          </div>
        </div>

        {isOrganizationOwner && (
          <div className={requestFormStyles.field}>
            <label htmlFor="equipment-loan-organization" className={requestFormStyles.label}>
              4. 借りる組織<span className={requestFormStyles.required}>*</span>
            </label>
            <OrganizationSelectField
              id="equipment-loan-organization"
              organizations={MOCK_MY_ORGANIZATIONS}
              value={organizationId}
              onChange={setOrganizationId}
            />
          </div>
        )}

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            申請する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "借りる備品", value: `${nonBlankItems.length}件 (計${totalQuantity}個)` },
            {
              label: "借りる期間",
              value: `${formatDate(startDate)} 〜 ${formatDate(endDate)} (${dayCount}日間)`,
            },
            {
              label: "貸出先",
              value: isOrganizationOwner ? (selectedOrganization?.name ?? "") : "個人",
            },
          ]}
          heading="この内容で申請しますか?"
          confirmLabel="申請する"
          onEdit={closeConfirm}
          onConfirm={handleConfirmedSubmit}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmDialog onDiscard={handleDiscard} onKeepEditing={closeDiscardConfirm} />
      )}
    </div>
  );
}

export { NewEquipmentLoanSection };
