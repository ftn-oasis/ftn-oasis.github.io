import { useEffect, useRef } from "react";

import type {
  MeetingSortDirection,
  MeetingSortField,
  OrganizationMeeting,
} from "../types";
import { MeetingListRow } from "./MeetingListRow";
import { MeetingSortDropdown } from "./MeetingSortDropdown";

import styles from "./MeetingListBox.module.css";

type MeetingListBoxProps = {
  meetings: OrganizationMeeting[];
  totalCount: number;
  sortField: MeetingSortField;
  sortDirection: MeetingSortDirection;
  onSortChange: (field: MeetingSortField, direction: MeetingSortDirection) => void;
  page: number;
};

// GitHub のリポジトリ一覧風の Box. DocumentListBox/TransactionListBox/MemberListBox
// と同じ構造 (ページ切り替え時の自動フォーカス, 矢印キーでの行移動を含む).
// ページネーションは Box の外 (OrganizationMeetingsSection 側) で上下に配置する
function MeetingListBox({
  meetings,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: MeetingListBoxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);

  // キーボード操作でページを変えても一覧の内容が変わったことに気付けるよう,
  // ページ切り替え時は一覧自体にフォーカスを移す (:focus-visible の青枠が
  // 目印になる). 初回マウント時は前回値と同じなので対象外.
  // 一覧自体は tabIndex={-1} (Tab の通常の移動順には含めず, この
  // useEffect からの .focus() でのみプログラム的にフォーカスされる) にしている
  useEffect(() => {
    if (previousPageRef.current !== page) {
      listRef.current?.focus();
    }
    previousPageRef.current = page;
  }, [page]);

  // 一覧内の行 (リンク) にフォーカスがある間は上下矢印キーで前後の行へ,
  // 一覧自体 (行以外) にフォーカスがある間は下矢印で一番下の行, 上矢印で
  // 一番上の行へフォーカスを移動する
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const rows = Array.from(event.currentTarget.querySelectorAll("a"));
    if (rows.length === 0) return;

    const currentIndex = rows.indexOf(document.activeElement as HTMLAnchorElement);

    event.preventDefault();

    if (currentIndex === -1) {
      const edgeIndex = event.key === "ArrowDown" ? rows.length - 1 : 0;
      rows[edgeIndex]?.focus();
      return;
    }

    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(currentIndex + 1, rows.length - 1)
        : Math.max(currentIndex - 1, 0);
    rows[nextIndex]?.focus();
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{totalCount}件の会議</span>
        <MeetingSortDropdown
          field={sortField}
          direction={sortDirection}
          onChange={onSortChange}
        />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        aria-label="会議一覧"
        onKeyDown={handleKeyDown}
      >
        {meetings.map((meeting) => (
          <MeetingListRow key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </div>
  );
}

export { MeetingListBox };
