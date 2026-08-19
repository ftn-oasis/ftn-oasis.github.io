import { DocumentIssuesSection } from "@src/features/organization/components/DocumentIssuesSection";
import { MOCK_DOCUMENT_ISSUES } from "@src/features/organization/mockData";

import styles from "./IssuesPage.module.css";

// ~/issues — Header/NavDrawer の「指摘事項」が指すページ.
// 「構造は ~/orgs/組織ID/documents/文書ID/issues と同じ構造とし, 内容は
// 組織を横断したものとしてほしい」という依頼のため, DocumentIssuesSection
// をそのまま再利用し, 特定の文書で絞り込まない全件 (MOCK_DOCUMENT_ISSUES)
// を渡している. DocumentIssuesSection 自身は (documents/:documentId 配下に
// ネストされる想定のため) max-width を持たないので, 単独のトップレベル
// ページとして中央寄せするための wrapper をここに持たせている
function IssuesPage() {
  return (
    <div className={styles.root}>
      <DocumentIssuesSection issues={MOCK_DOCUMENT_ISSUES} />
    </div>
  );
}

export { IssuesPage };
