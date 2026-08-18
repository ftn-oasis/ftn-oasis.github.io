import { Icon } from "@src/components/ui/Icon";
import styles from "@src/components/ui/tabBase.module.css";
import { IconFileText, IconHome, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

type Tab = {
  key: string;
  label: string;
  icon: TablerIcon;
  count?: number;
};

type ProfileTabsProps = {
  // この人名義の文書の件数. 0 または未指定ならタブ自体を隠す
  documentCount?: number;
  onChange?: (key: string) => void;
};

// GitHub の User Profile ページを参考にした, プロフィールページ下部のタブ切り替え.
// 本文の切り替え先 (ページ本体) は未実装のため, 選択状態の管理と見た目のみを持つ
function ProfileTabs({ documentCount, onChange }: ProfileTabsProps) {
  const tabs: Tab[] = [
    { key: "overview", label: "概要", icon: IconHome },
    ...(documentCount
      ? [{ key: "documents", label: "文書", icon: IconFileText, count: documentCount }]
      : []),
  ];

  const [selected, setSelected] = useState(tabs[0].key);

  const handleSelect = (key: string) => {
    setSelected(key);
    onChange?.(key);
  };

  return (
    <div className={styles.root} role="tablist" aria-label="プロフィール">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={selected === tab.key}
          onClick={() => handleSelect(tab.key)}
          className={clsx(styles.tab, selected === tab.key && styles.selected)}
        >
          <Icon icon={tab.icon} size={16} aria-hidden="true" />
          {tab.label}
          {tab.count !== undefined && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export { ProfileTabs };
