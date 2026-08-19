import { Icon } from "@src/components/ui/Icon";
import styles from "@src/components/ui/tabBase.module.css";
import {
  IconFolders,
  IconListDetails,
  IconNotes,
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
  // 「議題」(./) のみ他タブの祖先パスに一致してしまうため end 指定が必須
  end?: boolean;
};

type MeetingDetailTabsProps = {
  organizationId: string;
  meetingId: string;
};

// 会議詳細ページ (/orgs/:orgId/meetings/:meetingId) 上部のタブ.
// TransactionDetailTabs と同じ構成 (tabBase + NavLink, ページ本文側に描画
// — 理由は TransactionDetailTabs のコメントを参照)
function MeetingDetailTabs({ organizationId, meetingId }: MeetingDetailTabsProps) {
  const root = `/orgs/${organizationId}/meetings/${meetingId}`;
  const tabs: Tab[] = [
    { key: "agenda", label: "議題", icon: IconListDetails, to: root, end: true },
    { key: "materials", label: "資料", icon: IconFolders, to: `${root}/materials` },
    { key: "attendees", label: "出席者", icon: IconUsers, to: `${root}/attendees` },
    { key: "minutes", label: "議事録", icon: IconNotes, to: `${root}/minutes` },
  ];

  return (
    <div className={styles.root} role="tablist" aria-label="会議">
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

export { MeetingDetailTabs };
