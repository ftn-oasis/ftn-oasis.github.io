// 実データを取得する API が無いため, 通知ページ用のダミーデータをまとめて置く場所.
// 文書/会議/入出金それぞれ実在する組織のデータ (features/organization/mockData.ts)
// を参照し, 対象ページへの実際のリンクとして機能するようにしている
// (EmbeddedTransactionView が実在する会計処理を参照するのと同じ考え方)

import {
  MOCK_ORGANIZATION,
  MOCK_ORGANIZATION_DOCUMENTS,
  MOCK_ORGANIZATION_MEETINGS,
  MOCK_ORGANIZATION_TRANSACTIONS,
} from "@src/features/organization/mockData";

import type { Notification } from "./types";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

// 会議一覧 (MEETING_ANCHOR@organization/mockData.ts) と同じ考え方で, 実行時の
// 実際の日付を起点にしている (固定の過去日付ではなく, 「最近の通知」として
// 常に新しく見えるようにするため)
function formatRecentTime(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// 3件に1件を未読にする (全件既読/全件未読だと見た目の確認にならないため)
function isUnread(index: number): boolean {
  return index % 3 === 0;
}

function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  let index = 0;

  for (const document of MOCK_ORGANIZATION_DOCUMENTS.slice(0, 15)) {
    notifications.push({
      id: `notification-document-${document.id}`,
      title: `「${document.title}」が更新されました`,
      senderName: MOCK_ORGANIZATION.name,
      occurredAt: formatRecentTime(index, 9 + (index % 8), index % 2 === 0 ? 0 : 30),
      read: !isUnread(index),
      targetUrl: `/orgs/${document.organizationId}/documents/${document.id}`,
    });
    index++;
  }

  for (const meeting of MOCK_ORGANIZATION_MEETINGS.slice(0, 15)) {
    notifications.push({
      id: `notification-meeting-${meeting.id}`,
      title: `会議「${meeting.title}」が開催予定です`,
      senderName: MOCK_ORGANIZATION.name,
      occurredAt: formatRecentTime(index, 9 + (index % 8), index % 2 === 0 ? 0 : 30),
      read: !isUnread(index),
      targetUrl: `/orgs/${meeting.organizationId}/meetings/${meeting.id}`,
    });
    index++;
  }

  for (const transaction of MOCK_ORGANIZATION_TRANSACTIONS.slice(0, 15)) {
    notifications.push({
      id: `notification-transaction-${transaction.id}`,
      title: `「${transaction.description}」の状態が変更されました`,
      senderName: MOCK_ORGANIZATION.name,
      occurredAt: formatRecentTime(index, 9 + (index % 8), index % 2 === 0 ? 0 : 30),
      read: !isUnread(index),
      targetUrl: `/orgs/${transaction.organizationId}/book/${transaction.id}`,
    });
    index++;
  }

  return notifications;
}

const MOCK_NOTIFICATIONS: Notification[] = generateNotifications();

export { MOCK_NOTIFICATIONS };
