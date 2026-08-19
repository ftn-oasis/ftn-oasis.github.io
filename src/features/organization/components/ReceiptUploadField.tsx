import { Icon } from "@src/components/ui/Icon";
import { IconFileTypePdf, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { type DragEvent, useRef, useState } from "react";

import styles from "./ReceiptUploadField.module.css";

// PDF + 一通りの画像形式 (「PDF, png等一通りの画像ファイル」という依頼のため)
const ACCEPTED_FILE_TYPES = "application/pdf,image/png,image/jpeg,image/gif,image/webp";

function fileIcon(file: File) {
  return file.type === "application/pdf" ? IconFileTypePdf : IconPhoto;
}

type ReceiptUploadFieldProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

// 「立替払いだった場合, ファイルをドラッグしたり押下するとファイル選択画面が
// 出現する部分を表示し, PDF, png等一通りの画像ファイルをアップロード出来る
// ようにする」という依頼のため, TransactionReceiptBox のプレースホルダーとは
// 別に, ドラッグ&ドロップ+クリックの両方に対応した実際に選択できるアップロード
// 欄を新設した. バックエンドが無いため実際のアップロード自体は行わず,
// 選択したファイルを一覧表示するだけ
function ReceiptUploadField({ files, onChange }: ReceiptUploadFieldProps) {
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
          ファイルをドラッグ＆ドロップ, またはクリックして選択
        </span>
        <span className={styles.dropZoneHint}>PDF, PNG, JPEG, GIF, WEBP に対応</span>
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

export { ReceiptUploadField };
