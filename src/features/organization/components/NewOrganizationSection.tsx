import { Button } from "@src/components/ui/Button";
import { Icon } from "@src/components/ui/Icon";
import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

import { CURRENT_USER_AS_MEMBER, MOCK_MEMBERS, MOCK_ORGANIZATIONS } from "../mockData";
import {
  ORGANIZATION_CREATION_TYPE_LABEL,
  ORGANIZATION_CREATION_TYPES,
  type OrganizationCreationType,
} from "../organizationCreationTypes";
import type { OrganizationMember } from "../types";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { MemberSelectField } from "./MemberSelectField";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { OrganizationTypeSelectField } from "./OrganizationTypeSelectField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./NewOrganizationSection.module.css";
import requestFormStyles from "./requestFormBase.module.css";

// 親組織を持たない (トップレベルの) 組織を作成する場合に選ぶ, 実在しない
// プレースホルダーの ID. 有志など ancestorNames が空の組織が実在するため
// (OrganizationHeaderBox のパンくず非表示条件を参照), 親組織は必須にしていない
const NO_PARENT_ORGANIZATION_ID = "";

// OrganizationSelectField (会計申請フォームの組織選択と同じ土台) をそのまま
// 再利用するため, 先頭に「なし」の選択肢を合成した配列を渡す
const PARENT_ORGANIZATION_OPTIONS = [
  { id: NO_PARENT_ORGANIZATION_ID, name: "なし (親組織を持たない)" },
  ...MOCK_ORGANIZATIONS,
];

// 構成員として追加できる候補 — 「議事録を作成」モードの参加者追加
// (MeetingMinutesDocumentForm の ADDABLE_MEMBERS) と同じ, 組織の構成員
// (MOCK_MEMBERS) に自分自身を加えたもの
const ADDABLE_MEMBERS: OrganizationMember[] = [...MOCK_MEMBERS, CURRENT_USER_AS_MEMBER];

const EXISTING_ORGANIZATION_NAMES = new Set(MOCK_ORGANIZATIONS.map((org) => org.name));

// ~/orgs/new — CreateButton の「組織を作成」が指すページ. 「~/documents/new
// (文書作成ページ) を参考にしてほしい」という依頼のため, GitHub の New
// repository ページ風の単一カラムフォーム, バリデーション/確認画面/破棄確認
// (useRequestSubmitFlow, 3フォーム+文書作成フォームと共通) を同じ構成で
// 実装しています. 文書作成フォームと違いモードの選択肢が無いため,
// NewDocumentSection のような外側のディスパッチャは無く, この1コンポーネント
// で完結させています
function NewOrganizationSection() {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [parentOrganizationId, setParentOrganizationId] = useState(NO_PARENT_ORGANIZATION_ID);
  const [organizationType, setOrganizationType] = useState<OrganizationCreationType>(
    ORGANIZATION_CREATION_TYPES[0],
  );
  const [members, setMembers] = useState<OrganizationMember[]>([]);

  const trimmedName = name.trim();
  const nameError = !trimmedName
    ? "組織名を入力してください."
    : EXISTING_ORGANIZATION_NAMES.has(trimmedName)
      ? "この組織名は既に使用されています."
      : undefined;

  const isValid = !nameError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (親組織なし/種別の先頭選択/
  // 構成員0人) から変わっていない状態を「未入力」とみなす
  const isDirty =
    trimmedName !== "" ||
    parentOrganizationId !== NO_PARENT_ORGANIZATION_ID ||
    organizationType !== ORGANIZATION_CREATION_TYPES[0] ||
    members.length > 0;

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
    pendingMessage: "組織を作成しています…",
    successMessage: "組織の作成が完了しました.",
  });

  const showNameError = (nameTouched || submitAttempted) && nameError;

  const selectedParentOrganization = PARENT_ORGANIZATION_OPTIONS.find(
    (organization) => organization.id === parentOrganizationId,
  );

  const addableMembers = useMemo(
    () => ADDABLE_MEMBERS.filter((member) => !members.some((m) => m.id === member.id)),
    [members],
  );

  return (
    <div className={requestFormStyles.root}>
      <h1 className={requestFormStyles.heading}>組織を作成</h1>
      <p className={requestFormStyles.subtitle}>新しく組織を作成します.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <label htmlFor="new-organization-name" className={requestFormStyles.label}>
            1. 組織名<span className={requestFormStyles.required}>*</span>
          </label>
          <input
            id="new-organization-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            aria-invalid={Boolean(showNameError)}
            className={clsx(requestFormStyles.input, showNameError && requestFormStyles.inputError)}
          />
          {showNameError && <p className={requestFormStyles.error}>{nameError}</p>}
        </div>

        <div className={requestFormStyles.field}>
          <label htmlFor="new-organization-parent" className={requestFormStyles.label}>
            2. 親組織
          </label>
          <OrganizationSelectField
            id="new-organization-parent"
            organizations={PARENT_ORGANIZATION_OPTIONS}
            value={parentOrganizationId}
            onChange={setParentOrganizationId}
          />
        </div>

        <div className={requestFormStyles.field}>
          <label htmlFor="new-organization-type" className={requestFormStyles.label}>
            3. 組織種別
          </label>
          <OrganizationTypeSelectField
            id="new-organization-type"
            value={organizationType}
            onChange={setOrganizationType}
          />
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>4. 構成員</span>
          {members.length === 0 && (
            <p className={styles.emptyHint}>構成員はまだ追加されていません.</p>
          )}
          {members.length > 0 && (
            <div className={styles.memberList}>
              {members.map((member) => (
                <div key={member.id} className={styles.memberChip}>
                  <span className={styles.memberName}>{member.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setMembers((prev) => prev.filter((m) => m.id !== member.id))
                    }
                    aria-label={`${member.name}を構成員から削除`}
                    className={styles.removeButton}
                  >
                    <Icon icon={IconX} size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {addableMembers.length > 0 && (
            <MemberSelectField
              id="new-organization-member-add"
              members={addableMembers}
              placeholder="構成員を追加"
              onSelect={(member) => setMembers((prev) => [...prev, member])}
            />
          )}
        </div>

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            組織を作成する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "組織名", value: trimmedName },
            { label: "親組織", value: selectedParentOrganization?.name ?? "" },
            { label: "組織種別", value: ORGANIZATION_CREATION_TYPE_LABEL[organizationType] },
            { label: "構成員", value: `${members.length}人` },
          ]}
          heading="この内容で作成しますか?"
          confirmLabel="作成する"
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

export { NewOrganizationSection };
