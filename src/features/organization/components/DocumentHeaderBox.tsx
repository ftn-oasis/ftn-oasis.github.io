import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCalendarTime, IconUser } from "@tabler/icons-react";

import { resolveMemberId } from "../resolveMemberId";
import { DocumentVisibility, type OrganizationDocument } from "../types";

import styles from "./DocumentHeaderBox.module.css";

const VISIBILITY_LABEL: Record<DocumentVisibility, string> = {
  [DocumentVisibility.Public]: "公開",
  [DocumentVisibility.Private]: "非公開",
};

type DocumentHeaderBoxProps = {
  document: OrganizationDocument;
};

// 文書詳細ページ上部の2段. MeetingHeaderBox/TransactionHeaderBox と同じ構成
// (1段目太字1.25rem+2段目メタ情報) に揃えている. 1段目は文書名 (太字)+
// 公開/非公開バッジ (DocumentCard と同じ Label, 色指定は無し), 2段目は
// 「作成者: ユーザー名」+「最終編集日時: YYYY/MM/DD HH:MM」の2項目.
// 最終編集日時は document.editedAt (画面表示を意図しない, 日付のみの
// ソート用フィールド) ではなく, 時刻まで持つ最新版 (versions の末尾) の
// editedAt を使う — DocumentOverviewSection の「編集者」欄と同じ考え方
function DocumentHeaderBox({ document }: DocumentHeaderBoxProps) {
  const latestVersion = document.versions[document.versions.length - 1];

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{document.title}</span>
        <Label>{VISIBILITY_LABEL[document.visibility]}</Label>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <Icon icon={IconUser} size={16} aria-hidden="true" />
          作成者:{" "}
          <UserNameLink
            userId={resolveMemberId(document.authorName)}
            name={document.authorName}
          />
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconCalendarTime} size={16} aria-hidden="true" />
          最終編集日時: {latestVersion.editedAt}
        </span>
      </div>
    </div>
  );
}

export { DocumentHeaderBox };
