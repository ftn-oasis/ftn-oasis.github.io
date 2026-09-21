// Header.tsx が内部に持つ「下部ヘッダー」のスロット (DOM ノード) を共有する Context.
// Header と <Outlet /> は AppLayout 上で兄弟要素のため, ページ側から Header の内部へ
// props で直接渡すことができない — スロットの DOM ノードだけをここで共有し,
// 実際の中身は HeaderBottomPortal (createPortal) で描画する.

import { createContext, type ReactNode, useContext, useState } from "react";

type HeaderBottomSlot = {
  slot: HTMLDivElement | null;
  setSlot: (node: HTMLDivElement | null) => void;
};

const HeaderBottomSlotContext = createContext<HeaderBottomSlot | undefined>(
  undefined,
);

function useHeaderBottomSlot() {
  const context = useContext(HeaderBottomSlotContext);
  if (!context) {
    throw new Error(
      "useHeaderBottomSlot は HeaderBottomSlotProvider の内部で使用してください",
    );
  }
  return context;
}

function HeaderBottomSlotProvider({ children }: { children: ReactNode; }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <HeaderBottomSlotContext.Provider value={{ slot, setSlot }}>
      {children}
    </HeaderBottomSlotContext.Provider>
  );
}

export { HeaderBottomSlotProvider, useHeaderBottomSlot };
