// 「問題を報告」モーダルの開閉状態を持つ Context. CreateButton (Header 内)/
// NavDrawer のどちらからでも同じモーダルを開けるようにする必要があり,
// この2つはツリー上の共通の祖先が離れているため, ToastContext と同じ考え方で
// グローバルな Provider として実装している (「ページ遷移をまたいでも表示され
// 続ける」必要は無いが, 「離れた場所にある複数のトリガーから同じ1つのモーダルを
// 開けるようにする」という要件は同じ形で解決できる)

import { ReportIssueModal } from "@src/features/navigation/ReportIssueModal";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

type ReportIssueModalContextType = {
  openReportIssueModal: () => void;
};

const ReportIssueModalContext = createContext<ReportIssueModalContextType | undefined>(undefined);

function useReportIssueModal() {
  const context = useContext(ReportIssueModalContext);
  if (!context) {
    throw new Error("useReportIssueModal は ReportIssueModalProvider の内部で使用してください");
  }
  return context;
}

function ReportIssueModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openReportIssueModal = useCallback(() => setIsOpen(true), []);
  const closeReportIssueModal = useCallback(() => setIsOpen(false), []);

  return (
    <ReportIssueModalContext.Provider value={{ openReportIssueModal }}>
      {children}
      {isOpen && <ReportIssueModal onClose={closeReportIssueModal} />}
    </ReportIssueModalContext.Provider>
  );
}

export { ReportIssueModalProvider, useReportIssueModal };
