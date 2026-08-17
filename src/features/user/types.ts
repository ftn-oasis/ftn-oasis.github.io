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
  // 直近の編集者. 無い場合はカードに表示しない
  lastEditedBy?: string;
};

export {
  DocumentVisibility,
  type DocumentSummary,
  type Organization,
};
