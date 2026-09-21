// tsconfig.app.json の erasableSyntaxOnly により実際の enum 構文は使えないため,
// const オブジェクト + そこから導出した union 型で enum 相当のものを表現する
const HomeFeedItemType = {
  DocumentAnnouncement: "document-announcement",
  BroadcastMessage: "broadcast-message",
} as const;

type HomeFeedItemType = (typeof HomeFeedItemType)[keyof typeof HomeFeedItemType];

type HomeFeedItemBase = {
  id: string;
  // "YYYY/MM/DD HH:mm"
  occurredAt: string;
};

// 組織が文書を公開した際の発表. 実在する文書 (features/organization/mockData.ts
// の MOCK_ORGANIZATION_DOCUMENTS) を参照する — Activity 系と同じ「組織/文書とは
// 分離して考える」設計のため, ID 参照 (organizationId/documentId) + 表示用に
// 必要な値を denormalize して持たせている
type DocumentAnnouncementFeedItem = HomeFeedItemBase & {
  type: typeof HomeFeedItemType.DocumentAnnouncement;
  organizationId: string;
  organizationName: string;
  documentId: string;
  documentTitle: string;
  summary: string;
  // アバターの横に表示する投稿者 (文書の作成者). OrganizationDocument.authorName
  // をそのまま denormalize したもの
  authorName: string;
};

// 特定の文書/組織に紐付かない, 全体向けのお知らせ
type BroadcastMessageFeedItem = HomeFeedItemBase & {
  type: typeof HomeFeedItemType.BroadcastMessage;
  senderName: string;
  title: string;
  body: string;
};

type HomeFeedItem = DocumentAnnouncementFeedItem | BroadcastMessageFeedItem;

export {
  type BroadcastMessageFeedItem,
  type DocumentAnnouncementFeedItem,
  type HomeFeedItem,
  HomeFeedItemType,
};
