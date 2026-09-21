import { DocumentVersionsSection } from "@src/features/organization/components/DocumentVersionsSection";
import type { OrganizationDocument } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 版タブ (/orgs/:orgId/documents/:documentId/versions)
function OrganizationDocumentVersionsPage() {
  const document = useOutletContext<OrganizationDocument>();

  return <DocumentVersionsSection document={document} />;
}

export { OrganizationDocumentVersionsPage };
