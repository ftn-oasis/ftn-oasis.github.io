import { OrganizationMembersSection } from "@src/features/organization/components/OrganizationMembersSection";
import { MOCK_MEMBERS } from "@src/features/organization/mockData";

function OrganizationMembersPage() {
  return <OrganizationMembersSection members={MOCK_MEMBERS} />;
}

export { OrganizationMembersPage };
