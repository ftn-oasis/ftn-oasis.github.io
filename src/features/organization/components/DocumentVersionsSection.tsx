import { useState } from "react";

import type { OrganizationDocument } from "../types";
import { DocumentContentViewer } from "./DocumentContentViewer";
import { DocumentVersionTimeline } from "./DocumentVersionTimeline";

import styles from "./DocumentVersionsSection.module.css";

type DocumentVersionsSectionProps = {
  document: OrganizationDocument;
};

// 版タブ (/orgs/:orgId/documents/:documentId/versions) の本文.
// 「タイムラインの左横に概要画面と同じビューワを配置し, その版の状態を
// 再現するようにしてほしい」という依頼のため, 選択中の版 (既定は最新版) を
// useState で管理し, タイムラインの各行をクリックすると左側のビューワの
// 表示内容が切り替わる (MeetingMinutesExplorer のサイドバー選択と同じ考え方).
// ビューワは概要タブと同じ DocumentContentViewer だが, 編集ボタンは概要
// タブ限定 (過去の版を見ているときに「編集する」は意味が通らないため) の
// ため onEdit は渡さず, 常に「問題点を指摘」「修正提案」ボタンを表示する
// (どの版を見ていても指摘・提案自体は行えるため, 概要タブと違い
// canCurrentUserEditDocument による出し分けは行わない)
function DocumentVersionsSection({ document }: DocumentVersionsSectionProps) {
  const [selectedVersionId, setSelectedVersionId] = useState(
    () => document.versions[document.versions.length - 1].id,
  );
  const selectedVersion =
    document.versions.find((version) => version.id === selectedVersionId) ??
    document.versions[document.versions.length - 1];

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
          content={selectedVersion.content}
          onReportIssue={handleReportIssue}
          onProposeEdit={handleProposeEdit}
        />
      </main>

      <aside className={styles.sidebar}>
        <DocumentVersionTimeline
          versions={document.versions}
          selectedVersionId={selectedVersionId}
          onSelect={setSelectedVersionId}
        />
      </aside>
    </div>
  );
}

export { DocumentVersionsSection };
