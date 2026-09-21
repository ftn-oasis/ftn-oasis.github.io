import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled, IconPencil } from "@tabler/icons-react";
import clsx from "clsx";

// 会議作成フォーム (~/meetings/new) の「最下部に自由記述挿入可能な項目を
// 作ってほしい」という依頼のための特別な選択肢の値. MeetingSelectField の
// NEW_MEETING_OPTION_VALUE と同じ考え方で, 実在する場所名とは絶対に
// 一致しない値にしている
const CUSTOM_LOCATION_OPTION_VALUE = "__custom-location__";

type MeetingLocationSelectFieldProps = {
  id?: string;
  locations: string[];
  value: string;
  onChange: (location: string) => void;
  // true の場合だけ一覧の末尾に Divider + 自由入力への切り替え選択肢
  // (CUSTOM_LOCATION_OPTION_VALUE) を追加する. 既存の呼び出し元
  // (MeetingMinutesDocumentForm) はこの prop を渡していないため,
  // 既定の挙動 (固定の場所一覧のみ) は変わらない
  allowCustom?: boolean;
};

// 「議事録を作成」モードの場所 (部屋) 選択. OrganizationSelectField と同じ
// 土台 (selectFieldBase.module.css) を使うが, グループ/アバターの無い単純な
// 文字列の一覧のため BudgetLineItemSelectField よりさらに単純な構成
function MeetingLocationSelectField({
  id,
  locations,
  value,
  onChange,
  allowCustom = false,
}: MeetingLocationSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();
  const isCustomSelected = allowCustom && value === CUSTOM_LOCATION_OPTION_VALUE;
  const triggerLabel = isCustomSelected ? "自由入力" : value;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel} title={triggerLabel}>
            {triggerLabel}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {locations.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => {
                onChange(location);
                close();
              }}
              className={clsx(menuItemBase.root, location === value && menuItemBase.active)}
            >
              <span>{location}</span>
            </button>
          ))}
          {allowCustom && (
            <>
              <Divider />
              <button
                type="button"
                onClick={() => {
                  onChange(CUSTOM_LOCATION_OPTION_VALUE);
                  close();
                }}
                className={clsx(menuItemBase.root, isCustomSelected && menuItemBase.active)}
              >
                <Icon icon={IconPencil} size={16} aria-hidden="true" />
                <span>自由入力</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { CUSTOM_LOCATION_OPTION_VALUE, MeetingLocationSelectField };
