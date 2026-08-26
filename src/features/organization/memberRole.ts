// OrganizationMember.role (委員長/副委員長/委員) にまつわる, ドメインに依存する
// 共通のちょっとしたロジック置き場. 元は DocumentOverviewSection.tsx にだけ
// ローカルで定義されていた isAdminRole を, RolePreviewContext (src/contexts/)
// からも同じ判定を使う必要が生じたためこちらへ切り出しています

// 実際に MOCK_MEMBERS/CURRENT_USER_AS_MEMBER (mockData.ts) で使われている
// 役職の一覧. 「委員」が既定 (特別な権限を持たない) の役職で, それ以外は
// 「管理者」として扱う想定
const MEMBER_ROLES = ["委員長", "副委員長", "委員"];

const DEFAULT_MEMBER_ROLE = "委員";

// 「編集者(管理者は)」— 委員長/副委員長のような特別な役職を持つ場合だけ
// 「(管理者)」を付記する (「委員」は付記しない). DocumentOverviewSection の
// 「編集者」表示と RolePreviewContext の役職プレビュー行の両方から使う
function isAdminRole(role: string): boolean {
  return role !== DEFAULT_MEMBER_ROLE;
}

export { DEFAULT_MEMBER_ROLE, isAdminRole, MEMBER_ROLES };
