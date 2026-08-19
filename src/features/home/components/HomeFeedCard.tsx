import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import { OrgNameLink } from "@src/components/ui/OrgNameLink";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { resolveMemberId } from "@src/features/organization/resolveMemberId";
import {
  IconBuilding,
  IconFileText,
  IconFileTextFilled,
  IconSpeakerphone,
} from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import {
  type BroadcastMessageFeedItem,
  type DocumentAnnouncementFeedItem,
  type HomeFeedItem,
  HomeFeedItemType,
} from "../types";

import styles from "./HomeFeedCard.module.css";

// アバター右下の種別バッジ (~16x16px, 塗り潰し円+アイコン). お知らせ (青,
// IconSpeakerphone)/文書の作成・公開・変更 (緑, IconFileTextFilled) の2種類
function HomeFeedCardAvatar({ isDocumentAnnouncement }: { isDocumentAnnouncement: boolean }) {
  return (
    <span className={styles.avatarWrapper}>
      <Avater shape="square" size={40} />
      <span
        className={clsx(
          styles.badge,
          isDocumentAnnouncement ? styles.badgeDocument : styles.badgeBroadcast,
        )}
      >
        <Icon
          icon={isDocumentAnnouncement ? IconFileTextFilled : IconSpeakerphone}
          size={10}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}

type DocumentAnnouncementBodyProps = {
  item: DocumentAnnouncementFeedItem;
};

function DocumentAnnouncementBody({ item }: DocumentAnnouncementBodyProps) {
  return (
    <>
      <div className={styles.title}>
        <Icon icon={IconFileText} size={18} aria-hidden="true" className={styles.titleIcon} />
        <Link
          to={`/orgs/${item.organizationId}/documents/${item.documentId}`}
          className={styles.titleLink}
        >
          {item.documentTitle}
        </Link>
      </div>
      <p className={styles.summary}>{item.summary}</p>
      <Link to={`/orgs/${item.organizationId}`} className={styles.orgLink}>
        <Icon icon={IconBuilding} size={14} aria-hidden="true" />
        {item.organizationName}
      </Link>
    </>
  );
}

type BroadcastMessageBodyProps = {
  item: BroadcastMessageFeedItem;
};

function BroadcastMessageBody({ item }: BroadcastMessageBodyProps) {
  return (
    <>
      <div className={styles.title}>{item.title}</div>
      <p className={styles.summary}>{item.body}</p>
    </>
  );
}

type HomeFeedCardProps = {
  item: HomeFeedItem;
};

// フィードの1件. GitHub のダッシュボードフィードを参考に, ヘッダー (アイコン+
// 発信元+日時) の下に本文を並べる. 組織の文書の発表 (DocumentAnnouncementBody,
// 実在する文書/組織へのリンク) と全体向けのお知らせ (BroadcastMessageBody,
// リンク無し) を type ごとに出し分ける (ActivityCard と同じ考え方)
function HomeFeedCard({ item }: HomeFeedCardProps) {
  // 投稿者 (アバターの横に表示する個人名) — 文書の発表は文書の作成者, 全体向け
  // お知らせは送信元 (部署/委員会など, 個人を指さないため resolveMemberId は
  // undefined を返し UserNameLink がリンクにせずそのまま表示する)
  const posterName =
    item.type === HomeFeedItemType.DocumentAnnouncement
      ? item.authorName
      : item.senderName;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <HomeFeedCardAvatar
          isDocumentAnnouncement={item.type === HomeFeedItemType.DocumentAnnouncement}
        />
        <UserNameLink
          userId={resolveMemberId(posterName)}
          name={posterName}
          className={styles.posterName}
        />
        <span
          className={styles.headerLabel}
          title={
            item.type === HomeFeedItemType.DocumentAnnouncement
              ? `${item.organizationName}が文書を公開しました`
              : item.senderName
          }
        >
          {item.type === HomeFeedItemType.DocumentAnnouncement ? (
            <>
              <OrgNameLink
                organizationId={item.organizationId}
                name={item.organizationName}
              />
              が文書を公開しました
            </>
          ) : (
            item.senderName
          )}
        </span>
        <span className={styles.timestamp}>{item.occurredAt}</span>
      </div>

      {item.type === HomeFeedItemType.DocumentAnnouncement ? (
        <DocumentAnnouncementBody item={item} />
      ) : (
        <BroadcastMessageBody item={item} />
      )}
    </div>
  );
}

export { HomeFeedCard };
