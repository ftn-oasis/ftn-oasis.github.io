import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

import { readNavigationStack, writeNavigationStack } from "./navigationHistoryStack";

// SPA 内の遷移パス履歴を sessionStorage へ記録し続ける (navigationHistoryStack.ts
// を参照). AppLayout (全ページ共通のレイアウト) から1度だけ呼び出す想定
function useNavigationHistoryTracking(): void {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const stack = readNavigationStack();
    const pathname = location.pathname;

    if (navigationType === "PUSH") {
      stack.push(pathname);
    } else if (navigationType === "REPLACE") {
      if (stack.length > 0) {
        stack[stack.length - 1] = pathname;
      } else {
        stack.push(pathname);
      }
    } else {
      // POP (戻る/進む) — 履歴中に同じパスが見つかればそこまで切り詰め
      // (戻る操作とみなす), 見つからなければ (このタブでの追跡開始前に
      // 読み込まれていたページへの遷移など) 新規のエントリとして積む
      const index = stack.lastIndexOf(pathname);
      if (index !== -1) {
        stack.length = index + 1;
      } else {
        stack.push(pathname);
      }
    }

    writeNavigationStack(stack);
  }, [location.pathname, navigationType]);
}

export { useNavigationHistoryTracking };
