import { Icon } from "@src/components/ui/Icon";
import { IconFileTypePdf, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { type DragEvent, useRef, useState } from "react";

import styles from "./ReportIssueFileUploadField.module.css";

// スクリーンショット+PDF (ログの書き出しなど) — ReceiptUploadField の
// ACCEPTED_FILE_TYPES と同じ考え方
const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,image/gif,image/webp,application/pdf";

function fileIcon(file: File) {
  return file.type === "application/pdf" ? IconFileTypePdf : IconPhoto;
}

type ReportIssueFileUploadFieldProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

// 「問題を報告」モーダルのファイルアップロード欄 (任意). ReceiptUploadField
// (証憑画像アップロード欄) と同じ構造 (ドラッグ&ドロップ+クリックの両方に
// 対応したアップロード欄+選択済みファイルの一覧) ですが, 受け付ける形式・
// 用途が異なるため, 同じコンポーネントを流用せず新規にしています (「機能ごとに
// 似た構成でも別コンポーネントとして持つ」既存の方針). バックエンドが無いため
// 実際のアップロードは行わず, 選択したファイルを一覧表示するだけです
function ReportIssueFileUploadField({ files, onChange }: ReportIssueFileUploadFieldProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    onChange([...files, ...Array.from(newFiles)]);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={clsx(styles.dropZone, isDragActive && styles.dropZoneActive)}
      >
        <Icon icon={IconUpload} size={24} aria-hidden="true" className={styles.uploadIcon} />
        <span className={styles.dropZoneText}>
          ファイルをドラッグ＆ドロップ, またはクリックして選択
        </span>
        <span className={styles.dropZoneHint}>PNG, JPEG, GIF, WEBP, PDF に対応</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
        className={styles.hiddenInput}
      />

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: File 自体に安定した ID が無いため
            <li key={index} className={styles.fileItem}>
              <Icon icon={fileIcon(file)} size={18} aria-hidden="true" />
              <span className={styles.fileName} title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                aria-label={`${file.name} を削除`}
                onClick={() => removeFile(index)}
                className={styles.removeButton}
              >
                <Icon icon={IconX} size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { ReportIssueFileUploadField };
