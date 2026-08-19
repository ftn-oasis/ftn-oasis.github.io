import { MeetingMaterialsExplorer } from "@src/features/organization/components/MeetingMaterialsExplorer";
import { MOCK_ORGANIZATION_TRANSACTIONS } from "@src/features/organization/mockData";
import type { OrganizationMeeting } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 資料タブ (/orgs/:orgId/meetings/:meetingId/materials). 資料の種別が
// 会計処理の場合に埋め込み表示するため, 全会計処理 (MOCK_ORGANIZATION_TRANSACTIONS)
// も渡す
function OrganizationMeetingMaterialsPage() {
  const meeting = useOutletContext<OrganizationMeeting>();

  return (
    <MeetingMaterialsExplorer
      agenda={meeting.agenda}
      materials={meeting.materials}
      transactions={MOCK_ORGANIZATION_TRANSACTIONS}
    />
  );
}

export { OrganizationMeetingMaterialsPage };
