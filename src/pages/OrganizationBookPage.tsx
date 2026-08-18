import { OrganizationBookSection } from "@src/features/organization/components/OrganizationBookSection";
import { MOCK_ORGANIZATION_TRANSACTIONS } from "@src/features/organization/mockData";

function OrganizationBookPage() {
  return (
    <OrganizationBookSection transactions={MOCK_ORGANIZATION_TRANSACTIONS} />
  );
}

export { OrganizationBookPage };
