import { Icon } from "@src/components/ui/Icon";
import { IconChevronRight } from "@tabler/icons-react";
import { Fragment } from "react";
import { Link } from "react-router";

import {
  MOCK_MATERIAL_DOCUMENTS,
  resolveDisplayableDocument,
  SECTION_OVERVIEW_DOCUMENT_KEY,
} from "../mockData";
import type { MaterialDocument } from "../types";
import { MaterialSectionKey } from "../types";

import styles from "./MaterialBreadcrumb.module.css";

const SECTION_LABEL: Record<MaterialSectionKey, string> = {
  [MaterialSectionKey.Rules]: "規則",
  [MaterialSectionKey.Guides]: "資料",
};

type MaterialBreadcrumbProps = {
  document: MaterialDocument;
};

// document から親をたどり, 祖先の文書を上位から順に返す (自分自身は含まない)
function getAncestors(document: MaterialDocument): MaterialDocument[] {
  const ancestors: MaterialDocument[] = [];
  let current = document;
  while (current.parentKey) {
    const parent = MOCK_MATERIAL_DOCUMENTS.find(
      (candidate) => candidate.key === current.parentKey,
    );
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

// 文書詳細ページ (/materials/:documentKey) 上部の, ~/materials 内だけで
// 完結するパンくず. 「上部に "ホーム/セクション名/文書名" のパンくずを
// 表示してほしい」という依頼のため, グローバルヘッダーのパンくず
// (Breadcrumb.tsx — /materials 配下はどの深さでも「規則・資料」の1階層
// 表示のまま, getBreadcrumb.ts の SPECIAL_ROOT_LABELS を参照) とは別に,
// ページ本文側にこの機能専用のパンくずを実装している (OrganizationHeaderBox
// の祖先組織名パンくずと同じ考え方). 文書の入れ子構造に対応するため,
// 「ホーム/セクション名/文書名」の3階層固定ではなく, 祖先の文書
// (getAncestors) をすべて挟む可変長のパンくずにしている
function MaterialBreadcrumb({ document }: MaterialBreadcrumbProps) {
  const ancestors = getAncestors(document);

  return (
    <nav aria-label="パンくず" className={styles.root}>
      <Link to="/materials" className={styles.link}>
        ホーム
      </Link>
      <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
      <Link
        to={`/materials/${SECTION_OVERVIEW_DOCUMENT_KEY[document.sectionKey]}`}
        className={styles.link}
      >
        {SECTION_LABEL[document.sectionKey]}
      </Link>
      {ancestors.map((ancestor) => (
        <Fragment key={ancestor.key}>
          <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
          {/* ancestor が content を持たない (単なるグルーピングの) 節目の
              場合, 自分自身ではなく最初の子文書を指す (MaterialsExplorer の
              サイドバーのリンクと同じ考え方) */}
          <Link
            to={`/materials/${resolveDisplayableDocument(ancestor).key}`}
            className={styles.link}
          >
            {ancestor.title}
          </Link>
        </Fragment>
      ))}
      <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
      <span className={styles.current}>{document.title}</span>
    </nav>
  );
}

export { MaterialBreadcrumb };
