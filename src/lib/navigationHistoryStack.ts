// このタブ内で SPA が遷移してきたパスの履歴. ブラウザの実際の history
// スタックの中身はセキュリティ上の制約で読み取れないため, useNavigationHistoryTracking
// (このファイルと対になるトラッカー, AppLayout から呼び出す) が代わりに
// sessionStorage へ自前で追跡している. 「作成画面から離脱する際, 元の画面が
// さらに作成画面ならその前まで戻る」(features/organization/useNavigateBackPastCreationPages.ts)
// のような, 特定の機能に紐付かない汎用の下回りのためここ (src/lib/) に置いている.
// sessionStorage を使うのは, タブを閉じるまでは保持しつつ (リロードにも耐える)
// 他のタブとは共有しない (実際のブラウザ history もタブごとに独立している) ため
const STORAGE_KEY = "fth-oasis:nav-stack";

function readNavigationStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function writeNavigationStack(stack: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch {
    // プライベートブラウジング等で保存できない場合は追跡自体を諦める
  }
}

export { readNavigationStack, writeNavigationStack };
