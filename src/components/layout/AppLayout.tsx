import { Outlet } from "react-router";

import { Header } from "./Header";

// ルートを持つページ共通のレイアウト. Header は全ページで常に表示する
function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export { AppLayout };
