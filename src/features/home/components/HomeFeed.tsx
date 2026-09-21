import { Icon } from "@src/components/ui/Icon";
import { IconActivity } from "@tabler/icons-react";

import { MOCK_HOME_FEED_ITEMS } from "../mockData";
import { HomeFeedCard } from "./HomeFeedCard";

import styles from "./HomeFeed.module.css";

// ホーム画面 (~) メイン. GitHub のダッシュボードのフィードのように, 組織の
// 文書の発表情報や全体向けのメッセージを時系列で並べる
function HomeFeed() {
  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>
        <Icon icon={IconActivity} size={20} aria-hidden="true" />
        最新の情報
      </h2>
      <div className={styles.list}>
        {MOCK_HOME_FEED_ITEMS.map((item) => (
          <HomeFeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export { HomeFeed };
