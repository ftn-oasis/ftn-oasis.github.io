import { OrganizationDocumentsSection } from "@src/features/organization/components/OrganizationDocumentsSection";
import { MOCK_ORGANIZATION_DOCUMENTS } from "@src/features/organization/mockData";

function OrganizationDocumentsPage() {
  return (
    <OrganizationDocumentsSection
      documents={MOCK_ORGANIZATION_DOCUMENTS}
      scopedToOrganization
    />
  );
}

export { OrganizationDocumentsPage };
