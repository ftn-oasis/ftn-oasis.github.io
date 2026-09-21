import { DocumentDetailTabs } from "@src/features/organization/components/DocumentDetailTabs";
import { DocumentHeaderBox } from "@src/features/organization/components/DocumentHeaderBox";
import { MOCK_ORGANIZATION_DOCUMENTS } from "@src/features/organization/mockData";
import type { OrganizationDocument } from "@src/features/organization/types";
import { Outlet, useParams } from "react-router";

import styles from "./OrganizationDocumentLayout.module.css";

// /orgs/:orgId/documents/:documentId 配下の共通レイアウト.
// OrganizationMeetingLayout/OrganizationTransactionLayout と同じ構成
// (存在チェック + 上部の要約+タブをまとめて描画し, 個々のページは本文だけを描画する)
function OrganizationDocumentLayout() {
  const { orgId, documentId } = useParams();

  const document = MOCK_ORGANIZATION_DOCUMENTS.find(
    (candidate) => candidate.id === documentId && candidate.organizationId === orgId,
  );

  if (!document) {
    return <p className={styles.notFound}>文書が見つかりません.</p>;
  }

  return (
    <div className={styles.root}>
      <DocumentHeaderBox document={document} />

      <div className={styles.tabsWrapper}>
        <DocumentDetailTabs
          organizationId={document.organizationId}
          documentId={document.id}
        />
      </div>

      <div className={styles.content}>
        <Outlet context={document satisfies OrganizationDocument} />
      </div>
    </div>
  );
}

export { OrganizationDocumentLayout };
