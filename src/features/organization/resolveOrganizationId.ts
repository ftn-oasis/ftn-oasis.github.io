import { MOCK_ORGANIZATIONS } from "./mockData";

// 組織名の表示箇所 (OrganizationHeaderBox の祖先組織名パンくずなど, id を
// 持たない文字列) から, プロフィールページ (/orgs/:orgId) へリンクするための
// organizationId を逆引きする. MOCK_ORGANIZATIONS (組織一覧, 28件) の名前と
// 完全一致する場合だけ解決できる — 一致しない場合 (例:
// `MOCK_ORGANIZATION.ancestorNames` の "生徒会" は一覧側の実際の名称
// "生徒会執行部" と表記が食い違っており解決できない) は undefined を返し,
// 呼び出し側 (OrgNameLink) はリンクにせずそのまま表示する
function resolveOrganizationId(name: string): string | undefined {
  return MOCK_ORGANIZATIONS.find((organization) => organization.name === name)?.id;
}

export { resolveOrganizationId };
