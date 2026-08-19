import { Icon } from "@src/components/ui/Icon";
import { IconFileTypePdf, IconPhoto, IconUpload } from "@tabler/icons-react";

import { ReceiptFileType, type TransactionReceipt } from "../types";

import styles from "./TransactionReceiptBox.module.css";

const FILE_TYPE_ICON = {
  [ReceiptFileType.Image]: IconPhoto,
  [ReceiptFileType.Pdf]: IconFileTypePdf,
} as const;

const FILE_TYPE_LABEL: Record<ReceiptFileType, string> = {
  [ReceiptFileType.Image]: "画像",
  [ReceiptFileType.Pdf]: "PDF",
};

type TransactionReceiptBoxProps = {
  receipt: TransactionReceipt;
};

// 証憑タブ (/orgs/:orgId/book/:transactionId/receipt) の本文. 1項目だけの
// リストのような見た目の Box の上部に文書ID/アップロード者/アップロード日を,
// 下部に画像/PDF のプレビュー領域を表示する. 実ファイルの保存先が無いため,
// プレビューは本物らしく見せるダミー画像ではなく, それとわかるプレースホルダー
// (破線枠+ファイル種別アイコン) にしている
function TransactionReceiptBox({ receipt }: TransactionReceiptBoxProps) {
  const fileTypeIcon = FILE_TYPE_ICON[receipt.fileType];

  return (
    <div className={styles.root}>
      <div className={styles.item}>
        <span className={styles.documentId}>{receipt.documentId}</span>
        <span className={styles.meta}>
          <Icon icon={IconUpload} size={14} aria-hidden="true" />
          {receipt.uploaderName} がアップロード ・ {receipt.uploadedAt}
        </span>
      </div>

      <div className={styles.preview}>
        <Icon icon={fileTypeIcon} size={48} aria-hidden="true" />
        <span className={styles.previewLabel}>
          {FILE_TYPE_LABEL[receipt.fileType]}のプレビュー
        </span>
      </div>
    </div>
  );
}

export { TransactionReceiptBox };
