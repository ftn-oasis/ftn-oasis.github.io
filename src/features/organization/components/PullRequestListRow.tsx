import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCalendarTime, IconUser } from "@tabler/icons-react";
import { Link } from "react-router";

import { MOCK_ORGANIZATION_DOCUMENTS } from "../mockData";
import { resolveMemberId } from "../resolveMemberId";
import type { DocumentPullRequest } from "../types";

import styles from "./PullRequestListRow.module.css";

type PullRequestListRowProps = {
  pullRequest: DocumentPullRequest;
};

// 修正提案一覧の1行. 行全体が1つのリンク. 詳細な修正提案自体はまだ実装
// しないため, 他の一覧行 (DocumentListRow など) と同様, リンク先はまだ
// 実ページの無い想定のルートになっている (404 のまま). タイトル (太字, 伸縮)
// + 投稿者/投稿日を右詰め2段で表示する (MeetingListRow と同じ考え方).
// リンク先の組織 ID は pullRequest.documentId から所属文書を探して解決する
// — IssueListRow と同じ理由 (~/pulls と ~/orgs/組織ID/documents/文書ID/pulls
// の両方でこの行を再利用するため)
function PullRequestListRow({ pullRequest }: PullRequestListRowProps) {
  const document = MOCK_ORGANIZATION_DOCUMENTS.find(
    (d) => d.id === pullRequest.documentId,
  );

  return (
    <Link
      to={`/orgs/${document?.organizationId}/documents/${pullRequest.documentId}/pulls/${pullRequest.id}`}
      className={styles.root}
    >
      <span className={styles.title} title={pullRequest.title}>
        {pullRequest.title}
      </span>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconUser} size={14} aria-hidden="true" />
          <UserNameLink
            userId={resolveMemberId(pullRequest.posterName)}
            name={pullRequest.posterName}
            // 行全体が既にリンクのため, <a> の入れ子 (無効な DOM) を避ける
            nested
          />
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
          {pullRequest.postedAt}
        </span>
      </div>
    </Link>
  );
}

export { PullRequestListRow };
