import { Icon } from "@src/components/ui/Icon";
import { OrgNameLink } from "@src/components/ui/OrgNameLink";
import { resolveOrganizationId } from "@src/features/organization/resolveOrganizationId";
import { IconBuilding, IconCalendarTime } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import type { Notification } from "../types";

import styles from "./NotificationListRow.module.css";

type NotificationListRowProps = {
  notification: Notification;
};

// 通知一覧の1行. 行全体が1つのリンク (対象ページへ). IssueListRow/
// PullRequestListRow と同じ構成 (タイトル+送信元/日時を右詰め2段) に加え,
// 「既読/未読の区別も追加してほしい」という依頼のため, 未読のときだけ
// 左にドット (.unreadDot) を置きタイトルを太字にする (既読は通常の太さ)
function NotificationListRow({ notification }: NotificationListRowProps) {
  return (
    <Link to={notification.targetUrl} className={styles.root}>
      <span
        className={clsx(styles.unreadDot, !notification.read && styles.unreadDotVisible)}
        aria-hidden="true"
      />
      <span
        className={clsx(styles.title, !notification.read && styles.titleUnread)}
        title={notification.title}
      >
        {notification.title}
      </span>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconBuilding} size={14} aria-hidden="true" />
          <OrgNameLink
            organizationId={resolveOrganizationId(notification.senderName)}
            name={notification.senderName}
            nested
          />
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
          {notification.occurredAt}
        </span>
      </div>
    </Link>
  );
}

export { NotificationListRow };
