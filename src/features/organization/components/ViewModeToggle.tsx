import { Icon } from "@src/components/ui/Icon";
import { IconCalendarWeek, IconMenu2 } from "@tabler/icons-react";
import clsx from "clsx";

import styles from "./ViewModeToggle.module.css";

const ViewMode = {
  Calendar: "calendar",
  List: "list",
} as const;

type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

type ViewModeToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

// カレンダー/リスト表示の切り替えトグル. 選択中の側にボタン型のオーバーレイ
// (indicator) がスライドして移動することでどちらが選択されているか示す
// (アイコン自体は常に両方表示したまま). 2つのボタンの間の分割線は, indicator
// と重なって見えづらかったため削除しました
function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className={styles.root}>
      <div
        className={clsx(
          styles.indicator,
          mode === ViewMode.List && styles.indicatorList,
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        aria-label="週間表示に切り替え"
        aria-pressed={mode === ViewMode.Calendar}
        onClick={() => onChange(ViewMode.Calendar)}
        className={styles.button}
      >
        <Icon icon={IconCalendarWeek} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="リスト表示に切り替え"
        aria-pressed={mode === ViewMode.List}
        onClick={() => onChange(ViewMode.List)}
        className={styles.button}
      >
        <Icon icon={IconMenu2} aria-hidden="true" />
      </button>
    </div>
  );
}

export { ViewMode, ViewModeToggle };
