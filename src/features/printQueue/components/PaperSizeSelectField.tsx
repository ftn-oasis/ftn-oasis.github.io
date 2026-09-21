import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";

import { PAPER_SIZE_OPTIONS, type PaperSize } from "../types";

type PaperSizeSelectFieldProps = {
  id?: string;
  value: PaperSize;
  onChange: (paperSize: PaperSize) => void;
};

// ~/print-queue/new (印刷を依頼) の用紙寸法ドロップダウン. グループ/アバターの
// 無い単純な固定選択肢一覧のため, MeetingLocationSelectField (allowCustom
// 無しの場合) と同じ構成です — 「フォームにドロップダウンを追加する際は
// ネイティブ <select> ではなく selectFieldBase ベースのカスタムポップオーバーを
// 検討する」という既定方針のため, ネイティブ <select> にはしていません
function PaperSizeSelectField({ id, value, onChange }: PaperSizeSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel}>{value}</span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {PAPER_SIZE_OPTIONS.map((paperSize) => (
            <button
              key={paperSize}
              type="button"
              onClick={() => {
                onChange(paperSize);
                close();
              }}
              className={clsx(menuItemBase.root, paperSize === value && menuItemBase.active)}
            >
              <span>{paperSize}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { PaperSizeSelectField };
