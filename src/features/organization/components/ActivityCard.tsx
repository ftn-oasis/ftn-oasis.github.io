import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import {
  IconCalendar,
  IconCalendarWeek,
  IconCreditCard,
  IconDoor,
  IconFileText,
  IconMessages,
  IconUserQuestion,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { resolveMemberId } from "../resolveMemberId";
import {
  type Activity,
  ActivityType,
  type DocumentChangeActivity,
  type MeetingCreatedActivity,
  type MoneyTransactionActivity,
} from "../types";

import styles from "./ActivityCard.module.css";

// 一覧の項目数がこれ以上のとき, 末尾を省略して代わりに「詳しく見る」を出す
const READ_MORE_THRESHOLD = 5;

type ReadMoreLinkProps = {
  to: string;
};

function ReadMoreLink({ to }: ReadMoreLinkProps) {
  return (
    <Link to={to} className={styles.readMore}>
      詳しく見る
    </Link>
  );
}

type MeetingActivityBodyProps = {
  activity: MeetingCreatedActivity;
};

function MeetingActivityBody({ activity }: MeetingActivityBodyProps) {
  return (
    <>
      <div className={styles.heading}>
        <Icon icon={IconCalendarWeek} size={20} aria-hidden="true" />
        <span>{activity.meetingName}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.metaGroup}>
          <Icon icon={IconCalendar} size={16} aria-hidden="true" />
          日時:{" "}
          <span className={styles.metaValue}>
            {activity.startsAt} - {activity.endsAt}
          </span>
        </span>
        <span className={styles.metaGroup}>
          <Icon icon={IconDoor} size={16} aria-hidden="true" />
          開催場所: <span className={styles.metaValue}>{activity.location}</span>
        </span>
        <span className={styles.metaGroup}>
          <Icon icon={IconUserQuestion} size={16} aria-hidden="true" />
          出席者: <span className={styles.metaValue}>{activity.attendees}</span>
        </span>
      </div>
      {activity.agenda.length === 1 ? (
        <div className={styles.fieldRow}>
          <Icon icon={IconMessages} size={16} aria-hidden="true" />
          議題: <span className={styles.metaValue}>{activity.agenda[0]}</span>
        </div>
      ) : (
        <div className={styles.fieldRow}>
          <Icon icon={IconMessages} size={16} aria-hidden="true" />
          議題:
        </div>
      )}
      {activity.agenda.length > 1 && (
        <ul className={styles.list}>
          {activity.agenda
            .slice(0, READ_MORE_THRESHOLD)
            .map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
      {activity.agenda.length >= READ_MORE_THRESHOLD && (
        <ReadMoreLink to={`/orgs/${activity.organizationId}/meetings/${activity.meetingId}`} />
      )}
    </>
  );
}

type MoneyActivityBodyProps = {
  activity: MoneyTransactionActivity;
};

function MoneyActivityBody({ activity }: MoneyActivityBodyProps) {
  const label = activity.amount >= 0 ? "収入" : "支出";

  return (
    <>
      <div className={styles.heading}>
        <Icon icon={IconCreditCard} size={20} aria-hidden="true" />
        <span>
          {label}: {Math.abs(activity.amount)}円
        </span>
      </div>
      <ul className={styles.list}>
        {activity.items
          .slice(0, READ_MORE_THRESHOLD)
          .map((item) => <li key={item}>{item}</li>)}
      </ul>
      {activity.items.length >= READ_MORE_THRESHOLD && (
        <ReadMoreLink
          to={`/orgs/${activity.organizationId}/book/${activity.transactionId}`}
        />
      )}
    </>
  );
}

type DocumentActivityBodyProps = {
  activity: DocumentChangeActivity;
};

function DocumentActivityBody({ activity }: DocumentActivityBodyProps) {
  return (
    <>
      <div className={styles.heading}>
        <Icon icon={IconFileText} size={20} aria-hidden="true" />
        <span>{activity.documentTitle}</span>
      </div>
      <ul className={styles.list}>
        {activity.changes
          .slice(0, READ_MORE_THRESHOLD)
          .map((item) => <li key={item}>{item}</li>)}
      </ul>
      {activity.changes.length >= READ_MORE_THRESHOLD && (
        <ReadMoreLink
          to={`/orgs/${activity.organizationId}/documents/${activity.documentId}/versions/${activity.versionId}`}
        />
      )}
    </>
  );
}

type ActivityCardProps = {
  activity: Activity;
};

// 「直近の動向」の1件分. ユーザーアバター+名前+日時の共通ヘッダーの下に,
// activity.type ごとに異なる本文を並べる
function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Avater size={40} />
        <div className={styles.headerText}>
          <UserNameLink
            userId={resolveMemberId(activity.actorName)}
            name={activity.actorName}
            className={styles.actorName}
          />
          <span className={styles.timestamp}>{activity.occurredAt}</span>
        </div>
      </div>

      {activity.type === ActivityType.MeetingCreated && (
        <MeetingActivityBody activity={activity} />
      )}
      {activity.type === ActivityType.MoneyTransaction && (
        <MoneyActivityBody activity={activity} />
      )}
      {activity.type === ActivityType.DocumentChange && (
        <DocumentActivityBody activity={activity} />
      )}
    </div>
  );
}

export { ActivityCard };
