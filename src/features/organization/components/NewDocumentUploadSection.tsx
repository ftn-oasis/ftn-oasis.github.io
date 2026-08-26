import { Button } from "@src/components/ui/Button";
import clsx from "clsx";
import { type FormEvent, useState } from "react";

import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { DocumentUploadDropzone } from "./DocumentUploadDropzone";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./NewDocumentUploadSection.module.css";

const DESCRIPTION_MIN_LENGTH = 16;

// アップロード予定の1ファイル分の下書き — 選択直後は文書名/概要とも空で,
// 「次へ」の画面で1件ずつ入力させる. PurchaseItemsInput の DraftPurchaseItem
// と同じく, 自由入力のため確定した ID を持たないファイル (File 自体には
// 安定した ID が無い) の代わりに, ここで振った id をキーとして使う
type DraftUploadedDocument = {
  id: string;
  file: File;
  title: string;
  description: string;
};

function isDraftValid(draft: DraftUploadedDocument, allDrafts: DraftUploadedDocument[]): boolean {
  const trimmedTitle = draft.title.trim();
  if (!trimmedTitle) return false;
  const isDuplicateTitle = allDrafts.some(
    (other) => other.id !== draft.id && other.title.trim() === trimmedTitle,
  );
  if (isDuplicateTitle) return false;
  return draft.description.length >= DESCRIPTION_MIN_LENGTH;
}

// ~/documents/new/upload — CreateButton の「文書をアップロード」が指す
// ページです. 「"文書を作成" の "通常の文書を作成" (StandardDocumentForm) の
// 内容を参考にしてほしい」という依頼のため, フィールドの見た目 (入力欄/
// エラー表示/確認画面/破棄確認/離脱ガード) は同じパターンを踏襲しつつ,
// 「アップロードスペース→ファイルごとの情報入力を1件ずつ」という2段階の
// ウィザード形式にしています:
//
// 1. アップロード画面 (step "upload") — DocumentUploadDropzone で複数ファイルを
//    選択させ, 「次へ」でファイルごとの情報入力へ進む (1件も選んでいない
//    場合は進めない).
// 2. ファイルごとの情報入力画面 (step "details") — 選択したファイルを1件ずつ,
//    文書名/文書概要 (StandardDocumentForm と同じバリデーション. ただし
//    組織を選ばないフォームのため, 文書名の重複チェックは「組織内」ではなく
//    「このアップロードのバッチ内」で行う) を入力させ, 「次へ」を押すたびに
//    次のファイルへ進む. 最後のファイルでは「次へ」の代わりに「確認する」を
//    表示し, 全ファイル分の要約を示す確認画面 (RequestConfirmDialog) を開く.
//
// 「入力内容を破棄」(全体の破棄, useRequestSubmitFlow を通してどの画面からも
// 同じ破棄確認を開く) に加え, ファイルごとの情報入力画面には「このファイルの
// アップロードを取り消す」(このファイルだけをバッチから外し, 次のファイルへ
// 進む — 残りが無くなった場合はアップロード画面まで戻る) を表示しています.
// アップロード画面のファイル一覧の各行にある削除ボタン (DocumentUploadDropzone)
// も同じ役割を果たします.
function NewDocumentUploadSection() {
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadAttempted, setUploadAttempted] = useState(false);

  const [drafts, setDrafts] = useState<DraftUploadedDocument[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileSubmitAttempted, setFileSubmitAttempted] = useState(false);

  const currentDraft = drafts[currentIndex];
  const isLastFile = currentIndex === drafts.length - 1;

  const updateCurrentDraft = (patch: Partial<Pick<DraftUploadedDocument, "title" | "description">>) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === currentDraft?.id ? { ...draft, ...patch } : draft)),
    );
  };

  const trimmedTitle = currentDraft?.title.trim() ?? "";
  const isDuplicateTitle = drafts.some(
    (draft) => draft.id !== currentDraft?.id && draft.title.trim() === trimmedTitle,
  );
  const titleError = !trimmedTitle
    ? "文書名を入力してください."
    : isDuplicateTitle
      ? "この文書名は他のファイルと重複しています."
      : undefined;
  const descriptionLength = currentDraft?.description.length ?? 0;
  const descriptionError =
    descriptionLength < DESCRIPTION_MIN_LENGTH
      ? `文書概要は${DESCRIPTION_MIN_LENGTH}文字以上で入力してください (現在${descriptionLength}文字).`
      : undefined;

  // 全ファイル分の情報が揃って初めて (=最後のファイルの「確認する」で)
  // 送信可能になる — useRequestSubmitFlow の isValid はこのバッチ全体の
  // 検証結果を渡す
  const allDraftsValid = drafts.length > 0 && drafts.every((draft) => isDraftValid(draft, drafts));

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 — ファイルを1件でも選んでいれば「未入力」ではないとみなす
  const isDirty = pendingFiles.length > 0 || drafts.length > 0;

  const {
    confirmOpen,
    discardConfirmOpen,
    handleSubmit,
    handleConfirmedSubmit,
    handleRequestCancel,
    handleDiscard,
    closeConfirm,
    closeDiscardConfirm,
  } = useRequestSubmitFlow({
    isValid: allDraftsValid,
    isDirty,
    pendingMessage: "文書をアップロードしています…",
    successMessage: `${drafts.length}件の文書のアップロードが完了しました.`,
  });

  const showTitleError = fileSubmitAttempted && titleError;
  const showDescriptionError = fileSubmitAttempted && descriptionError;

  // ファイル一式が決まった後の一覧を, ファイルごとの下書き (id/title/
  // description) に変換してファイルごとの情報入力画面へ進む
  const handleProceedToDetails = () => {
    if (pendingFiles.length === 0) {
      setUploadAttempted(true);
      return;
    }
    setDrafts(
      pendingFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        title: "",
        description: "",
      })),
    );
    setCurrentIndex(0);
    setFileSubmitAttempted(false);
    setStep("details");
  };

  const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLastFile) {
      // 最後のファイル — useRequestSubmitFlow 側の handleSubmit に委ね,
      // 全ファイル分 (allDraftsValid) が有効なら確認画面を開く
      handleSubmit(event);
      if (!allDraftsValid) setFileSubmitAttempted(true);
      return;
    }
    if (!currentDraft || !isDraftValid(currentDraft, drafts)) {
      setFileSubmitAttempted(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setFileSubmitAttempted(false);
  };

  // 「このファイルのアップロードを取り消す」— このファイルだけをバッチから
  // 外す. 外した結果, まだ情報入力が済んでいないファイルが残っていれば
  // (同じ index がそのまま次のファイルを指すようになる) そのまま続け,
  // 1件も残らなければアップロード画面まで戻す. 取り消したファイルが末尾
  // だった場合は, 新たに末尾になった (既に入力済みの) ファイルの画面まで
  // index を詰める — 内容は既に入力済みなので, そのまま「確認する」を
  // 押せば進める
  const handleCancelCurrentFile = () => {
    if (!currentDraft) return;
    const remaining = drafts.filter((draft) => draft.id !== currentDraft.id);

    if (remaining.length === 0) {
      setDrafts([]);
      setPendingFiles([]);
      setCurrentIndex(0);
      setFileSubmitAttempted(false);
      setStep("upload");
      return;
    }

    setDrafts(remaining);
    setFileSubmitAttempted(false);
    setCurrentIndex((index) => Math.min(index, remaining.length - 1));
  };

  const confirmItems = drafts.map((draft, index) => ({
    label: `文書 ${index + 1}`,
    value: draft.title,
  }));

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>文書をアップロード</h1>
      <p className={styles.subtitle}>
        複数のファイルをまとめてアップロードし, ファイルごとに文書名/文書概要を入力します.
      </p>

      {step === "upload" ? (
        <div>
          <div className={styles.field}>
            <span className={styles.label}>1. アップロードするファイル</span>
            <DocumentUploadDropzone files={pendingFiles} onChange={setPendingFiles} />
            {uploadAttempted && pendingFiles.length === 0 && (
              <p className={styles.error}>アップロードするファイルを選択してください.</p>
            )}
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleRequestCancel}>
              入力内容を破棄
            </Button>
            <Button type="button" color="green" onClick={handleProceedToDetails}>
              次へ
            </Button>
          </div>
        </div>
      ) : (
        currentDraft && (
          <form onSubmit={handleDetailsSubmit} noValidate>
            <p className={styles.progress}>
              {currentIndex + 1} / {drafts.length} 件目 — {currentDraft.file.name}
            </p>

            <div className={styles.field}>
              <label htmlFor="upload-document-title" className={styles.label}>
                1. 文書名<span className={styles.required}>*</span>
              </label>
              <input
                id="upload-document-title"
                type="text"
                value={currentDraft.title}
                onChange={(event) => updateCurrentDraft({ title: event.target.value })}
                aria-invalid={Boolean(showTitleError)}
                className={clsx(styles.input, showTitleError && styles.inputError)}
              />
              {showTitleError ? (
                <p className={styles.error}>{titleError}</p>
              ) : (
                <p className={styles.hint}>
                  文書 ID とは別の, 表示用の名称です. このアップロード内の他のファイルと
                  重複しないようにしてください.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="upload-document-description" className={styles.label}>
                2. 文書概要<span className={styles.required}>*</span>
              </label>
              <textarea
                id="upload-document-description"
                value={currentDraft.description}
                onChange={(event) => updateCurrentDraft({ description: event.target.value })}
                aria-invalid={Boolean(showDescriptionError)}
                className={clsx(styles.textarea, showDescriptionError && styles.inputError)}
              />
              <div className={styles.textareaFooter}>
                {showDescriptionError ? (
                  <p className={styles.error}>{descriptionError}</p>
                ) : (
                  <p className={styles.hint}>{DESCRIPTION_MIN_LENGTH}文字以上で入力してください.</p>
                )}
                {descriptionLength < DESCRIPTION_MIN_LENGTH && (
                  <span className={styles.charCount}>
                    {descriptionLength}/{DESCRIPTION_MIN_LENGTH}文字
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <div className={styles.secondaryActions}>
                <Button type="button" variant="ghost" onClick={handleRequestCancel}>
                  入力内容を破棄
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancelCurrentFile}>
                  このファイルのアップロードを取り消す
                </Button>
              </div>
              <Button type="submit" color="green">
                {isLastFile ? "確認する" : "次へ"}
              </Button>
            </div>
          </form>
        )
      )}

      {confirmOpen && (
        <RequestConfirmDialog
          items={confirmItems}
          heading="この内容でアップロードしますか?"
          confirmLabel="アップロードする"
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

export { NewDocumentUploadSection };
