import { DocumentPullRequestsSection } from "@src/features/organization/components/DocumentPullRequestsSection";
import { MOCK_DOCUMENT_PULL_REQUESTS } from "@src/features/organization/mockData";
import type { OrganizationDocument } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 修正提案タブ (/orgs/:orgId/documents/:documentId/pulls)
function OrganizationDocumentPullsPage() {
  const document = useOutletContext<OrganizationDocument>();
  const pullRequests = MOCK_DOCUMENT_PULL_REQUESTS.filter(
    (pullRequest) => pullRequest.documentId === document.id,
  );

  return <DocumentPullRequestsSection pullRequests={pullRequests} />;
}

export { OrganizationDocumentPullsPage };
