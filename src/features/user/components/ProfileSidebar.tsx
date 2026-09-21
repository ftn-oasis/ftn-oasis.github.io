import { Avater } from "@src/components/ui/Avatar";
import { Divider } from "@src/components/ui/Divider";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { useUserProfile } from "@src/contexts/UserProfileContext";
import { currentUser } from "@src/lib/currentUser";

import { MOCK_ORGANIZATIONS } from "../mockData";
import { OrganizationListItem } from "./OrganizationListItem";

import styles from "./ProfileSidebar.module.css";

function ProfileSidebar() {
  // ここは常に currentUser 自身のプロフィールなので (/users/:userId は
  // currentUser.id と一致する場合しか実データを表示しない — 「プロジェクトに
  // ついて」を参照), ~/settings で変更したアバターをそのまま反映する
  const { avatarDataUrl } = useUserProfile();

  return (
    <aside className={styles.root}>
      <div className={styles.identity}>
        <Avater src={avatarDataUrl ?? undefined} size="large" />
        <div className={styles.identityText}>
          <UserNameLink
            userId={currentUser.id}
            name={currentUser.name}
            className={styles.userName}
          />
          <div className={styles.userEmail} title={currentUser.email}>
            {currentUser.email}
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className={styles.heading}>所属する組織</h2>
        <ul className={styles.organizationList}>
          {MOCK_ORGANIZATIONS.map((organization) => (
            <li key={organization.id}>
              <OrganizationListItem organization={organization} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export { ProfileSidebar };
