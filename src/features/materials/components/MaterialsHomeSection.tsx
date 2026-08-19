import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { MenuLink } from "@src/components/ui/MenuLink";
import { IconCalendarTime, IconGavel, IconUsers } from "@tabler/icons-react";
import { Link } from "react-router";

import { MOCK_MATERIAL_CHANGES, MOCK_MATERIAL_DOCUMENTS } from "../mockData";
import { MaterialSectionKey } from "../types";

import styles from "./MaterialsHomeSection.module.css";

const CHANGE_LOG_LIMIT = 10;

// ~/materials (ホーム) の本文. 「レイアウトはGitHub Docsを参考とし」という
// 依頼のため, GitHub Docs のカテゴリ一覧を参考に「規則」「資料」の2セクション
// が並ぶ Box + その下の更新履歴, という構成にしている
function MaterialsHomeSection() {
  const rulesDocuments = MOCK_MATERIAL_DOCUMENTS.filter(
    (document) => document.sectionKey === MaterialSectionKey.Rules,
  );
  const guideDocuments = MOCK_MATERIAL_DOCUMENTS.filter(
    (document) => document.sectionKey === MaterialSectionKey.Guides,
  );
  const documentByKey = new Map(
    MOCK_MATERIAL_DOCUMENTS.map((document) => [document.key, document]),
  );
  const recentChanges = MOCK_MATERIAL_CHANGES.slice(0, CHANGE_LOG_LIMIT);

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>規則・資料</h1>
      <p className={styles.intro}>
        生徒会に関する会則・規則・協定や, 立場別の案内をまとめています.
      </p>

      <div className={styles.sectionsBox}>
        <div className={styles.sectionColumn}>
          <h2 className={styles.sectionHeading}>規則</h2>
          <nav aria-label="規則" className={styles.linkList}>
            {rulesDocuments.map((document) => (
              <MenuLink
                key={document.key}
                to={`/materials/${document.key}`}
                icon={IconGavel}
                label={document.title}
              />
            ))}
          </nav>
        </div>

        <Divider orientation="vertical" />

        <div className={styles.sectionColumn}>
          <h2 className={styles.sectionHeading}>資料</h2>
          <nav aria-label="資料" className={styles.linkList}>
            {guideDocuments.map((document) => (
              <MenuLink
                key={document.key}
                to={`/materials/${document.key}`}
                icon={IconUsers}
                label={document.title}
              />
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
