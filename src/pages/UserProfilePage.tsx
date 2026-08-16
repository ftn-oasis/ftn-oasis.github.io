import { Avater } from "@src/components/ui/Avatar";
import { ProfileTabs } from "@src/features/profile/ProfileTabs";
import { currentUser } from "@src/lib/currentUser";
import { useParams } from "react-router";

import styles from "./UserProfilePage.module.css";

// 文書/栞の件数はまだ実データが無いため, ダミーの数値を渡している
// (ProfileTabs.tsx の documentCount/bookmarkCount の説明を参照)
const DUMMY_DOCUMENT_COUNT = 3;
const DUMMY_BOOKMARK_COUNT = 2;

function UserProfilePage() {
  const { userId } = useParams();

  // 認証/他ユーザーの検索機能が無いため, 現状 currentUser 以外は「見つからない」扱いにする
  if (userId !== currentUser.id) {
    return <p className={styles.notFound}>ユーザーが見つかりません.</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <Avater size="large" />
        <h1 className={styles.name}>{currentUser.name}</h1>
      </div>
      <ProfileTabs
        documentCount={DUMMY_DOCUMENT_COUNT}
        bookmarkCount={DUMMY_BOOKMARK_COUNT}
      />
    </div>
  );
}

export { UserProfilePage };
