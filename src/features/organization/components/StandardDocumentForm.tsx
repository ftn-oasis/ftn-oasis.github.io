import { Button } from "@src/components/ui/Button";
import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";
import clsx from "clsx";
import { useMemo, useState } from "react";

import { getDocumentsEditedByCurrentUser, MOCK_ORGANIZATION_DOCUMENTS } from "../mockData";
import { DocumentVisibility } from "../types";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./StandardDocumentForm.module.css";
import requestFormStyles from "./requestFormBase.module.css";

// 「デフォルトで最近編集に参加した組織を入力」— 自身が編集に関わった文書のうち
// 最新のものの組織を既定値にする. 該当が無ければ (currentUser がまだどの文書も
// 編集していない場合) 所属組織一覧の先頭にフォールバックする
function getDefaultOrganizationId(): string {
  const mostRecentlyEdited = getDocumentsEditedByCurrentUser()[0];
  if (mostRecentlyEdited) return mostRecentlyEdited.organizationId;
  return MOCK_MY_ORGANIZATIONS[0]?.id ?? "";
}

const DESCRIPTION_MIN_LENGTH = 16;

const VISIBILITY_OPTIONS: {
  value: DocumentVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: DocumentVisibility.Public,
    label: "公開",
    description: "組織外の人も含め, 誰でもこの文書を見ることができます.",
  },
  {
    value: DocumentVisibility.Private,
    label: "非公開",
    description: "組織に所属するメンバーだけがこの文書を見ることができます.",
  },
];

// 「通常の文書を作成」— ~/documents/new の最上部のモード選択のうち従来から
// ある画面. GitHub の New repository ページを参考にした, 組織/文書名/文書概要/
// 公開範囲を入力するフォームです. バックエンドが無いため実際の文書作成処理は
// 行いませんが, 依頼された各項目のバリデーション (文書名の組織内重複チェック,
// 文書概要の文字数下限) は実際に機能し, 送信/キャンセルの一連の UX は
// useRequestSubmitFlow (~/book/new の3フォームと共通) で再現しています
function StandardDocumentForm() {
  const [organizationId, setOrganizationId] = useState(getDefaultOrganizationId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility>(
    DocumentVisibility.Public,
  );
  const [titleTouched, setTitleTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const trimmedTitle = title.trim();

  const isDuplicateTitle = useMemo(() => {
    if (!trimmedTitle) return false;
    return MOCK_ORGANIZATION_DOCUMENTS.some(
      (document) =>
        document.organizationId === organizationId && document.title === trimmedTitle,
    );
  }, [organizationId, trimmedTitle]);

  const titleError = !trimmedTitle
    ? "文書名を入力してください."
    : isDuplicateTitle
      ? "この文書名は組織内で既に使われています."
      : undefined;

  const descriptionError =
    description.length < DESCRIPTION_MIN_LENGTH
      ? `文書概要は${DESCRIPTION_MIN_LENGTH}文字以上で入力してください (現在${description.length}文字).`
      : undefined;

  const isValid = !titleError && !descriptionError && organizationId !== "";

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (最近編集した組織/公開)
  // から変わっていない状態を「未入力」とみなす
  const isDirty =
    trimmedTitle !== "" ||
    description !== "" ||
    visibility !== DocumentVisibility.Public ||
    organizationId !== getDefaultOrganizationId();

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
    pendingMessage: "文書を作成しています…",
    successMessage: "文書の作成が完了しました.",
  });

  const showTitleError = (titleTouched || submitAttempted) && titleError;
  const showDescriptionError = (descriptionTouched || submitAttempted) && descriptionError;

  const selectedOrganization = MOCK_MY_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const selectedVisibilityLabel = VISIBILITY_OPTIONS.find(
    (option) => option.value === visibility,
  )?.label;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="new-document-organization" className={styles.label}>
            1. 組織<span className={styles.required}>*</span>
          </label>
          <OrganizationSelectField
            id="new-document-organization"
            organizations={MOCK_MY_ORGANIZATIONS}
            value={organizationId}
            onChange={setOrganizationId}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="new-document-title" className={styles.label}>
            2. 文書名<span className={styles.required}>*</span>
          </label>
          <input
            id="new-document-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTitleTouched(true)}
            aria-invalid={Boolean(showTitleError)}
            className={clsx(styles.input, showTitleError && styles.inputError)}
          />
          {showTitleError ? (
            <p className={styles.error}>{titleError}</p>
          ) : (
            <p className={styles.hint}>
              文書 ID とは別の, 表示用の名称です. 組織内で重複しなければ他の組織の
              文書名と重複しても構いません.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="new-document-description" className={styles.label}>
            3. 文書概要<span className={styles.required}>*</span>
          </label>
          <textarea
            id="new-document-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => setDescriptionTouched(true)}
            aria-invalid={Boolean(showDescriptionError)}
            className={clsx(styles.textarea, showDescriptionError && styles.inputError)}
          />
          <div className={styles.textareaFooter}>
            {showDescriptionError ? (
              <p className={styles.error}>{descriptionError}</p>
            ) : (
              <p className={styles.hint}>{DESCRIPTION_MIN_LENGTH}文字以上で入力してください.</p>
            )}
            {description.length < DESCRIPTION_MIN_LENGTH && (
              <span className={styles.charCount}>
                {description.length}/{DESCRIPTION_MIN_LENGTH}文字
              </span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>4. 公開範囲</span>
          <div className={requestFormStyles.requestTypeOptions}>
            {VISIBILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  requestFormStyles.requestTypeOption,
                  visibility === option.value &&
                    requestFormStyles.requestTypeOptionSelected,
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={visibility === option.value}
                  onChange={() => setVisibility(option.value)}
                  className={requestFormStyles.radio}
                />
                <span className={requestFormStyles.requestTypeText}>
                  <span className={requestFormStyles.requestTypeLabel}>
                    {option.label}
                  </span>
                  <span className={requestFormStyles.requestTypeDescription}>
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            文書を作成する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "組織", value: selectedOrganization?.name ?? "" },
            { label: "文書名", value: trimmedTitle },
            { label: "文書概要", value: description },
            { label: "公開範囲", value: selectedVisibilityLabel ?? "" },
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
    </>
  );
}

export { StandardDocumentForm };
