// ~/materials (規則･資料) 用の型. 「文書」(features/organization/, 組織が
// 作成する文書) とは別物 (CLAUDE.md の「NavDrawer 内の...」を参照) のため,
// 組織にもドキュメント一覧にも依存しない独立した feature にしている

// erasableSyntaxOnly のため const オブジェクト + union 型で表現する
// (他の enum 相当の型と同じ)
const MaterialSectionKey = {
  Rules: "rules",
  Guides: "guides",
} as const;

type MaterialSectionKey = (typeof MaterialSectionKey)[keyof typeof MaterialSectionKey];

// ホーム (/materials) の各セクションに並ぶリンク1件 = 文書1件
type MaterialDocument = {
  key: string;
  sectionKey: MaterialSectionKey;
  title: string;
  content: string;
};

// お知らせ (ホーム下部) の1件. 対象の文書は documentKey で参照する
type MaterialChangeLogEntry = {
  id: string;
  documentKey: string;
  summary: string;
  // "YYYY/MM/DD"
  occurredAt: string;
};

export {
  type MaterialChangeLogEntry,
  type MaterialDocument,
  MaterialSectionKey,
};
