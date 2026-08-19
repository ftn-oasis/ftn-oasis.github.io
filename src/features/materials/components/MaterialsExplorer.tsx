import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MarkdownFileViewer } from "@src/features/organization/components/MarkdownFileViewer";
import {
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconFolder,
  IconFolderOpen,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { Link } from "react-router";

import { MOCK_MATERIAL_DOCUMENTS } from "../mockData";
import { MaterialSectionKey } from "../types";

import styles from "./MaterialsExplorer.module.css";

const SECTION_LABEL: Record<MaterialSectionKey, string> = {
  [MaterialSectionKey.Rules]: "規則",
  [MaterialSectionKey.Guides]: "資料",
};

const SECTIONS: MaterialSectionKey[] = [
  MaterialSectionKey.Rules,
  MaterialSectionKey.Guides,
];

type MaterialsExplorerProps = {
  selectedDocumentKey: string;
};

// 文書詳細ページ (/materials/:documentKey) 下部の, GitHub のファイル
// ビューワを参考にしたサイドバー+メイン構成 — 「下部に
// ~/orgs/組織ID/meetings/会議ID/materials の文書閲覧及び選択画面が出る
// ようにしてほしい」という依頼のため, MeetingMaterialsExplorer と同じ構造
// (開閉できるディレクトリツリー+選択中の資料のプレビュー) にしている.
// 「ディレクトリを模した部分にはホームでの各リンク名を入れてほしい」という
// 依頼のため, サイドバーは「規則」「資料」の2フォルダ (ホームの2セクションと
// 対応) の下に, 各セクションの文書 (ホームでの各リンク名と同じ) をファイル
// として並べている. MeetingMaterialsExplorer と異なりファイル行は実際の
// <Link> (選択状態が URL のパラメータ由来のため, ボタン+内部 state ではなく
// 実際のルーティングにしている)
function MaterialsExplorer({ selectedDocumentKey }: MaterialsExplorerProps) {
  const selectedDocument = MOCK_MATERIAL_DOCUMENTS.find(
    (document) => document.key === selectedDocumentKey,
  );

  const [expandedSections, setExpandedSections] = useState<Set<MaterialSectionKey>>(
    () => new Set(selectedDocument ? [selectedDocument.sectionKey] : SECTIONS),
  );

  const toggleSection = (sectionKey: MaterialSectionKey) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar} aria-label="規則・資料">
        {SECTIONS.map((sectionKey) => {
          const isExpanded = expandedSections.has(sectionKey);
          const documents = MOCK_MATERIAL_DOCUMENTS.filter(
            (document) => document.sectionKey === sectionKey,
          );

          return (
            <div key={sectionKey}>
              <button
                type="button"
                className={menuItemBase.root}
                onClick={() => toggleSection(sectionKey)}
              >
                <Icon
                  icon={isExpanded ? IconChevronDown : IconChevronRight}
                  size={14}
                  aria-hidden="true"
                  className={styles.chevron}
                />
                <Icon
                  icon={isExpanded ? IconFolderOpen : IconFolder}
                  size={16}
                  aria-hidden="true"
                />
                <span>{SECTION_LABEL[sectionKey]}</span>
              </button>

              {isExpanded &&
                documents.map((document) => (
                  <Link
                    key={document.key}
                    to={`/materials/${document.key}`}
                    className={clsx(
                      menuItemBase.root,
                      styles.fileRow,
                      document.key === selectedDocumentKey && menuItemBase.active,
                    )}
                  >
                    <Icon icon={IconFileText} size={16} aria-hidden="true" />
                    <span>{document.title}</span>
                  </Link>
                ))}
            </div>
          );
        })}
      </nav>

      <div className={styles.main}>
        {!selectedDocument ? (
          <p className={styles.empty}>文書がありません.</p>
        ) : (
          <div className={styles.markdownContent}>
            <MarkdownFileViewer
              source={selectedDocument.content}
              title={`${selectedDocument.title}.md`}
              bordered={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { MaterialsExplorer };
