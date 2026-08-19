import { MeetingAgendaList } from "@src/features/organization/components/MeetingAgendaList";
import type { OrganizationMeeting } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 議題タブ (/orgs/:orgId/meetings/:meetingId, index route)
function OrganizationMeetingAgendaPage() {
  const meeting = useOutletContext<OrganizationMeeting>();

  return (
    <MeetingAgendaList
      agenda={meeting.agenda}
      materials={meeting.materials}
      organizationId={meeting.organizationId}
      meetingId={meeting.id}
    />
  );
}

export { OrganizationMeetingAgendaPage };
