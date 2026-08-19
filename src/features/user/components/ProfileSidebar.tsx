import { Avater } from "@src/components/ui/Avatar";
import { Divider } from "@src/components/ui/Divider";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { currentUser } from "@src/lib/currentUser";

import { MOCK_ORGANIZATIONS } from "../mockData";
import { OrganizationListItem } from "./OrganizationListItem";

import styles from "./ProfileSidebar.module.css";

function ProfileSidebar() {
  return (
    <aside className={styles.root}>
      <div className={styles.identity}>
        <Avater size="large" />
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
