// カラーテーマを切り替えるContext

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): Theme {
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme は ThemeProvider の内部で使用してください");
  }
  return context;
}

function ThemeProvider({ children }: { children: ReactNode; }) {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);
  // toggleTheme で手動切り替えされた後は, OS 側のテーマ変更に追従させない
  // (永続化はまだ無いので, この「手動優先」はページを再読み込みするまでの間だけ有効)
  const hasManualOverrideRef = useRef(false);

  // src/styles/theme.css の [data-theme="light"|"dark"] セレクタが参照する属性を
  // ここで実際に <html> へ反映する (state を持つだけでは見た目に反映されない)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // OS のテーマ設定 (prefers-color-scheme) が変わったら, 自動でサイトのテーマに追従させる
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasManualOverrideRef.current) return;
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    hasManualOverrideRef.current = true;
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, useTheme };
