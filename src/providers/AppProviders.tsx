import { ReportIssueModalProvider } from "@src/contexts/ReportIssueModalContext";
import { RolePreviewProvider } from "@src/contexts/RolePreviewContext";
import { ThemeProvider } from "@src/contexts/ThemeContext";
import { ToastProvider } from "@src/contexts/ToastContext";
import { UserProfileProvider } from "@src/contexts/UserProfileContext";
import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

// BrowserRouter は App.tsx 側 (createBrowserRouter + RouterProvider) へ
// 移動した — useBlocker がデータルーターを要求するための移行 (詳細は App.tsx
// を参照). ToastProvider はルーター (= ページ遷移で再構築されるツリー) の
// 外側に置くことでページ遷移をまたいでも表示され続ける, という既存の設計は
// このままでも変わらず成立する (RouterProvider 自体がここでの Router
// 相当の役割を引き継いだだけで, 上下関係は変わっていない). ReportIssueModalProvider
// は ToastProvider の内側に置く必要がある — 中で描画する ReportIssueModal が
// useToast() を使うため. RolePreviewProvider/UserProfileProvider は他の
// Provider に依存しないため位置に制約は無いが, ThemeProvider と同じ
// 「サイト全体の見た目に関わる状態」という括りで隣に置いている
function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <RolePreviewProvider>
        <UserProfileProvider>
          <ToastProvider>
            <ReportIssueModalProvider>{children}</ReportIssueModalProvider>
          </ToastProvider>
        </UserProfileProvider>
      </RolePreviewProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
