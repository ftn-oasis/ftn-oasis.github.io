import clsx from "clsx";
import { useState } from "react";

import styles from "./ProfileTabs.module.css";

type Tab = {
  key: string;
  label: string;
  count?: number;
};

type ProfileTabsProps = {
  // この人名義の文書/フラグを立てている文書の件数. 0 または未指定ならタブ自体を隠す
  documentCount?: number;
  bookmarkCount?: number;
  onChange?: (key: string) => void;
};

// GitHub の User Profile ページを参考にした, プロフィールページ下部のタブ切り替え.
// 本文の切り替え先 (ページ本体) は未実装のため, 選択状態の管理と見た目のみを持つ
function ProfileTabs({
  documentCount,
  bookmarkCount,
  onChange,
}: ProfileTabsProps) {
  const tabs: Tab[] = [
    { key: "overview", label: "概要" },
    ...(documentCount
      ? [{ key: "documents", label: "文書", count: documentCount }]
      : []),
    ...(bookmarkCount
      ? [{ key: "bookmarks", label: "栞", count: bookmarkCount }]
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
