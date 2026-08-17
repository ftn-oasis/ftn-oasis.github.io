import { MOCK_DOCUMENTS } from "../mockData";
import { DocumentCard } from "./DocumentCard";

import styles from "./PinnedDocuments.module.css";

// GitHub の Pinned repositories に相当する, 文書のカード一覧
function PinnedDocuments() {
  return (
    <div className={styles.root}>
      {MOCK_DOCUMENTS.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}

export { PinnedDocuments };
