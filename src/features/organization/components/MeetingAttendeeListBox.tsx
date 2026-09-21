import type { OrganizationMember } from "../types";
import { MemberListRow } from "./MemberListRow";

import styles from "./MeetingAttendeeListBox.module.css";

type MeetingAttendeeListBoxProps = {
  attendees: OrganizationMember[];
};

// 出席者タブ (/orgs/:orgId/meetings/:meetingId/attendees) の本文.
// 「../../membersにあるものと同じリスト形式」という依頼のため, 構成員一覧
// (MemberListBox) と同じ行 (MemberListRow) をそのまま再利用する. 出席者は
// 会議1件あたり数人程度で並び替え/ページネーションの必要が薄いため,
// MemberListBox 自体 (ソート状態やページ切り替えフォーカスなど一覧専用の
// 複雑さを持つ) は使わず, 見出し+行の並びだけの簡潔な Box にしている
function MeetingAttendeeListBox({ attendees }: MeetingAttendeeListBoxProps) {
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{attendees.length}人の出席者</span>
      </div>

      <div>
        {attendees.map((attendee) => (
          <MemberListRow key={attendee.id} member={attendee} />
        ))}
      </div>
    </div>
  );
}

export { MeetingAttendeeListBox };
