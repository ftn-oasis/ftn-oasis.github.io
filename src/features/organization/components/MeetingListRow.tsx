import { Label } from "@src/components/ui/Label";
import { Icon } from "@src/components/ui/Icon";
import { IconCalendarTime, IconDoor } from "@tabler/icons-react";
import { Link } from "react-router";

import { formatDateTime } from "../calendarUtils";
import { MeetingStatus, type OrganizationMeeting } from "../types";

import styles from "./MeetingListRow.module.css";

type MeetingListRowProps = {
  meeting: OrganizationMeeting;
};

// 会議一覧の1行. 行全体が1つのリンク. MemberListRow と同じく2行構成 —
// 中央にタイトル (太字, 延会/流会のときは横にラベル)/概要 (議題をコンマ区切り),
// 右詰めで開催日時/教室を2段で表示する
function MeetingListRow({ meeting }: MeetingListRowProps) {
  const startsAt = new Date(meeting.startsAt);

  return (
    <Link
      to={`/orgs/${meeting.organizationId}/meetings/${meeting.id}`}
      className={styles.root}
    >
      <div className={styles.info}>
        <span className={styles.titleRow}>
          <span className={styles.title} title={meeting.title}>
            {meeting.title}
          </span>
          {meeting.status === MeetingStatus.Postponed && (
            <Label color="mauve">延会</Label>
          )}
          {meeting.status === MeetingStatus.Canceled && (
            <Label color="sky">流会</Label>
          )}
        </span>
        <span
          className={styles.description}
          title={meeting.agenda.map((item) => item.label).join(", ")}
        >
          {meeting.agenda.map((item) => item.label).join(", ")}
        </span>
      </div>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
          {formatDateTime(startsAt)}
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconDoor} size={14} aria-hidden="true" />
          {meeting.location}
        </span>
      </div>
    </Link>
  );
}

export { MeetingListRow };
