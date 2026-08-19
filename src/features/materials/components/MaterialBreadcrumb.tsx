import { Icon } from "@src/components/ui/Icon";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router";

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

// 文書詳細ページ (/materials/:documentKey) 上部の, ~/materials 内だけで
// 完結するパンくず. 「上部に "ホーム/セクション名/文書名" のパンくずを
// 表示してほしい」という依頼のため, グローバルヘッダーのパンくず
// (Breadcrumb.tsx — /materials 配下はどの深さでも「規則・資料」の1階層
// 表示のまま, getBreadcrumb.ts の SPECIAL_ROOT_LABELS を参照) とは別に,
// ページ本文側にこの機能専用のパンくずを実装している (OrganizationHeaderBox
// の祖先組織名パンくずと同じ考え方)
function MaterialBreadcrumb({ document }: MaterialBreadcrumbProps) {
  return (
    <nav aria-label="パンくず" className={styles.root}>
      <Link to="/materials" className={styles.link}>
        ホーム
      </Link>
      <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
      <span>{SECTION_LABEL[document.sectionKey]}</span>
      <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
      <span className={styles.current}>{document.title}</span>
    </nav>
  );
}

export { MaterialBreadcrumb };
