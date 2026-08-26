import { Icon } from "@src/components/ui/Icon";
import { ThemePreference, useTheme } from "@src/contexts/ThemeContext";
import { IconDeviceImac, IconMoon, IconSun, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

import styles from "./ThemePreferenceToggle.module.css";

const OPTIONS: { value: ThemePreference; icon: TablerIcon; label: string }[] = [
  { value: ThemePreference.Light, icon: IconSun, label: "ライトモード" },
  { value: ThemePreference.System, icon: IconDeviceImac, label: "デバイスに連動" },
  { value: ThemePreference.Dark, icon: IconMoon, label: "ダークモード" },
];

// ヘッダーのユーザーメニュー内の「外観」項目 (元は /settings/theme への
// リンクでしたが, 依頼により削除し代わりにこれを配置しています) — 「見た目は
// ~/meetings のモード切替ボタン (ViewModeToggle) としてほしい」という依頼の
// ため, 選択中の側にボタン型のオーバーレイ (indicator) がスライドする同じ
// 仕組みを, 2択ではなく3択 (ライト/デバイスに連動/ダーク) に拡張した並行
// コンポーネントです (「機能ごとに似た構成でも別コンポーネントとして持つ」
// 既存の方針のため ViewModeToggle 自体は変更していません). ツールチップは
// aria-label を CSS の ::after で表示する ViewModeToggle と同じ仕組みです
function ThemePreferenceToggle() {
  const { themePreference, setThemePreference } = useTheme();
  const selectedIndex = OPTIONS.findIndex((option) => option.value === themePreference);

  return (
    <div className={styles.root}>
      <div
        className={clsx(
          styles.indicator,
          selectedIndex === 1 && styles.indicatorSystem,
          selectedIndex === 2 && styles.indicatorDark,
        )}
        aria-hidden="true"
      />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          aria-pressed={themePreference === option.value}
          onClick={() => setThemePreference(option.value)}
          className={styles.button}
        >
          <Icon icon={option.icon} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export { ThemePreferenceToggle };
