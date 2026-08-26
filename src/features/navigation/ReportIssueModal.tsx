import { Button } from "@src/components/ui/Button";
import { Dialog } from "@src/components/ui/Dialog";
import { useToast } from "@src/contexts/ToastContext";
import requestFormStyles from "@src/features/organization/components/requestFormBase.module.css";
import clsx from "clsx";
import { type FormEvent, useState } from "react";

import { ReportIssueFileUploadField } from "./ReportIssueFileUploadField";

import styles from "./ReportIssueModal.module.css";

// 送信 (ダミー) が完了するまでの時間 — useRequestSubmitFlow.ts の
// SUBMIT_DELAY_MS と同じ値
const SUBMIT_DELAY_MS = 1500;

type ReportIssueModalProps = {
  onClose: () => void;
};

// CreateButton の「問題を報告」(元は「サイトの問題点を指摘」というリンク無し
// ボタンでしたが, 今回の依頼で改称+実装) と, NavDrawer の「問題を報告」
// (元々ボタンはあったが onClick が未設定だった) の両方から開く, サイトの
// 問題点を報告するためのモーダルです. 会計申請作成フォームなどの「専用ページ+
// useRequestSubmitFlow (離脱ガード付き)」とは異なり, どのページからでも
// 開けるグローバルなモーダルという性質のため, ページ遷移を前提にした
// useRequestSubmitFlow/useNavigateBackPastCreationPages は使わず, この
// コンポーネント単体で完結する軽量な実装にしています — 依頼文どおり
// ボタンは「入力内容を破棄」/「送信」の2つのみで, 他の作成フォームのような
// 確認画面 (RequestConfirmDialog) や破棄確認 (DiscardConfirmDialog) の
// 2段階は挟んでいません (依頼文がその2ボタンだけを明示していたため, 意図的に
// 単純な構成にしています — 離脱ガードが無いため, タブを閉じる/リロードする
// 場合の beforeunload 確認もありません).
//
// 開閉状態はどこからでもトリガーできるよう ReportIssueModalContext
// (src/contexts/) がグローバルに保持しており, このコンポーネント自体は
// isOpen 時にそこから描画される (onClose を渡されるだけの) 中身です.
function ReportIssueModal({ onClose }: ReportIssueModalProps) {
  const { showToast, resolveToast } = useToast();
  const [description, setDescription] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const trimmedDescription = description.trim();
  const descriptionError = !trimmedDescription
    ? "問題の具体的な説明を入力してください."
    : undefined;
  const showDescriptionError = (descriptionTouched || submitAttempted) && descriptionError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (descriptionError) return;

    // 「入力内容を確認して送信された場合はモーダルを隠して元の画面を表示する」
    // という依頼どおり, 送信 (ダミー) を開始した時点で即座にモーダルを閉じる
    // — 実際の送信処理 (API 呼び出し) はまだ無いため, 他の作成フォームと同じ
    // ダミーの遅延の後にトーストを成功表示へ切り替えるだけに留めている
    const toastId = showToast("問題を報告しています…");
    onClose();
    window.setTimeout(() => {
      resolveToast(toastId, "問題の報告が完了しました.");
    }, SUBMIT_DELAY_MS);
  };

  // 「入力内容を破棄」— 他の作成フォームの handleDiscard と同じく, 待つ処理の
  // 無い即時完了の操作のため showToast を経由せず resolveToast を直接呼んで
  // 完了状態のトーストを即座に表示する
  const handleDiscard = () => {
    const toastId = showToast("キャンセルしました");
    resolveToast(toastId, "キャンセルしました");
    onClose();
  };

  return (
    <Dialog onClose={handleDiscard} labelledBy="report-issue-heading">
      <h2 id="report-issue-heading" className={styles.heading}>
        問題を報告
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <label htmlFor="report-issue-description" className={requestFormStyles.label}>
            1. 問題の具体的な説明<span className={requestFormStyles.required}>*</span>
          </label>
          <textarea
            id="report-issue-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => setDescriptionTouched(true)}
            aria-invalid={Boolean(showDescriptionError)}
            className={clsx(
              requestFormStyles.textarea,
              showDescriptionError && requestFormStyles.inputError,
            )}
          />
          {showDescriptionError && <p className={requestFormStyles.error}>{descriptionError}</p>}
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>2. ファイルのアップロード (任意)</span>
          <ReportIssueFileUploadField files={files} onChange={setFiles} />
        </div>

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleDiscard}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            送信する
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export { ReportIssueModal };
