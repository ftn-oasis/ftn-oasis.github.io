import { OrgsSection } from "@src/features/organization/components/OrgsSection";
import { MOCK_ORGANIZATIONS } from "@src/features/organization/mockData";

// ~/orgs — NavDrawer の「組織一覧」が指すページ. 「./組織ID/documents を
// 参考にしてほしい」という依頼のため OrgsSection (OrganizationDocumentsSection
// と同じ構造) をそのまま描画する
function OrgsPage() {
  return <OrgsSection organizations={MOCK_ORGANIZATIONS} />;
}

export { OrgsPage };
