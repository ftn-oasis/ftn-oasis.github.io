// 実データを取得する API が無いため, ホーム画面 (~) で使うダミーデータをまとめて置く場所

import {
  getDocumentsEditedByCurrentUser,
  getInProgressTransactionsProposedByCurrentUser,
  MOCK_ORGANIZATION,
  MOCK_ORGANIZATION_DOCUMENTS,
} from "@src/features/organization/mockData";
import { DocumentVisibility } from "@src/features/organization/types";

import {
  type BroadcastMessageFeedItem,
  type DocumentAnnouncementFeedItem,
  type HomeFeedItem,
  HomeFeedItemType,
} from "./types";

// 左サイドバー用 — 自身が編集に関わった文書 (currentUser を editors に加える
// 割り当て自体は features/organization/mockData.ts 側で行っている — 編集者
// タブを開いても実際に「テストユーザー」が表示され, ここでの一覧と矛盾しない
// ようにするため). 編集日時の新しい順
const MY_EDITED_DOCUMENTS = getDocumentsEditedByCurrentUser();

// 左サイドバー用 — 自身が起案した会計処理のうち, まだ完了/却下していないもの
// (「可能ラベル」が付くものが先頭に来る並び順). getInProgressTransactionsProposedByCurrentUser
// 自体は features/organization/mockData.ts 側に定義 (currentUser の割り当てが
// そちら側で行われているため, MY_EDITED_DOCUMENTS と同じ理由で共通関数として
// 切り出している)
const MY_IN_PROGRESS_TRANSACTIONS = getInProgressTransactionsProposedByCurrentUser();

// メインのフィード用 — 公開済みの文書のうち, 編集日時が新しいものから6件を
// 「組織が文書を公開した」という発表に見立てる (実在する文書へのリンクになる)
function toDisplayDateTime(isoDate: string): string {
  return `${isoDate.replaceAll("-", "/")} 09:00`;
}

const DOCUMENT_ANNOUNCEMENT_ITEMS: DocumentAnnouncementFeedItem[] =
  MOCK_ORGANIZATION_DOCUMENTS.filter(
    (document) => document.visibility === DocumentVisibility.Public,
  )
    .sort((a, b) => (a.editedAt < b.editedAt ? 1 : -1))
    .slice(0, 6)
    .map((document, index) => ({
      id: `home-feed-document-${index + 1}`,
      type: HomeFeedItemType.DocumentAnnouncement,
      occurredAt: toDisplayDateTime(document.editedAt),
      organizationId: document.organizationId,
      organizationName: MOCK_ORGANIZATION.name,
      documentId: document.id,
      documentTitle: document.title,
      summary: document.description,
      authorName: document.authorName,
    }));

// 特定の文書/組織に紐付かない, 全体向けのお知らせ (学校全体からの連絡を想定)
const BROADCAST_MESSAGE_ITEMS: BroadcastMessageFeedItem[] = [
  {
    id: "home-feed-broadcast-1",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/18 08:30",
    senderName: "生徒会本部",
    title: "文化祭の開催日程が決定しました",
    body: "今年度の文化祭は10月17日(土)・18日(日)の2日間で開催します. 詳細は追ってお知らせします.",
  },
  {
    id: "home-feed-broadcast-2",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/15 09:00",
    senderName: "図書委員会",
    title: "夏季休業中の図書室開館時間について",
    body: "8月中の図書室は10:00〜15:00の開館です. 自習室としてもご利用いただけます.",
  },
  {
    id: "home-feed-broadcast-3",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/12 10:15",
    senderName: "保健委員会",
    title: "熱中症対策の徹底について",
    body: "気温の高い日が続いています. 水分補給と適切な休憩を心がけてください.",
  },
  {
    id: "home-feed-broadcast-4",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/10 13:00",
    senderName: "生徒会本部",
    title: "生徒会役員選挙の日程について",
    body: "次期生徒会役員選挙は9月上旬に実施予定です. 立候補者の受付は来週から開始します.",
  },
  {
    id: "home-feed-broadcast-5",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/07 11:00",
    senderName: "教務課",
    title: "避難訓練の実施について",
    body: "9月1日(火)に全校避難訓練を実施します. 詳しい集合場所は学年ごとに掲示します.",
  },
  {
    id: "home-feed-broadcast-6",
    type: HomeFeedItemType.BroadcastMessage,
    occurredAt: "2026/08/04 09:30",
    senderName: "情報委員会",
    title: "校内Wi-Fi設備の点検作業について",
    body: "8月20日(木)は校内Wi-Fiの点検作業のため, 一部エリアで利用できない時間帯があります.",
  },
];

// 文書の発表/全体向けのお知らせを日時の新しい順に混ぜて表示する
// (GitHub のダッシュボードのフィードと同じ考え方)
const MOCK_HOME_FEED_ITEMS: HomeFeedItem[] = [
  ...DOCUMENT_ANNOUNCEMENT_ITEMS,
  ...BROADCAST_MESSAGE_ITEMS,
].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

export { MOCK_HOME_FEED_ITEMS, MY_EDITED_DOCUMENTS, MY_IN_PROGRESS_TRANSACTIONS };
