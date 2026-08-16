import { useEffect } from "react";

// active な間だけ Escape キーで onEscape を呼ぶ. NavDrawer と useDismissablePopover の
// 両方から使われる (前者は外側クリックの代わりにオーバーレイ要素を使うため, 共通化するのは
// Escape 部分だけ)
function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}

export { useEscapeKey };
