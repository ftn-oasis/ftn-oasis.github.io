import { readNavigationStack } from "@src/lib/navigationHistoryStack";
import { useCallback } from "react";
import { useNavigate } from "react-router";

// 作成画面のパス一覧 — 「入力内容を破棄」した際, 遡った先がさらに作成画面
// ならその前まで戻るかどうかの判定 (下記) に使う. **新しい作成画面
// (useRequestSubmitFlow を使うページ) を追加したら, 必ずここにも追加して
// ください** — 登録し忘れると, その画面単体から破棄した場合でも
// (末尾のパスがこの一覧に無いと steps の計算が最初の1周で 0 になり)
// 常にホームへフォールバックしてしまいます (実際に `/orgs/new` の追加時に
// この登録を忘れて踏んだ不具合です)
const CREATION_PAGE_PATHS = [
  "/documents/new",
  "/documents/new/upload",
  "/book/new",
  "/orgs/new",
  "/meetings/new",
  "/print-queue/new",
  "/equipment-loans/new",
  "/room-reservations/new",
];

function isCreationPagePath(pathname: string): boolean {
  return CREATION_PAGE_PATHS.includes(pathname);
}

// 「入力内容を破棄」時の "元の画面に戻る" 処理 (useRequestSubmitFlow.ts が
// 送信完了/破棄の両方で使う). 単純な navigate(-1) ではなく, 遡った先がさらに
// 作成画面であればその前まで連続して遡る — ヘッダーの「作成」ドロップダウン
// から, ある作成画面 (まだ何も入力していない) → 別の作成画面, と連続して
// 遷移した後に後者へ入力してから離脱するようなケースを想定している.
// useNavigationHistoryTracking (src/lib/) が sessionStorage へ追跡している
// 遷移履歴を参照する — 追跡できていない (直接この URL を開いた場合など) 場合は
// ホームへフォールバックする
function useNavigateBackPastCreationPages() {
  const navigate = useNavigate();

  return useCallback(() => {
    const stack = readNavigationStack();

    let steps = 0;
    for (let i = stack.length - 1; i >= 0 && isCreationPagePath(stack[i]); i--) {
      steps++;
    }

    if (steps === 0 || steps >= stack.length) {
      navigate("/");
      return;
    }

    navigate(-steps);
  }, [navigate]);
}

export { isCreationPagePath, useNavigateBackPastCreationPages };
