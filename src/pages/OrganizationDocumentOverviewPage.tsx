import { DocumentOverviewSection } from "@src/features/organization/components/DocumentOverviewSection";
import type { OrganizationDocument } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 概要タブ (/orgs/:orgId/documents/:documentId, index route)
function OrganizationDocumentOverviewPage() {
  const document = useOutletContext<OrganizationDocument>();

  return <DocumentOverviewSection document={document} />;
}

export { OrganizationDocumentOverviewPage };
