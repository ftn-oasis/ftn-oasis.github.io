import { MeetingMinutesExplorer } from "@src/features/organization/components/MeetingMinutesExplorer";
import type { OrganizationMeeting } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 議事録タブ (/orgs/:orgId/meetings/:meetingId/minutes)
function OrganizationMeetingMinutesPage() {
  const meeting = useOutletContext<OrganizationMeeting>();

  return <MeetingMinutesExplorer minutes={meeting.minutes} />;
}

export { OrganizationMeetingMinutesPage };
