import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import { IconCalendarTime, IconDoor } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import { formatDateTime, formatTime } from "../calendarUtils";
import { MeetingStatus, type OrganizationMeeting } from "../types";

import styles from "./MeetingCalendarCard.module.css";

type MeetingCalendarCardProps = {
  meeting: OrganizationMeeting;
  // ポップオーバーをカードの左端/右端どちらに揃えるか. グリッド右寄りの列
  // (木/金/土) で左揃えのままだとポップオーバーが画面右にはみ出すため,
  // 呼び出し元 (MeetingCalendarView) が列位置に応じて渡す
  popoverAlign: "left" | "right";
  // 上段の週 (面積が大きく余裕がある) では, ホバーしなくても分かるようカード
  // 自体に詳細情報 (時刻/議題/教室) を直接表示する — 下段の週は従来通り
  // "HH:mm タイトル" のみで, ホバー時のポップオーバーで詳細を示す.
  // 延会/流会ラベルは大カード (expanded) には表示しない (依頼により)
  expanded: boolean;
};

// カレンダーモードの日付セル内に表示するカード. 既定 (compact) は
// "HH:mm 会議タイトル" のみを表示し, ホバー (またはキーボードフォーカス) すると
// リスト行と同じ情報 (ラベル/議題/開催日時/教室) を示すポップオーバーを表示する.
// expanded (上段の週) はポップオーバーを使わず, 同じ情報をカード自身に
// 直接表示する
function MeetingCalendarCard({
  meeting,
  popoverAlign,
  expanded,
}: MeetingCalendarCardProps) {
  const startsAt = new Date(meeting.startsAt);
  const statusLabel =
    meeting.status === MeetingStatus.Postponed ? (
      <Label color="mauve">延会</Label>
    ) : meeting.status === MeetingStatus.Canceled ? (
      <Label color="sky">流会</Label>
    ) : null;

  if (expanded) {
    return (
      <Link
        to={`/orgs/${meeting.organizationId}/meetings/${meeting.id}`}
        className={clsx(styles.card, styles.cardExpanded)}
      >
        <div className={styles.expandedTitleRow}>
          <span className={styles.expandedTime}>{formatTime(startsAt)}</span>
          {/* 会議名が長くて省略記号になった場合, ネイティブの title 属性で
              ホバー時に全体を見せる — カード自体の可変長データなので,
              固定の短いラベル向けの独自 CSS ツールチップ (calendarNavGroup の
              .tooltip など) ではなく, ブラウザ標準の title を使うのが単純 */}
          <span className={styles.expandedTitle} title={meeting.title}>
            {meeting.title}
          </span>
        </div>
        {meeting.agenda.length > 0 && (
          <p className={styles.expandedAgenda}>{meeting.agenda.join(", ")}</p>
        )}
        <div className={styles.expandedMeta}>
          <span className={styles.expandedMetaItem}>
            <Icon icon={IconDoor} size={14} aria-hidden="true" />
            {meeting.location}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/orgs/${meeting.organizationId}/meetings/${meeting.id}`}
      className={styles.card}
    >
      <span className={styles.cardLabel}>
        {formatTime(startsAt)} {meeting.title}
      </span>

      <div
        className={clsx(
          styles.popover,
          popoverAlign === "right" && styles.popoverAlignRight,
        )}
      >
        <div className={styles.popoverTitleRow}>
          <span className={styles.popoverTitle}>{meeting.title}</span>
          {statusLabel}
        </div>
        <p className={styles.popoverAgenda}>{meeting.agenda.join(", ")}</p>
        <div className={styles.popoverMeta}>
          <span className={styles.popoverMetaItem}>
            <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
            {formatDateTime(startsAt)}
          </span>
          <span className={styles.popoverMetaItem}>
            <Icon icon={IconDoor} size={14} aria-hidden="true" />
            {meeting.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

export { MeetingCalendarCard };
