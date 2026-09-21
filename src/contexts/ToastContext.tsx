// 画面右上に表示するトースト通知の Context. 「送信ボタンが押下されたら画面を
// 遷移してくる前の画面に戻し, 送信中であることをトーストで表示する. 送信が
// 完了したらトーストの表示を成功に変更する」(会計申請作成フォーム) という
// 依頼のため, ページ遷移をまたいでも表示され続けるようにする必要があり,
// (ページごとの state ではなく) BrowserRouter の内側 かつ Routes の外側,
// AppProviders に置くグローバルな Provider として実装している

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import { ToastList } from "@src/components/ui/ToastList";

import { type ToastItem, ToastStatus } from "./toastTypes";

type ToastContextType = {
  showToast: (message: string) => string;
  resolveToast: (id: string, message: string) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 成功表示に切り替わってからトーストを自動で消すまでの時間
const AUTO_DISMISS_MS = 4000;

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast は ToastProvider の内部で使用してください");
  }
  return context;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, status: ToastStatus.Pending }]);
    return id;
  }, []);

  const resolveToast = useCallback(
    (id: string, message: string) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, message, status: ToastStatus.Success } : toast,
        ),
      );
      window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, resolveToast, dismissToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export { ToastProvider, useToast };
