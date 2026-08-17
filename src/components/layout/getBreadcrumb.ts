import { currentUser } from "@src/lib/currentUser";

// これらのルートは階層が深くても1階層目だけを, 元のパス名ではなくこの表示名で示す
const SPECIAL_ROOT_LABELS: Record<string, string> = {
  settings: "設定",
  documents: "規則・資料",
  organizations: "組織",
  meetings: "会議",
  books: "帳簿",
  issues: "指摘事項",
  pulls: "修正提案",
  notifications: "通知",
};

// 表示する各階層の文字列を返す. 最後の要素が現在表示中のページ (呼び出し側でボールドにする)
function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const [first] = segments;

  if (first === currentUser.id) {
    // プロフィールページ: パス (ユーザーID) ではなくユーザー名を1階層だけ表示する
    return [currentUser.name];
  }

  const specialLabel = SPECIAL_ROOT_LABELS[first];
  if (specialLabel) {
    return [specialLabel];
  }

  return segments.slice(0, 2);
}

export { getBreadcrumb };
