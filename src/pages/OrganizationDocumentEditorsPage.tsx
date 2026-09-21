import { DocumentEditorListBox } from "@src/features/organization/components/DocumentEditorListBox";
import type { OrganizationDocument } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 編集者タブ (/orgs/:orgId/documents/:documentId/editors)
function OrganizationDocumentEditorsPage() {
  const document = useOutletContext<OrganizationDocument>();

  return <DocumentEditorListBox editors={document.editors} />;
}

export { OrganizationDocumentEditorsPage };
