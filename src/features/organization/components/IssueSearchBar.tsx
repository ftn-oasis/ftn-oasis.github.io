import { Icon } from "@src/components/ui/Icon";
import { IconCircleXFilled, IconSearch } from "@tabler/icons-react";

import styles from "./IssueSearchBar.module.css";

type IssueSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

// MeetingSearchBar と同じ構造の, 実際に入力できる検索欄
function IssueSearchBar({ value, onChange }: IssueSearchBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="指摘事項を検索"
          className={styles.input}
        />
        {value && (
          <button
            type="button"
            aria-label="検索文字列をクリア"
            onClick={() => onChange("")}
            className={styles.clear}
          >
            <Icon icon={IconCircleXFilled} size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <button type="button" aria-label="検索" className={styles.searchButton}>
        <Icon icon={IconSearch} aria-hidden="true" />
      </button>
    </div>
  );
}

export { IssueSearchBar };
