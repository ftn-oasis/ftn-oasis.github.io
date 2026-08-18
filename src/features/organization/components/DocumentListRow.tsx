import { Icon } from "@src/components/ui/Icon";
import { IconFile } from "@tabler/icons-react";
import { Link } from "react-router";

import type { OrganizationDocument } from "../types";

import styles from "./DocumentListRow.module.css";

type DocumentListRowProps = {
  document: OrganizationDocument;
};

// 文書一覧の1行. 行全体が1つのリンク
function DocumentListRow({ document }: DocumentListRowProps) {
  return (
    <Link
      to={`/orgs/${document.organizationId}/documents/${document.id}`}
      className={styles.root}
    >
      <span className={styles.title}>{document.title}</span>
      <span className={styles.description}>{document.description}</span>
      <span className={styles.fileType}>
        <Icon icon={IconFile} size={16} aria-hidden="true" />
        {document.fileType}
      </span>
    </Link>
  );
}

export { DocumentListRow };
