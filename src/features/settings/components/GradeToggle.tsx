import { useUserProfile } from "@src/contexts/UserProfileContext";
import clsx from "clsx";

import styles from "./GradeToggle.module.css";

const GRADE_OPTIONS = [1, 2, 3];

// ~/settings (利用者) の学年変更 UI. RolePreviewToggle と同じ「選択中の側に
// ボタン型のオーバーレイがスライドする」3択トグルです (「機能ごとに似た構成
// でも別コンポーネントとして持つ」既存の方針のため RolePreviewToggle 自体は
// 変更していません). 選択すると即座に反映・保存されるため, 他の作成フォームの
// ような送信/確認ボタンは持ちません
function GradeToggle() {
  const { grade, setGrade } = useUserProfile();
  const selectedIndex = GRADE_OPTIONS.indexOf(grade);

  return (
    <div className={styles.root}>
      <div
        className={clsx(
          styles.indicator,
          selectedIndex === 1 && styles.indicatorMiddle,
          selectedIndex === 2 && styles.indicatorLast,
        )}
        aria-hidden="true"
      />
      {GRADE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={grade === option}
          onClick={() => setGrade(option)}
          className={styles.button}
        >
          {option}年
        </button>
      ))}
    </div>
  );
}

export { GradeToggle };
