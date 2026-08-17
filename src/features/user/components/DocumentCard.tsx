import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import {
  IconBuilding,
  IconFile,
  IconFileText,
  IconPencil,
} from "@tabler/icons-react";
import { Link } from "react-router";

import { DocumentVisibility, type DocumentSummary } from "../types";

import styles from "./DocumentCard.module.css";

const VISIBILITY_LABEL: Record<DocumentVisibility, string> = {
  [DocumentVisibility.Public]: "公開",
  [DocumentVisibility.Private]: "非公開",
};

type DocumentCardProps = {
  document: DocumentSummary;
};

// GitHub の Pinned repositories のカードに相当. リンク先の文書ページ自体は
// まだ無いため, 組織に属する文書として /:organizationId/:documentId の形にしている
function DocumentCard({ document }: DocumentCardProps) {
  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <Icon
          icon={IconFileText}
          size={20}
          aria-hidden="true"
          className={styles.titleIcon}
        />
        <Link
          to={`/orgs/${document.organizationId}/documents/${document.id}`}
          className={styles.title}
        >
          {document.title}
        </Link>
        <Label>{VISIBILITY_LABEL[document.visibility]}</Label>
      </div>

      <p className={styles.description}>{document.description}</p>

      <div className={styles.meta}>
        <div className={styles.metaGroup}>
          <Icon icon={IconBuilding} size={16} aria-hidden="true" />
          <Link
            to={`/orgs/${document.organizationId}`}
            className={styles.organizationLink}
          >
            {document.organizationName}
          </Link>
        </div>
        <div className={styles.metaGroup}>
          <Icon icon={IconFile} size={16} aria-hidden="true" />
          <span>{document.fileType}</span>
        </div>
        {document.lastEditedBy && (
          <div className={styles.metaGroup}>
            <Icon icon={IconPencil} size={16} aria-hidden="true" />
            <span>{document.lastEditedBy}が編集</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { DocumentCard };
