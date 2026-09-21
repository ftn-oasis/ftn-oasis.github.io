// 「ユーザーの役職によって表示する UI を変更したいので, それぞれの役職の
// 目線から確認したい」という依頼のための, 開発/確認用のロールプレビュー
// Context です. ダミーの currentUser を複数用意する (id を切り替える) 案も
// 検討しましたが, currentUser.id は文書の editors/会議の attendees など
// 既存のモックデータのあちこちから参照されており, それらを役職ごとに
// 何セットも用意するのは手間が大きいため, 「身元 (currentUser) はそのまま,
// 役職判定にだけ使う値を差し替えられる」という, より変更量の少ない方式を
// 採用しています.
//
// **これから役職によって表示を出し分ける機能を実装する際は,
// CURRENT_USER_AS_MEMBER.role (mockData.ts, 生成時に固定された値) を直接
// 参照するのではなく, この useRolePreview() が返す previewRole を参照して
// ください** — CURRENT_USER_AS_MEMBER は文書の編集者一覧などに静的に
// 埋め込まれるデータ生成専用の値のため, ここでプレビューを切り替えても
// 追従しません (両者があえて連動していない理由はこのファイルの説明を参照).
//
// ThemeContext (テーマ設定) とは異なり, これはユーザーの実際の設定ではなく
// 確認用の一時的な切り替えのため, localStorage には永続化していません —
// ページを再読み込みすると既定の役職 (DEFAULT_MEMBER_ROLE) に戻ります.

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import { DEFAULT_MEMBER_ROLE } from "@src/features/organization/memberRole";

type RolePreviewContextType = {
  previewRole: string;
  setPreviewRole: (role: string) => void;
};

const RolePreviewContext = createContext<RolePreviewContextType | undefined>(undefined);

function useRolePreview() {
  const context = useContext(RolePreviewContext);
  if (!context) {
    throw new Error("useRolePreview は RolePreviewProvider の内部で使用してください");
  }
  return context;
}

function RolePreviewProvider({ children }: { children: ReactNode }) {
  const [previewRole, setPreviewRole] = useState(DEFAULT_MEMBER_ROLE);

  return (
    <RolePreviewContext.Provider value={{ previewRole, setPreviewRole }}>
      {children}
    </RolePreviewContext.Provider>
  );
}

export { RolePreviewProvider, useRolePreview };
