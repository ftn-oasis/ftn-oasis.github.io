import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { IconCalendarTime } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import {
  MOCK_MATERIAL_CHANGES,
  MOCK_MATERIAL_DOCUMENTS,
  SECTION_OVERVIEW_DOCUMENT_KEY,
} from "../mockData";
import { MaterialSectionKey } from "../types";

import styles from "./MaterialsHomeSection.module.css";

const CHANGE_LOG_LIMIT = 10;

// ~/materials (ホーム) の本文. 「レイアウトはGitHub Docsを参考とし」という
// 依頼のため, GitHub Docs のカテゴリ一覧を参考に「規則」「資料」の2セクション
// が並ぶ Box + その下の更新履歴, という構成にしている
function MaterialsHomeSection() {
  // 「3階層目 (セクション直下の文書) が表示されるようにしてほしい」という
  // 依頼のため, parentKey を持つ (=さらに下の階層にある) 文書は除外し,
  // 各セクション直下の文書だけを一覧する — より深い階層は文書詳細ページ
  // (MaterialsExplorer) 側のサイドバーで辿る
  const rulesDocuments = MOCK_MATERIAL_DOCUMENTS.filter(
    (document) => document.sectionKey === MaterialSectionKey.Rules && !document.parentKey,
  );
  const guideDocuments = MOCK_MATERIAL_DOCUMENTS.filter(
    (document) => document.sectionKey === MaterialSectionKey.Guides && !document.parentKey,
  );
  const documentByKey = new Map(
    MOCK_MATERIAL_DOCUMENTS.map((document) => [document.key, document]),
  );
  const recentChanges = MOCK_MATERIAL_CHANGES.slice(0, CHANGE_LOG_LIMIT);

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>規則・資料</h1>
      <p className={styles.intro}>
        自治会に関する規則や立場別の案内をまとめています.
      </p>

      <div className={styles.sectionsBox}>
        <div className={styles.sectionColumn}>
          <h2 className={styles.sectionHeading}>
            <Link
              to={`/materials/${SECTION_OVERVIEW_DOCUMENT_KEY[MaterialSectionKey.Rules]}`}
              className={styles.sectionHeadingLink}
            >
              規則
            </Link>
          </h2>
          <nav aria-label="規則" className={styles.linkList}>
            {rulesDocuments.map((document) => (
              <Link
                key={document.key}
                to={`/materials/${document.key}`}
                className={clsx(menuItemBase.root, styles.documentLink)}
              >
                {document.title}
              </Link>
            ))}
          </nav>
        </div>

        <Divider orientation="vertical" />

        <div className={styles.sectionColumn}>
          <h2 className={styles.sectionHeading}>
            <Link
              to={`/materials/${SECTION_OVERVIEW_DOCUMENT_KEY[MaterialSectionKey.Guides]}`}
              className={styles.sectionHeadingLink}
            >
              資料
            </Link>
          </h2>
          <nav aria-label="資料" className={styles.linkList}>
            {guideDocuments.map((document) => (
              <Link
                key={document.key}
                to={`/materials/${document.key}`}
                className={clsx(menuItemBase.root, styles.documentLink)}
              >
                {document.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <section className={styles.changes}>
        <h2 className={styles.changesHeading}>お知らせ</h2>
        <div className={styles.changeList}>
          {recentChanges.map((entry) => {
            const document = documentByKey.get(entry.documentKey);
            return (
              <Link
                key={entry.id}
                to={`/materials/${entry.documentKey}`}
                className={styles.changeRow}
              >
                <span className={styles.changeSummary} title={entry.summary}>
                  {entry.summary}
                </span>
                <span className={styles.changeMeta}>
                  {document && (
                    <span className={styles.changeDocument}>{document.title}</span>
                  )}
                  <span className={styles.changeDate}>
                    <Icon icon={IconCalendarTime} size={14} aria-hidden="true" />
                    {entry.occurredAt}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export { MaterialsHomeSection };
