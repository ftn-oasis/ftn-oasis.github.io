import { Avater } from "@src/components/ui/Avatar";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import type { OrganizationDocument } from "@src/features/organization/types";
import clsx from "clsx";
import { Link } from "react-router";

import styles from "./HomeEditedDocumentItem.module.css";

type HomeEditedDocumentItemProps = {
  document: OrganizationDocument;
};

// 左サイドバー「編集した文書」の1行. 文書の組織アバター+文書名+最終編集日時を
// 1つのリンクにまとめる (OrganizationListItem と同じ, menuItemBase を直接
// <Link> に適用するパターン)
function HomeEditedDocumentItem({ document }: HomeEditedDocumentItemProps) {
  return (
    <Link
      to={`/orgs/${document.organizationId}/documents/${document.id}`}
      className={clsx(menuItemBase.root, styles.root)}
    >
      <Avater shape="square" size={20} />
      <div className={styles.text}>
        <div className={styles.title} title={document.title}>
          {document.title}
        </div>
        <div className={styles.editedAt} title={`${document.editedAt.replaceAll("-", "/")} に編集`}>
          {document.editedAt.replaceAll("-", "/")} に編集
        </div>
      </div>
    </Link>
  );
}

export { HomeEditedDocumentItem };
