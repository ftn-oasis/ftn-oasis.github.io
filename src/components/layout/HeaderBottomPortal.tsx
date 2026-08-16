import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { useHeaderBottomSlot } from "./HeaderBottomSlotContext";

type HeaderBottomPortalProps = {
  children: ReactNode;
};

// ページ側の内容 (ProfileTabs など) を, グローバルヘッダー (Header.tsx) 内部の
// スロットへポータルする. これにより DOM 上でも <header> の内側に含まれるようになり,
// 下部の内容があってもなくてもヘッダーが一体に見える.
function HeaderBottomPortal({ children }: HeaderBottomPortalProps) {
  const { slot } = useHeaderBottomSlot();

  if (!slot) return null;

  return createPortal(children, slot);
}

export { HeaderBottomPortal };
