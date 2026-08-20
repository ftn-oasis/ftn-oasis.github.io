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

// ホーム (/materials) の各セクションに並ぶリンク1件 = 文書1件. 「文書の入れ子
// 構造」に対応するため, 親文書の key を parentKey として持たせている
// (undefined = そのセクション直下の最上位の文書). 子を持つ文書の多くは
// (会則･協定･資料2のように) それ自身も独立した内容を持つ文書だが, 単なる
// グルーピングのためだけの節目 (内容を持たない, 「グループ1」のような例)
// も許容するため content は任意にしている — content が無い場合, サイドバー
// のアイコンは IconFolder/IconFolderOpen になり, そのリンクは自分自身では
// なく最初の (内容を持つ) 子文書を指す (`resolveDisplayableDocument`
// @mockData.ts を参照)
type MaterialDocument = {
  key: string;
  sectionKey: MaterialSectionKey;
  parentKey?: string;
  title: string;
  content?: string;
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
