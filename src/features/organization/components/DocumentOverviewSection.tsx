import { UserNameLink } from "@src/components/ui/UserNameLink";
import { Link } from "react-router";

import { canCurrentUserEditDocument } from "../documentViewerAccess";
import { AgendaItemVoteResult, type OrganizationDocument } from "../types";
import { DocumentContentViewer } from "./DocumentContentViewer";

import styles from "./DocumentOverviewSection.module.css";

// 「編集者(管理者は)」— 委員長/副委員長のような特別な役職を持つ編集者だけ
// 「(管理者)」を付記する (「委員」は付記しない)
function isAdminRole(role: string): boolean {
  return role !== "委員";
}

type DocumentOverviewSectionProps = {
  document: OrganizationDocument;
};

// 概要タブ (/orgs/:orgId/documents/:documentId, index route) の本文.
// 「GitHubのリポジトリのページを参考に」という依頼のため, 左をメインの資料,
// 右を資料の情報 (OrganizationOverviewSection と同じ 3fr/1fr の列比率) に
// 分割している. メインは DocumentContentViewer (概要/版タブで共通) —
// 「閲覧権限のみ・議決されている場合 (管理・編集権限があっても議決された
// ものはこれを表示): 問題点を指摘・修正提案のボタン, 管理・編集権限があり
// 議決されたものでない場合: 編集ボタン」という依頼のため,
// canCurrentUserEditDocument (documentViewerAccess.ts) の判定結果に応じて
// onEdit か onReportIssue/onProposeEdit のどちらかだけを渡す
function DocumentOverviewSection({ document }: DocumentOverviewSectionProps) {
  const latestVersion = document.versions[document.versions.length - 1];
  const canEdit = canCurrentUserEditDocument(document);

  const handleEdit = () => {
    // 編集ボタンの動作はのちほど実装する
  };

  const handleReportIssue = () => {
    // 問題点を指摘ボタンの動作はのちほど実装する
  };

  const handleProposeEdit = () => {
    // 修正提案ボタンの動作はのちほど実装する
  };

  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <DocumentContentViewer
          fileType={document.fileType}
          title={document.title}
          content={latestVersion.content}
          onEdit={canEdit ? handleEdit : undefined}
          onReportIssue={canEdit ? undefined : handleReportIssue}
          onProposeEdit={canEdit ? undefined : handleProposeEdit}
        />
      </main>

      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>資料の情報</h2>
        <dl className={styles.metaList}>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>作成日時</dt>
            <dd className={styles.metaValue}>{document.createdAt}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>版</dt>
            <dd className={styles.metaValue}>第{document.versions.length}版</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>編集者</dt>
            <dd className={styles.metaValue}>
              <UserNameLink
                userId={latestVersion.editor.id}
                name={latestVersion.editor.name}
              />
              {isAdminRole(latestVersion.editor.role) && " (管理者)"}
            </dd>
          </div>
          {document.resolution && (
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>議決</dt>
              <dd className={styles.metaValue}>
                <Link
                  to={`/orgs/${document.organizationId}/meetings/${document.resolution.meetingId}`}
                  className={styles.resolutionLink}
                >
                  {document.resolution.meetingTitle}
                </Link>
                にて「{document.resolution.agendaLabel}」が
                {document.resolution.voteResult === AgendaItemVoteResult.Approved
                  ? "可決"
                  : "否決"}
                されました
              </dd>
            </div>
          )}
        </dl>
      </aside>
    </div>
  );
}

export { DocumentOverviewSection };
