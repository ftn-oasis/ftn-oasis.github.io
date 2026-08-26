import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { resolveMemberId } from "@src/features/organization/resolveMemberId";
import { IconUser } from "@tabler/icons-react";

import type { PrintRequest } from "../types";
import { PrintRequestStatusBadge } from "./PrintRequestStatusBadge";

import styles from "./PrintRequestListRow.module.css";

type PrintRequestListRowProps = {
  printRequest: PrintRequest;
};

// 印刷状況一覧の1行. 対応する詳細ページがまだ無いため, DocumentListRow/
// TransactionListRow と違い行全体はリンクにしていない (依頼者名だけ
// UserNameLink でプロフィールページへリンクする). TransactionListRow と
// 同じ構成 (先頭に状態バッジ (PrintRequestStatusBadge, compact)+タイトル+
// 概要, 末尾に1件だけメタ情報) を踏襲している
function PrintRequestListRow({ printRequest }: PrintRequestListRowProps) {
  return (
    <div className={styles.root}>
      <PrintRequestStatusBadge status={printRequest.status} compact className={styles.badge} />
      <span className={styles.title} title={printRequest.title}>
        {printRequest.title}
      </span>
      <span className={styles.description} title={printRequest.description}>
        {printRequest.description}
      </span>
      <span className={styles.requester}>
        <Icon icon={IconUser} size={16} aria-hidden="true" />
        <UserNameLink
          userId={resolveMemberId(printRequest.requesterName)}
          name={printRequest.requesterName}
        />
      </span>
    </div>
  );
}

export { PrintRequestListRow };
