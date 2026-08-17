import { IconLink } from "@src/components/ui/IconLink";
import {
  IconCalendarTime,
  IconFileAlert,
  IconFileText,
  IconFileTextSpark,
  IconReceiptYen,
} from "@tabler/icons-react";

// Header の .right グループの中で, 画面が狭いときに真っ先に隠れる主要ナビゲーション群
// (navCollapsed のとき Header 側でまるごとレンダーしない)
function PrimaryNavLinks() {
  return (
    <>
      <IconLink to="/issues" icon={IconFileAlert} label="改善点の指摘" />
      <IconLink to="/pulls" icon={IconFileTextSpark} label="修正の提案" />
      <IconLink to="/documents" icon={IconFileText} label="全ての文書" />
      <IconLink to="/books" icon={IconReceiptYen} label="全ての会計申請" />
      <IconLink
        to="/meetings"
        icon={IconCalendarTime}
        label="予定されている会議"
      />
    </>
  );
}

export { PrimaryNavLinks };
