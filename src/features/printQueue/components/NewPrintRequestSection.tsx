import { Button } from "@src/components/ui/Button";
import { isValidNaturalNumberInput } from "@src/features/organization/purchaseItemDraft";
import { DiscardConfirmDialog } from "@src/features/organization/components/DiscardConfirmDialog";
import { RequestConfirmDialog } from "@src/features/organization/components/RequestConfirmDialog";
import { useRequestSubmitFlow } from "@src/features/organization/useRequestSubmitFlow";
import clsx from "clsx";
import { type FormEvent, useState } from "react";

import { PaperSize } from "../types";
import { PaperSizeSelectField } from "./PaperSizeSelectField";
import { PrintFileUploadDropzone } from "./PrintFileUploadDropzone";

import styles from "./NewPrintRequestSection.module.css";

// 印刷依頼予定の1ファイル分の下書き — NewDocumentUploadSection の
// DraftUploadedDocument と同じ考え方 (File 自体に安定した ID が無いため,
// ここで振った id をキーにする). copies は PurchaseItemsInput の個数と同じく
// 未入力/入力途中の状態をそのまま表現するため文字列で保持する
type DraftPrintRequestFile = {
  id: string;
  file: File;
  copies: string;
  paperSize: PaperSize;
  remarks: string;
};

function createDraftFromFile(file: File): DraftPrintRequestFile {
  return { id: crypto.randomUUID(), file, copies: "", paperSize: PaperSize.A3, remarks: "" };
}

function isDraftValid(draft: DraftPrintRequestFile): boolean {
  return draft.copies !== "";
}

// ~/print-queue/new — CreateButton の「印刷を依頼」が指すページです.
// 「~/documents/new/upload を参考にしてほしい」という依頼のため,
// NewDocumentUploadSection と同じ2段階ウィザード形式 (アップロードスペース→
// ファイルごとの情報入力を1件ずつ) で実装しています:
//
// 1. アップロード画面 (step "upload") — PrintFileUploadDropzone で印刷したい
//    複数ファイルを選択させ, 「次へ」でファイルごとの情報入力へ進む (1件も
//    選んでいない場合は進めない).
// 2. ファイルごとの情報入力画面 (step "details") — 選択したファイルを1件ずつ,
//    部数/用紙寸法/備考を入力させ, 「次へ」を押すたびに次のファイルへ進む.
//    最後のファイルでは「次へ」の代わりに「確認する」を表示し, 全ファイル分の
//    要約を示す確認画面 (RequestConfirmDialog) を開く.
//
// NewDocumentUploadSection と同じく, 「入力内容を破棄」(全体の破棄) に加え,
// ファイルごとの情報入力画面には「この印刷依頼を取り消す」(このファイルだけを
// バッチから外し, 次のファイルへ進む — 残りが無くなった場合はアップロード画面
// まで戻る) を表示しています. アップロード画面のファイル一覧の各行にある
// 削除ボタン (PrintFileUploadDropzone) も同じ役割を果たします.
//
// 依頼文に組織の選択は含まれていなかったため, NewDocumentUploadSection
// (組織を選ばない) と同様こちらも組織選択を持ちません
function NewPrintRequestSection() {
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadAttempted, setUploadAttempted] = useState(false);

  const [drafts, setDrafts] = useState<DraftPrintRequestFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileSubmitAttempted, setFileSubmitAttempted] = useState(false);

  const currentDraft = drafts[currentIndex];
  const isLastFile = currentIndex === drafts.length - 1;

  const updateCurrentDraft = (
    patch: Partial<Pick<DraftPrintRequestFile, "copies" | "paperSize" | "remarks">>,
  ) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === currentDraft?.id ? { ...draft, ...patch } : draft)),
    );
  };

  const copiesError = !currentDraft?.copies ? "部数を入力してください." : undefined;

  // 全ファイル分の情報が揃って初めて (=最後のファイルの「確認する」で)
  // 送信可能になる — useRequestSubmitFlow の isValid はこのバッチ全体の
  // 検証結果を渡す
  const allDraftsValid = drafts.length > 0 && drafts.every((draft) => isDraftValid(draft));

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
    pendingMessage: "印刷を依頼しています…",
    successMessage: `${drafts.length}件のファイルの印刷依頼が完了しました.`,
  });

  const showCopiesError = fileSubmitAttempted && copiesError;

  // ファイル一式が決まった後の一覧を, ファイルごとの下書き (id/copies/
  // paperSize/remarks) に変換してファイルごとの情報入力画面へ進む
  const handleProceedToDetails = () => {
    if (pendingFiles.length === 0) {
      setUploadAttempted(true);
      return;
    }
    setDrafts(pendingFiles.map((file) => createDraftFromFile(file)));
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
    if (!currentDraft || !isDraftValid(currentDraft)) {
      setFileSubmitAttempted(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setFileSubmitAttempted(false);
  };

  // 「この印刷依頼を取り消す」— このファイルだけをバッチから外す. 外した結果,
  // まだ情報入力が済んでいないファイルが残っていれば (同じ index がそのまま
  // 次のファイルを指すようになる) そのまま続け, 1件も残らなければアップロード
  // 画面まで戻す. 取り消したファイルが末尾だった場合は, 新たに末尾になった
  // (既に入力済みの) ファイルの画面まで index を詰める
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
    label: `依頼 ${index + 1}`,
    value: `${draft.file.name} — ${draft.copies || "-"}部 / ${draft.paperSize}`,
  }));

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>印刷を依頼</h1>
      <p className={styles.subtitle}>
        複数のファイルをまとめて印刷依頼し, ファイルごとに部数/用紙寸法/備考を指定します.
      </p>

      {step === "upload" ? (
        <div>
          <div className={styles.field}>
            <span className={styles.label}>1. 印刷するファイル</span>
            <PrintFileUploadDropzone files={pendingFiles} onChange={setPendingFiles} />
            {uploadAttempted && pendingFiles.length === 0 && (
              <p className={styles.error}>印刷するファイルを選択してください.</p>
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
              <label htmlFor="print-request-copies" className={styles.label}>
                1. 部数<span className={styles.required}>*</span>
              </label>
              <span className={styles.copiesFieldWrapper}>
                <input
                  id="print-request-copies"
                  type="text"
                  inputMode="numeric"
                  value={currentDraft.copies}
                  onChange={(event) => {
                    if (!isValidNaturalNumberInput(event.target.value)) return;
                    updateCurrentDraft({ copies: event.target.value });
                  }}
                  aria-invalid={Boolean(showCopiesError)}
                  className={clsx(
                    styles.input,
                    styles.copiesField,
                    showCopiesError && styles.inputError,
                  )}
                />
                <span className={styles.copiesSuffix}>部</span>
              </span>
              {showCopiesError && <p className={styles.error}>{copiesError}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="print-request-paper-size" className={styles.label}>
                2. 用紙寸法<span className={styles.required}>*</span>
              </label>
              <PaperSizeSelectField
                id="print-request-paper-size"
                value={currentDraft.paperSize}
                onChange={(paperSize) => updateCurrentDraft({ paperSize })}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="print-request-remarks" className={styles.label}>
                3. 備考 (任意)
              </label>
              <textarea
                id="print-request-remarks"
                value={currentDraft.remarks}
                onChange={(event) => updateCurrentDraft({ remarks: event.target.value })}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <div className={styles.secondaryActions}>
                <Button type="button" variant="ghost" onClick={handleRequestCancel}>
                  入力内容を破棄
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancelCurrentFile}>
                  この印刷依頼を取り消す
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
          heading="この内容で印刷を依頼しますか?"
          confirmLabel="依頼する"
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

export { NewPrintRequestSection };
