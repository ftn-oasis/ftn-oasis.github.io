import { Icon } from "@src/components/ui/Icon";
import styles from "@src/components/ui/tabBase.module.css";
import {
  IconArrowMoveRight,
  IconCertificate,
  IconListSearch,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { NavLink } from "react-router";

type Tab = {
  key: string;
  label: string;
  icon: TablerIcon;
  to: string;
  // 「金額内訳」(./) のみ他タブの祖先パスに一致してしまうため end 指定が必須
  end?: boolean;
};

type TransactionDetailTabsProps = {
  organizationId: string;
  transactionId: string;
};

// 会計処理詳細ページ (/orgs/:orgId/book/:transactionId) 上部のタブ.
// OrganizationTabs と同じ tabBase を使い, 実際のルートに対応する NavLink にする.
// このページはヘッダー下部のスロットを OrganizationTabs (会計タブなど) が
// 既に使っているため, こちらはページ本文側 (TransactionHeaderBox の下)
// にそのまま描画する — ヘッダースロットは1つしか無く, 2段のタブを同時には
// 差し込めないため
function TransactionDetailTabs({
  organizationId,
  transactionId,
}: TransactionDetailTabsProps) {
  const root = `/orgs/${organizationId}/book/${transactionId}`;
  const tabs: Tab[] = [
    { key: "breakdown", label: "金額内訳", icon: IconListSearch, to: root, end: true },
    {
      key: "procedure",
      label: "手続状況",
      icon: IconArrowMoveRight,
      to: `${root}/procedure`,
    },
    {
      key: "receipt",
      label: "証憑",
      icon: IconCertificate,
      to: `${root}/receipt`,
    },
  ];

  return (
    <div className={styles.root} role="tablist" aria-label="会計処理">
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

export { TransactionDetailTabs };
