import { IconButton } from "@src/components/ui/IconButton";
import { IconFileAlert, IconFileTextSpark, IconPencil } from "@tabler/icons-react";

type DocumentViewerActionsProps = {
  onEdit?: () => void;
  onReportIssue?: () => void;
  onProposeEdit?: () => void;
};

// 文書のビューワ (MarkdownFileViewer のツールバー/DocumentContentViewer の
// Text・PDF・MP4 プレビューの見出し) 共通の操作ボタン. 「閲覧権限のみ・
// 議決されている場合 (管理・編集権限があっても議決されたものはこれを表示):
// 問題点を指摘 (IconFileAlert)・修正提案 (IconFileTextSpark) のボタン,
// 管理・編集権限があり議決されたものでない場合: 編集 (IconPencil) ボタン」
// という依頼のため. どちらを表示するかは呼び出し側 (DocumentOverviewSection/
// DocumentVersionsSection, canCurrentUserEditDocument@documentViewerAccess.ts
// を参照) が判定し, 該当するハンドラーだけを渡す想定 (onEdit と
// onReportIssue/onProposeEdit が同時に渡されることは無い)
function DocumentViewerActions({
  onEdit,
  onReportIssue,
  onProposeEdit,
}: DocumentViewerActionsProps) {
  return (
    <>
      {onEdit && <IconButton icon={IconPencil} label="編集する" onClick={onEdit} />}
      {onReportIssue && (
        <IconButton icon={IconFileAlert} label="問題点を指摘" onClick={onReportIssue} />
      )}
      {onProposeEdit && (
        <IconButton icon={IconFileTextSpark} label="修正提案" onClick={onProposeEdit} />
      )}
    </>
  );
}

export { DocumentViewerActions };
