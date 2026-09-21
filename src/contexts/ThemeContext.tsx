// カラーテーマを切り替えるContext

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// 実際に適用されるテーマ (data-theme 属性の値として使う)
type Theme = "light" | "dark";

// ユーザーが選んだ設定. "system" は OS の prefers-color-scheme に追従する
// 特別な値で, ヘッダーのユーザーメニューの3択トグル (ライトモード/デバイスに
// 連動/ダークモード) に対応する
const ThemePreference = {
  Light: "light",
  Dark: "dark",
  System: "system",
} as const;

type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];

type ThemeContextType = {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

// 「これらの情報を永続的に保存するようにしてほしい」という依頼のための
// localStorage キー. navigationHistoryStack.ts の "fth-oasis:nav-stack" と
// 同じ命名 (sessionStorage/localStorage を問わず "fth-oasis:" を前置する)
const STORAGE_KEY = "fth-oasis:theme-preference";

function getSystemTheme(): Theme {
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function isThemePreference(value: unknown): value is ThemePreference {
  return (
    value === ThemePreference.Light ||
    value === ThemePreference.Dark ||
    value === ThemePreference.System
  );
}

// 保存されていない/壊れている/プライベートブラウジング等で読み取れない場合は
// "system" (標準で選択されるべき既定値) にフォールバックする
function readStoredThemePreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(raw) ? raw : ThemePreference.System;
  } catch {
    return ThemePreference.System;
  }
}

function writeStoredThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // プライベートブラウジング等で保存できない場合は永続化自体を諦める
    // (navigationHistoryStack.ts の writeNavigationStack と同じ割り切り)
  }
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === ThemePreference.System ? getSystemTheme() : preference;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme は ThemeProvider の内部で使用してください");
  }
  return context;
}

function ThemeProvider({ children }: { children: ReactNode }) {
  // 初期値は保存済みの設定 (無ければ "system") — マウント時に1度だけ読む
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    readStoredThemePreference,
  );
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(themePreference));

  // src/styles/theme.css の [data-theme="light"|"dark"] セレクタが参照する属性を
  // ここで実際に <html> へ反映する (state を持つだけでは見た目に反映されない)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 「デバイスに連動」(ThemePreference.System) が選ばれている間だけ, OS の
  // テーマ設定 (prefers-color-scheme) の変化にサイトのテーマを追従させる —
  // ライト/ダークを明示的に選んでいる間はこのリスナー自体を張らない (OS 側が
  // 変化しても無関係のため)
  useEffect(() => {
    if (themePreference !== ThemePreference.System) return;

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    setTheme(resolveTheme(preference));
    writeStoredThemePreference(preference);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemePreference, ThemeProvider, useTheme };
