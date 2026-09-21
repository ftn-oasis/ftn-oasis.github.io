import { Icon } from "@src/components/ui/Icon";
import { formatDateTime, formatTime } from "@src/features/organization/calendarUtils";
import { IconCalendarTime, IconDoor } from "@tabler/icons-react";
import clsx from "clsx";

import type { RoomReservation } from "../types";

import styles from "./RoomReservationCalendarCard.module.css";

type RoomReservationCalendarCardProps = {
  reservation: RoomReservation;
  // ポップオーバーをカードの左端/右端どちらに揃えるか (MeetingCalendarCard と同じ)
  popoverAlign: "left" | "right";
  // 上段の週ではカード自体に詳細情報を直接表示する (MeetingCalendarCard と同じ)
  expanded: boolean;
};

// MeetingCalendarCard と同じ構造 (compact は "HH:mm タイトル" のみ+ホバー時の
// ポップオーバー, expanded はカード自体に詳細を常時表示) ですが, 対応する
// 詳細ページがまだ無いため <Link> ではなく tabIndex={0} の <div> にしています
// — キーボードフォーカスでもホバーと同じくポップオーバーが表示される
// (:hover/:focus-visible どちらも同じ CSS を参照する) ため, リンクで
// なくても操作性は変わりません
function RoomReservationCalendarCard({
  reservation,
  popoverAlign,
  expanded,
}: RoomReservationCalendarCardProps) {
  const startsAt = new Date(reservation.startsAt);
  const endsAt = new Date(reservation.endsAt);

  if (expanded) {
    return (
      // biome-ignore lint/a11y/noNoninteractiveTabindex: 対応する詳細ページが無くリンクにできないが, ホバーと同じ内容をキーボードフォーカスでも表示できるようにするため
      <div tabIndex={0} className={clsx(styles.card, styles.cardExpanded)}>
        <div className={styles.expandedTitleRow}>
          <span className={styles.expandedTime}>{formatTime(startsAt)}</span>
          {/* 予約名が長くて省略記号になった場合, ネイティブの title 属性で
              ホバー時に全体を見せる (MeetingCalendarCard と同じ考え方) */}
          <span className={styles.expandedTitle} title={reservation.title}>
            {reservation.title}
          </span>
        </div>
        <p className={styles.expandedPurpose}>{reservation.purpose}</p>
        <div className={styles.expandedMeta}>
          <span className={styles.expandedMetaItem}>
            <Icon icon={IconDoor} size={14} aria-hidden="true" />
            {reservation.roomName}
          </span>
        </div>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: 対応する詳細ページが無くリンクにできないが, ホバーと同じ内容をキーボードフォーカスでも表示できるようにするため
    <div tabIndex={0} className={styles.card}>
      <span className={styles.cardLabel}>
        {formatTime(startsAt)} {reservation.title}
      </span>

      <div
        className={clsx(styles.popover, popoverAlign === "right" && styles.popoverAlignRight)}
      >
        <div className={styles.popoverTitleRow}>
          <span className={styles.popoverTitle} title={reservation.title}>
            {reservation.title}
          </span>
        </div>
        <p className={styles.popoverPurpose}>{reservation.purpose}</p>
        <div className={styles.popoverMeta}>
          <span className={styles.popoverMetaItem}>
            <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
            {formatDateTime(startsAt)}〜{formatTime(endsAt)}
          </span>
          <span className={styles.popoverMetaItem}>
            <Icon icon={IconDoor} size={14} aria-hidden="true" />
            {reservation.roomName}
          </span>
        </div>
      </div>
    </div>
  );
}

export { RoomReservationCalendarCard };
