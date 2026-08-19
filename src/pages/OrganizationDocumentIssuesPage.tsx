import { DocumentIssuesSection } from "@src/features/organization/components/DocumentIssuesSection";
import { MOCK_DOCUMENT_ISSUES } from "@src/features/organization/mockData";
import type { OrganizationDocument } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 指摘事項タブ (/orgs/:orgId/documents/:documentId/issues)
function OrganizationDocumentIssuesPage() {
  const document = useOutletContext<OrganizationDocument>();
  const issues = MOCK_DOCUMENT_ISSUES.filter((issue) => issue.documentId === document.id);

  return <DocumentIssuesSection issues={issues} />;
}

export { OrganizationDocumentIssuesPage };
