import { MeetingDetailTabs } from "@src/features/organization/components/MeetingDetailTabs";
import { MeetingHeaderBox } from "@src/features/organization/components/MeetingHeaderBox";
import { MOCK_ORGANIZATION_MEETINGS } from "@src/features/organization/mockData";
import type { OrganizationMeeting } from "@src/features/organization/types";
import { Outlet, useParams } from "react-router";

import styles from "./OrganizationMeetingLayout.module.css";

// /orgs/:orgId/meetings/:meetingId 配下の共通レイアウト.
// OrganizationTransactionLayout と同じ構成 (存在チェック + 上部の要約+タブを
// まとめて描画し, 個々のページは本文だけを描画する)
function OrganizationMeetingLayout() {
  const { orgId, meetingId } = useParams();

  const meeting = MOCK_ORGANIZATION_MEETINGS.find(
    (candidate) => candidate.id === meetingId && candidate.organizationId === orgId,
  );

  if (!meeting) {
    return <p className={styles.notFound}>会議が見つかりません.</p>;
  }

  return (
    <div className={styles.root}>
      <MeetingHeaderBox meeting={meeting} />

      <div className={styles.tabsWrapper}>
        <MeetingDetailTabs
          organizationId={meeting.organizationId}
          meetingId={meeting.id}
        />
      </div>

      <div className={styles.content}>
        <Outlet context={meeting satisfies OrganizationMeeting} />
      </div>
    </div>
  );
}

export { OrganizationMeetingLayout };
