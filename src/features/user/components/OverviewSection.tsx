import { PinnedDocuments } from "./PinnedDocuments";
import { ProfileSidebar } from "./ProfileSidebar";

import styles from "./OverviewSection.module.css";

// UserProfilePage の「概要」タブの本文
function OverviewSection() {
  return (
    <div className={styles.root}>
      <ProfileSidebar />
      <main className={styles.main}>
        <PinnedDocuments />
      </main>
    </div>
  );
}

export { OverviewSection };
