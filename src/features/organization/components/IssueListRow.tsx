import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCalendarTime, IconUser } from "@tabler/icons-react";
import { Link } from "react-router";

import { MOCK_ORGANIZATION_DOCUMENTS } from "../mockData";
import { resolveMemberId } from "../resolveMemberId";
import type { DocumentIssue } from "../types";

import styles from "./IssueListRow.module.css";

type IssueListRowProps = {
  issue: DocumentIssue;
};

// 指摘事項一覧の1行. 行全体が1つのリンク. 詳細な指摘事項自体はまだ実装
// しないため, 他の一覧行 (DocumentListRow など) と同様, リンク先はまだ
// 実ページの無い想定のルートになっている (404 のまま). タイトル (太字, 伸縮)
// + 投稿者/投稿日を右詰め2段で表示する (MeetingListRow と同じ考え方).
// リンク先の組織 ID は issue.documentId から所属文書を探して解決する —
// 「~/issues (組織を横断) と ~/orgs/組織ID/documents/文書ID/issues
// (特定の文書のみ) の両方でこの行をそのまま再利用する」ため, 呼び出し側から
// organizationId/documentId を props で渡す必要が無いようにしている
// (documentId 自体は issue.documentId と重複するため元々不要だった)
function IssueListRow({ issue }: IssueListRowProps) {
  const document = MOCK_ORGANIZATION_DOCUMENTS.find((d) => d.id === issue.documentId);

  return (
    <Link
      to={`/orgs/${document?.organizationId}/documents/${issue.documentId}/issues/${issue.id}`}
      className={styles.root}
    >
      <span className={styles.title} title={issue.title}>
        {issue.title}
      </span>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconUser} size={14} aria-hidden="true" />
          <UserNameLink
            userId={resolveMemberId(issue.posterName)}
            name={issue.posterName}
            // 行全体が既にリンクのため, <a> の入れ子 (無効な DOM) を避ける
            nested
          />
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
          {issue.postedAt}
        </span>
      </div>
    </Link>
  );
}

export { IssueListRow };
