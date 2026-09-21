import { Icon } from "@src/components/ui/Icon";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { type DragEvent, useRef, useState } from "react";

import styles from "./PrintFileUploadDropzone.module.css";

// PDF/Word文書/画像 — 印刷対象として妥当そうな形式 (DocumentUploadDropzone の
// ACCEPTED_FILE_TYPES から, 印刷物としてはあまり想定されない Markdown/
// プレーンテキストを除いたもの)
const ACCEPTED_FILE_TYPES =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg";

type PrintFileUploadDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

// DocumentUploadDropzone (~/documents/new/upload) と同じ構造 (ドラッグ&ドロップ+
// クリックの両方に対応したアップロード欄+選択済みファイルの一覧) の,
// 印刷依頼ページ (~/print-queue/new) 用のアップロードスペースです. 受け付ける
// 形式が異なるため, 同じコンポーネントを流用せず新規にしています (「機能ごとに
// 似た構成でも別コンポーネントとして持つ」既存の方針). バックエンドが無いため
// 実際のアップロードは行わず, 選択したファイルを一覧表示するだけです
function PrintFileUploadDropzone({ files, onChange }: PrintFileUploadDropzoneProps) {
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
        <Icon icon={IconUpload} size={28} aria-hidden="true" className={styles.uploadIcon} />
        <span className={styles.dropZoneText}>
          ファイルをドラッグ＆ドロップ, またはクリックして選択 (複数選択可)
        </span>
        <span className={styles.dropZoneHint}>PDF, Word, 画像 に対応</span>
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
              <Icon icon={IconFile} size={18} aria-hidden="true" />
              <span className={styles.fileName} title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                aria-label={`${file.name} を印刷対象から取り消す`}
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

export { PrintFileUploadDropzone };
