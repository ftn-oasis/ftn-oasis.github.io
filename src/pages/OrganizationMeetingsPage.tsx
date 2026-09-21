import { OrganizationMeetingsSection } from "@src/features/organization/components/OrganizationMeetingsSection";
import { MOCK_ORGANIZATION_MEETINGS } from "@src/features/organization/mockData";

function OrganizationMeetingsPage() {
  return (
    <OrganizationMeetingsSection
      meetings={MOCK_ORGANIZATION_MEETINGS}
      scopedToOrganization
    />
  );
}

export { OrganizationMeetingsPage };
