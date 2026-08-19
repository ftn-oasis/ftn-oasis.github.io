import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import { IconDoor, IconUsers } from "@tabler/icons-react";

import { formatDateTime } from "../calendarUtils";
import { MeetingStatus, type OrganizationMeeting } from "../types";

import styles from "./MeetingHeaderBox.module.css";

type MeetingHeaderBoxProps = {
  meeting: OrganizationMeeting;
};

// 会議詳細ページ上部の2段. 会計処理詳細ページの TransactionHeaderBox と
// 同じ構成 (1段目太字1.25rem+2段目メタ情報) に揃えている. 1段目は会議名
// (太字)+開催日時 (subtext, regular), 2段目は状態ラベル (延会/流会,
// MeetingListRow と同じ Label — 通常は何も表示しない)+開催場所+出席者数
function MeetingHeaderBox({ meeting }: MeetingHeaderBoxProps) {
  const startsAt = new Date(meeting.startsAt);

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{meeting.title}</span>
        <span className={styles.dateTime}>{formatDateTime(startsAt)}</span>
      </div>

      <div className={styles.metaRow}>
        {meeting.status === MeetingStatus.Postponed && (
          <Label color="mauve">延会</Label>
        )}
        {meeting.status === MeetingStatus.Canceled && <Label color="sky">流会</Label>}
        <span className={styles.metaItem}>
          <Icon icon={IconDoor} size={16} aria-hidden="true" />
          {meeting.location}
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconUsers} size={16} aria-hidden="true" />
          出席者{meeting.attendees.length}人
        </span>
      </div>
    </div>
  );
}

export { MeetingHeaderBox };
