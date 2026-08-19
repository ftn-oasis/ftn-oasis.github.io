import { Icon } from "@src/components/ui/Icon";
import {
  IconFile,
  IconFileText,
  IconFileTypePdf,
  IconVideo,
  type TablerIcon,
} from "@tabler/icons-react";

import { MarkdownFileViewer } from "./MarkdownFileViewer";

import styles from "./DocumentContentViewer.module.css";

const FILE_ICON: Record<string, TablerIcon> = {
  PDF: IconFileTypePdf,
  MP4: IconVideo,
};

type DocumentContentViewerProps = {
  fileType: string;
  title: string;
  content?: string;
  // 指定すると Markdown の場合だけ MarkdownFileViewer に編集ボタンを渡す
  onEdit?: () => void;
};

// 概要タブ/版タブで共通して使う, 文書の中身のプレビュー. 「タイムラインの
// 左横に概要画面と同じビューワを配置し」という依頼のため, DocumentOverviewSection/
// DocumentVersionsSection の両方から呼び出す共通コンポーネントとして切り出している.
// fileType に応じて Markdown → MarkdownFileViewer (プレビュー/ソース切り替え),
// Text → 等幅プレビュー, それ以外 (PDF/MP4) → プレースホルダー, を出し分ける
// (MeetingMaterialsExplorer と同じ考え方)
function DocumentContentViewer({
  fileType,
  title,
  content,
  onEdit,
}: DocumentContentViewerProps) {
  if (fileType === "Markdown") {
    return (
      <MarkdownFileViewer source={content ?? ""} title={`${title}.md`} onEdit={onEdit} />
    );
  }

  if (fileType === "Text") {
    return (
      <>
        <h2 className={styles.fileName}>
          <Icon icon={IconFileText} size={20} aria-hidden="true" />
          {title}
        </h2>
        <pre className={styles.textPreview}>{content}</pre>
      </>
    );
  }

  const icon = FILE_ICON[fileType] ?? IconFile;
  return (
    <>
      <h2 className={styles.fileName}>
        <Icon icon={icon} size={20} aria-hidden="true" />
        {title}
      </h2>
      <div className={styles.preview}>
        <Icon icon={icon} size={48} aria-hidden="true" />
        <span className={styles.previewLabel}>{fileType}のプレビュー</span>
      </div>
    </>
  );
}

export { DocumentContentViewer };
