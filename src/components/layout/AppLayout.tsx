import { useNavigationHistoryTracking } from "@src/lib/useNavigationHistoryTracking";
import { Outlet } from "react-router";

import { Header } from "./Header";
import { HeaderBottomSlotProvider } from "./HeaderBottomSlotContext";

// ルートを持つページ共通のレイアウト. Header は全ページで常に表示する.
// Header と Outlet は兄弟要素なので, ページ側 (Outlet の中身) が HeaderBottomPortal
// で Header 内部のスロットへ描画できるよう, HeaderBottomSlotProvider で両方を包む
// (詳細は HeaderBottomSlotContext.tsx を参照). 全ページ共通で通る唯一の場所
// のため, 作成画面の離脱ガードが使う遷移履歴の追跡 (useNavigationHistoryTracking)
// もここで1度だけ呼び出す
function AppLayout() {
  useNavigationHistoryTracking();

  return (
    <HeaderBottomSlotProvider>
      <Header />
      <Outlet />
    </HeaderBottomSlotProvider>
  );
}

export { AppLayout };
