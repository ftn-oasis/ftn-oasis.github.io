import { Icon } from "@src/components/ui/Icon";
import styles from "@src/components/ui/tabBase.module.css";
import {
  IconFileAlert,
  IconFileTextSpark,
  IconHome,
  IconTag,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { NavLink } from "react-router";

type Tab = {
  key: string;
  label: string;
  icon: TablerIcon;
  to: string;
  // 「概要」(./) のみ他タブの祖先パスに一致してしまうため end 指定が必須
  end?: boolean;
};

type DocumentDetailTabsProps = {
  organizationId: string;
  documentId: string;
};

// 文書詳細ページ (/orgs/:orgId/documents/:documentId) 上部のタブ.
// MeetingDetailTabs/TransactionDetailTabs と同じ構成 (tabBase + NavLink,
// ページ本文側に描画 — 理由はそちらのコメントを参照)
function DocumentDetailTabs({ organizationId, documentId }: DocumentDetailTabsProps) {
  const root = `/orgs/${organizationId}/documents/${documentId}`;
  const tabs: Tab[] = [
    { key: "overview", label: "概要", icon: IconHome, to: root, end: true },
    { key: "versions", label: "版", icon: IconTag, to: `${root}/versions` },
    { key: "issues", label: "指摘事項", icon: IconFileAlert, to: `${root}/issues` },
    {
      key: "pulls",
      label: "修正提案",
      icon: IconFileTextSpark,
      to: `${root}/pulls`,
    },
    { key: "editors", label: "編集者", icon: IconUsers, to: `${root}/editors` },
  ];

  return (
    <div className={styles.root} role="tablist" aria-label="文書">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          end={tab.end}
          role="tab"
          className={({ isActive }) =>
            clsx(styles.tab, isActive && styles.selected)
          }
        >
          <Icon icon={tab.icon} size={16} aria-hidden="true" />
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}

export { DocumentDetailTabs };
