import { useRef, useState } from "react";

type TooltipAlign = "center" | "left" | "right";

// ツールチップ本体 (CSS の ::after) は実 DOM 要素ではなく計測できないため,
// aria-label の文字数からおおよその幅を見積もって画面端との衝突を判定する
const CHAR_WIDTH_PX = 13;
const HORIZONTAL_PADDING_PX = 16;
const VIEWPORT_MARGIN_PX = 8;

function useTooltipAlign<T extends HTMLElement>(label: string) {
  const ref = useRef<T>(null);
  const [align, setAlign] = useState<TooltipAlign>("center");

  const updateAlign = () => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const halfTooltipWidth =
      (label.length * CHAR_WIDTH_PX + HORIZONTAL_PADDING_PX) / 2;

    if (centerX - halfTooltipWidth < VIEWPORT_MARGIN_PX) {
      setAlign("left");
    } else if (
      centerX + halfTooltipWidth >
      window.innerWidth - VIEWPORT_MARGIN_PX
    ) {
      setAlign("right");
    } else {
      setAlign("center");
    }
  };

  return { ref, align, onMouseEnter: updateAlign, onFocus: updateAlign };
}

export { useTooltipAlign };
