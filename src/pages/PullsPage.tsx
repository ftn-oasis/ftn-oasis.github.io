import { DocumentPullRequestsSection } from "@src/features/organization/components/DocumentPullRequestsSection";
import { MOCK_DOCUMENT_PULL_REQUESTS } from "@src/features/organization/mockData";

import styles from "./PullsPage.module.css";

// ~/pulls — Header/NavDrawer の「修正提案」が指すページ. IssuesPage と
// 同じ考え方で, DocumentPullRequestsSection をそのまま再利用し, 全件
// (MOCK_DOCUMENT_PULL_REQUESTS) を渡している
function PullsPage() {
  return (
    <div className={styles.root}>
      <DocumentPullRequestsSection pullRequests={MOCK_DOCUMENT_PULL_REQUESTS} />
    </div>
  );
}

export { PullsPage };
