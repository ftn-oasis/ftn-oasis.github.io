import { useRolePreview } from "@src/contexts/RolePreviewContext";
import { MEMBER_ROLES } from "@src/features/organization/memberRole";
import clsx from "clsx";

import styles from "./RolePreviewToggle.module.css";

// ユーザーメニュー内の役職プレビュー切り替え. ThemePreferenceToggle と同じ
// 「選択中の側にボタン型のオーバーレイがスライドする」3択トグルですが,
// アイコンではなく役職名のテキストを並べるため, インジケーターの幅/位置は
// (ThemePreferenceToggle と同じく) パーセンテージ計算にして, 3項目均等の
// 幅に自動で収まるようにしています (RolePreviewToggle.module.css 参照)
function RolePreviewToggle() {
  const { previewRole, setPreviewRole } = useRolePreview();
  const selectedIndex = MEMBER_ROLES.indexOf(previewRole);

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
      {MEMBER_ROLES.map((role) => (
        <button
          key={role}
          type="button"
          aria-pressed={previewRole === role}
          onClick={() => setPreviewRole(role)}
          className={styles.button}
        >
          {role}
        </button>
      ))}
    </div>
  );
}

export { RolePreviewToggle };
