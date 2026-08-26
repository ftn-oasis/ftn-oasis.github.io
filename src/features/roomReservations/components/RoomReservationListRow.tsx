import { Icon } from "@src/components/ui/Icon";
import { formatDateTime, formatTime } from "@src/features/organization/calendarUtils";
import { IconCalendarTime, IconDoor } from "@tabler/icons-react";

import type { RoomReservation } from "../types";

import styles from "./RoomReservationListRow.module.css";

type RoomReservationListRowProps = {
  reservation: RoomReservation;
};

// 新館予約一覧の1行. MeetingListRow と同じ構成 (タイトル+概要, 右詰めで
// 日時/場所を2段) ですが, 対応する詳細ページがまだ無いため PrintRequestListRow
// と同じく行全体はリンクにしていません (<div>)
function RoomReservationListRow({ reservation }: RoomReservationListRowProps) {
  const startsAt = new Date(reservation.startsAt);
  const endsAt = new Date(reservation.endsAt);

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        <span className={styles.title} title={reservation.title}>
          {reservation.title}
        </span>
        <span className={styles.description} title={reservation.purpose}>
          {reservation.purpose}
        </span>
      </div>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
          {formatDateTime(startsAt)}〜{formatTime(endsAt)}
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconDoor} size={14} aria-hidden="true" />
          {reservation.roomName}
        </span>
      </div>
    </div>
  );
}

export { RoomReservationListRow };
