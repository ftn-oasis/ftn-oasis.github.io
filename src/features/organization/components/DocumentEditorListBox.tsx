import type { OrganizationMember } from "../types";
import { MemberListRow } from "./MemberListRow";

import styles from "./DocumentEditorListBox.module.css";

type DocumentEditorListBoxProps = {
  editors: OrganizationMember[];
};

// 編集者タブ (/orgs/:orgId/documents/:documentId/editors) の本文.
// 「../../meetings/会議ID/membersのリストと同じものを配置してほしい」という
// 依頼のため, MeetingAttendeeListBox と全く同じ構造 (構成員一覧の行
// MemberListRow をそのまま再利用する, ソート/ページネーションは持たない
// 簡潔な Box) にしている
function DocumentEditorListBox({ editors }: DocumentEditorListBoxProps) {
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{editors.length}人の編集者</span>
      </div>

      <div>
        {editors.map((editor) => (
          <MemberListRow key={editor.id} member={editor} />
        ))}
      </div>
    </div>
  );
}

export { DocumentEditorListBox };
