import { Button } from "@src/components/ui/Button";
import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";
import clsx from "clsx";
import { type FormEvent, useMemo, useState } from "react";

import {
  getDocumentsEditedByCurrentUser,
  MOCK_ORGANIZATION_DOCUMENTS,
} from "../mockData";
import { DocumentVisibility } from "../types";

import styles from "./NewDocumentSection.module.css";

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

// ~/documents/new の本文. GitHub の New repository ページを参考にした,
// 組織/文書名/文書概要/公開範囲を入力するフォームです. バックエンドが無いため
// 送信ボタンの動作自体はのちほど実装しますが, 依頼された各項目のバリデーション
// (文書名の組織内重複チェック, 文書概要の文字数下限) は実際に機能します
function NewDocumentSection() {
  const [organizationId, setOrganizationId] = useState(getDefaultOrganizationId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility>(
    DocumentVisibility.Public,
  );
  const [titleTouched, setTitleTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

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

  const showTitleError = (titleTouched || submitAttempted) && titleError;
  const showDescriptionError = (descriptionTouched || submitAttempted) && descriptionError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;
    // 送信 (実際の文書作成) の動作はのちほど実装する
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>文書を作成</h1>
      <p className={styles.subtitle}>
        文書は組織に所属します. 組織を選び, 文書名と概要を入力してください.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="new-document-organization" className={styles.label}>
            組織<span className={styles.required}>*</span>
          </label>
          <select
            id="new-document-organization"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            className={styles.select}
          >
            {MOCK_MY_ORGANIZATIONS.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="new-document-title" className={styles.label}>
            文書名<span className={styles.required}>*</span>
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
            文書概要<span className={styles.required}>*</span>
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
          <span className={styles.label}>公開範囲</span>
          <div className={styles.visibilityOptions}>
            {VISIBILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  styles.visibilityOption,
                  visibility === option.value && styles.visibilityOptionSelected,
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={visibility === option.value}
                  onChange={() => setVisibility(option.value)}
                  className={styles.radio}
                />
                <span className={styles.visibilityText}>
                  <span className={styles.visibilityLabel}>{option.label}</span>
                  <span className={styles.visibilityDescription}>
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">文書を作成する</Button>
      </form>
    </div>
  );
}

export { NewDocumentSection };
