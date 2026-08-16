import { useTheme } from "@src/contexts/ThemeContext";

function ToggleThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      現在: {theme === "light" ? "ライト" : "ダーク"}モード
    </button>
  );
}

export { ToggleThemeButton };
