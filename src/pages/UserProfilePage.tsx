import { HeaderBottomPortal } from "@src/components/layout/HeaderBottomPortal";
import { OverviewSection } from "@src/features/user/components/OverviewSection";
import { ProfileTabs } from "@src/features/user/components/ProfileTabs";
import { currentUser } from "@src/lib/currentUser";
import { useState } from "react";
import { useParams } from "react-router";

import styles from "./UserProfilePage.module.css";

// 文書の件数はまだ実データが無いため, ダミーの数値を渡している
// (ProfileTabs.tsx の documentCount の説明を参照)
const DUMMY_DOCUMENT_COUNT = 3;

function UserProfilePage() {
  const { userId } = useParams();
  // ProfileTabs 自身が持つ選択状態 (既定は先頭の "overview") をミラーして,
  // 本文側の切り替えに使う
  const [selectedTab, setSelectedTab] = useState("overview");

  // 認証/他ユーザーの検索機能が無いため, 現状 currentUser 以外は「見つからない」扱いにする
  if (userId !== currentUser.id) {
    return <p className={styles.notFound}>ユーザーが見つかりません.</p>;
  }

  return (
    <>
      <HeaderBottomPortal>
        <ProfileTabs
          documentCount={DUMMY_DOCUMENT_COUNT}
          onChange={setSelectedTab}
        />
      </HeaderBottomPortal>
      {selectedTab === "overview" && <OverviewSection />}
    </>
  );
}

export { UserProfilePage };
