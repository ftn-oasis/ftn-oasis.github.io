import { useCallback, useEffect, useRef, useState } from "react";

import { useEscapeKey } from "./useEscapeKey";

// CreateButton / UserMenuButton のような「トリガーの直下に浮くパネル」の開閉状態と,
// 範囲外クリック・Escape での自動クローズをまとめた共通フック
function useDismissablePopover<T extends HTMLElement>() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<T>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEscapeKey(open, close);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open, close]);

  return { open, wrapperRef, toggle, close };
}

export { useDismissablePopover };
