import { Icon } from "@src/components/ui/Icon";
import { IconCircleXFilled, IconSearch } from "@tabler/icons-react";

import styles from "./DocumentSearchBar.module.css";

type DocumentSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

// GitHub のリポジトリ検索バーを参考にした, 実際に入力できる検索欄.
// (Header 検索ボタンは実際には検索ページへのリンクで, 入力欄を持たない別物)
function DocumentSearchBar({ value, onChange }: DocumentSearchBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="文書を検索"
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

export { DocumentSearchBar };
