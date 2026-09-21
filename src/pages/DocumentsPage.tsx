import { OrganizationDocumentsSection } from "@src/features/organization/components/OrganizationDocumentsSection";
import { MOCK_ORGANIZATION_DOCUMENTS } from "@src/features/organization/mockData";

// ~/documents — Header/NavDrawer の「全ての文書」が指すページ.
// 「構造は ~/orgs/組織ID/documents のページと同じ構造とし, 内容は組織を
// 横断したものとしてほしい」という依頼のため, OrganizationDocumentsSection
// をそのまま再利用し, 特定の組織で絞り込まない全件 (MOCK_ORGANIZATION_DOCUMENTS)
// を渡している. 行ごとのリンク先 (DocumentListRow) は document.organizationId
// から自分で組織を解決するため, 組織をまたいでもリンクは正しく機能する
function DocumentsPage() {
  return <OrganizationDocumentsSection documents={MOCK_ORGANIZATION_DOCUMENTS} />;
}

export { DocumentsPage };
