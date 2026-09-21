import { useEffect, useRef } from "react";

import type {
  DocumentSortDirection,
  DocumentSortField,
  OrganizationDocument,
} from "../types";
import { DocumentListRow } from "./DocumentListRow";
import { DocumentSortDropdown } from "./DocumentSortDropdown";

import styles from "./DocumentListBox.module.css";

type DocumentListBoxProps = {
  documents: OrganizationDocument[];
  totalCount: number;
  sortField: DocumentSortField;
  sortDirection: DocumentSortDirection;
  onSortChange: (
    field: DocumentSortField,
    direction: DocumentSortDirection,
  ) => void;
  page: number;
};

// GitHub のリポジトリ一覧風の Box. ページネーションは Box の外
// (OrganizationDocumentsSection 側) で上下に配置する
function DocumentListBox({
  documents,
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  page,
}: DocumentListBoxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);

  // キーボード操作でページを変えても一覧の内容が変わったことに気付けるよう,
  // ページ切り替え時は一覧自体にフォーカスを移す (:focus-visible の青枠が
  // 目印になる). 初回マウント時は前回値と同じなので対象外.
  // 一覧自体は tabIndex={-1} (Tab の通常の移動順には含めず, この
  // useEffect からの .focus() でのみプログラム的にフォーカスされる) にしている
  useEffect(() => {
    if (previousPageRef.current !== page) {
      listRef.current?.focus();
    }
    previousPageRef.current = page;
  }, [page]);

  // 一覧内の行 (リンク) にフォーカスがある間は上下矢印キーで前後の行へ,
  // 一覧自体 (行以外) にフォーカスがある間は下矢印で一番下の行, 上矢印で
  // 一番上の行へフォーカスを移動する
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const rows = Array.from(event.currentTarget.querySelectorAll("a"));
    if (rows.length === 0) return;

    const currentIndex = rows.indexOf(document.activeElement as HTMLAnchorElement);

    event.preventDefault();

    if (currentIndex === -1) {
      const edgeIndex = event.key === "ArrowDown" ? rows.length - 1 : 0;
      rows[edgeIndex]?.focus();
      return;
    }

    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(currentIndex + 1, rows.length - 1)
        : Math.max(currentIndex - 1, 0);
    rows[nextIndex]?.focus();
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{totalCount}本の文書</span>
        <DocumentSortDropdown
          field={sortField}
          direction={sortDirection}
          onChange={onSortChange}
        />
      </div>

      <div
        ref={listRef}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        aria-label="文書一覧"
        onKeyDown={handleKeyDown}
      >
        {documents.map((document) => (
          <DocumentListRow key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
}

export { DocumentListBox };
