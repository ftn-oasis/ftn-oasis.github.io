import { HomeFeed } from "./HomeFeed";
import { HomeSidebar } from "./HomeSidebar";

import styles from "./HomeSection.module.css";

// ~ (ホーム) の本文. OverviewSection と同じ 1fr/3fr の列比率で, 左に自身が
// 編集に関わった文書 (HomeSidebar), 右にフィード (HomeFeed) を配置する
function HomeSection() {
  return (
    <div className={styles.root}>
      <HomeSidebar />
      <main className={styles.main}>
        <HomeFeed />
      </main>
    </div>
  );
}

export { HomeSection };
