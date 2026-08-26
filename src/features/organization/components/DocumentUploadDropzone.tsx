import { Icon } from "@src/components/ui/Icon";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { type DragEvent, useRef, useState } from "react";

import styles from "./DocumentUploadDropzone.module.css";

// PDF/Markdown/テキスト/Word文書/画像 (会議の資料タブ (MeetingMaterialFileType)
// が扱う種別に画像を加えた, 文書として妥当そうな一通りの形式) — ReceiptUploadField
// の ACCEPTED_FILE_TYPES と同じ考え方
const ACCEPTED_FILE_TYPES =
  "application/pdf,text/markdown,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg";

type DocumentUploadDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

// ReceiptUploadField (証憑画像アップロード欄) と同じ構造 (ドラッグ&ドロップ+
// クリックの両方に対応したアップロード欄+選択済みファイルの一覧) の,
// 文書アップロードページ (~/documents/new/upload) 用のアップロードスペースです.
// 受け付ける形式が異なる (証憑は PDF/画像のみ, こちらは文書として妥当な
// PDF/Markdown/テキスト/Word/画像) ため, 同じコンポーネントを流用せず新規に
// しています (「機能ごとに似た構成でも別コンポーネントとして持つ」既存の方針).
// バックエンドが無いため実際のアップロードは行わず, 選択したファイルを一覧
// 表示するだけです. 各行の削除ボタンは「このファイルのアップロードを
// 取り消す」操作を兼ねます (依頼文の文言に揃えた aria-label)
function DocumentUploadDropzone({ files, onChange }: DocumentUploadDropzoneProps) {
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
        <span className={styles.dropZoneHint}>PDF, Markdown, テキスト, Word, 画像 に対応</span>
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
                aria-label={`${file.name} のアップロードを取り消す`}
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

export { DocumentUploadDropzone };
