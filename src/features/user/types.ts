import type { OrganizationType } from "@src/features/organization/types";

// tsconfig.app.json の erasableSyntaxOnly により実際の enum 構文は使えないため,
// const オブジェクト + そこから導出した union 型で enum 相当のものを表現する
const DocumentVisibility = {
  Public: "public",
  Private: "private",
} as const;

type DocumentVisibility =
  (typeof DocumentVisibility)[keyof typeof DocumentVisibility];

type Organization = {
  id: string;
  name: string;
  // この組織におけるユーザーの役職
  role: string;
  // 「組織から有志は選択できないようにしてほしい」という依頼のため,
  // 会計申請作成フォーム (NewTransactionSection) の組織ドロップダウンで
  // OrganizationType.Volunteer の組織を除外するのに使う. features/organization/
  // の OrganizationDetail.type と同じ概念だが, こちらは所属組織一覧という
  // 簡易な用途のため必須にはしていない
  type?: OrganizationType;
  // 会計申請作成フォーム (NewTransactionSection) で, 種類「寄付」選択時に
  // 現金/銀行口座への振込のどちらかを選べるようにするかどうか. 銀行口座を
  // 持たない組織は現金一択のため, その場合は選択肢自体を表示しない
  hasBankAccount?: boolean;
};

type DocumentSummary = {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  visibility: DocumentVisibility;
  // "PDF"/"Markdown"/"Text"/"MP4" など. 種類を限定しないため string
  fileType: string;
};

export {
  DocumentVisibility,
  type DocumentSummary,
  type Organization,
};
