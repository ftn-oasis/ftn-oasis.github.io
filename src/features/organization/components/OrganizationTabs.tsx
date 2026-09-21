import { Icon } from "@src/components/ui/Icon";
import styles from "@src/components/ui/tabBase.module.css";
import {
  IconCalendarTime,
  IconFileText,
  IconHome,
  IconReceiptYen,
  IconSettings,
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
  // "概要" のみ他タブの祖先パスに一致してしまうため end 指定が必須. それ以外は
  // 将来的な下位ページ (例: 文書の個別ページ) でもタブが選択中のまま見えるよう
  // 末尾一致にしない
  end?: boolean;
  count?: number;
};

type OrganizationTabsProps = {
  organizationId: string;
  documentCount: number;
  bookCount: number;
  meetingCount: number;
  memberCount: number;
};

// GitHub の Organization ページを参考にした, 組織プロフィールページ下部のタブ.
// ProfileTabs (ユーザー) と違い, 各タブが実際のルートに対応する NavLink
function OrganizationTabs({
  organizationId,
  documentCount,
  bookCount,
  meetingCount,
  memberCount,
}: OrganizationTabsProps) {
  const root = `/orgs/${organizationId}`;
  const tabs: Tab[] = [
    { key: "overview", label: "概要", icon: IconHome, to: root, end: true },
    {
      key: "documents",
      label: "文書",
      icon: IconFileText,
      to: `${root}/documents`,
      count: documentCount,
    },
    {
      key: "book",
      label: "会計",
      icon: IconReceiptYen,
      to: `${root}/book`,
      count: bookCount,
    },
    {
      key: "meetings",
      label: "会議",
      icon: IconCalendarTime,
      to: `${root}/meetings`,
      count: meetingCount,
    },
    {
      key: "members",
      label: "構成員",
      icon: IconUsers,
      to: `${root}/members`,
      count: memberCount,
    },
    { key: "settings", label: "設定", icon: IconSettings, to: `${root}/settings` },
  ];

  return (
    <div className={styles.root} role="tablist" aria-label="組織">
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
          {tab.count !== undefined && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export { OrganizationTabs };
