import { MeetingAttendeeListBox } from "@src/features/organization/components/MeetingAttendeeListBox";
import type { OrganizationMeeting } from "@src/features/organization/types";
import { useOutletContext } from "react-router";

// 出席者タブ (/orgs/:orgId/meetings/:meetingId/attendees)
function OrganizationMeetingAttendeesPage() {
  const meeting = useOutletContext<OrganizationMeeting>();

  return <MeetingAttendeeListBox attendees={meeting.attendees} />;
}

export { OrganizationMeetingAttendeesPage };
