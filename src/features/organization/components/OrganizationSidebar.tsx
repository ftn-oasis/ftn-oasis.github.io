import { Avater } from "@src/components/ui/Avatar";

import type { OrganizationMember } from "../types";

import styles from "./OrganizationSidebar.module.css";

type OrganizationSidebarProps = {
  members: OrganizationMember[];
};

function OrganizationSidebar({ members }: OrganizationSidebarProps) {
  return (
    <aside className={styles.root}>
      <h2 className={styles.heading}>構成員</h2>
      <div className={styles.memberList}>
        {members.map((member) => (
          <Avater key={member.id} size={35} />
        ))}
      </div>
    </aside>
  );
}

export { OrganizationSidebar };
