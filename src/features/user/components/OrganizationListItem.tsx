import { Avater } from "@src/components/ui/Avatar";

import type { Organization } from "../types";

import styles from "./OrganizationListItem.module.css";

type OrganizationListItemProps = {
  organization: Organization;
};

function OrganizationListItem({ organization }: OrganizationListItemProps) {
  return (
    <div className={styles.root}>
      <Avater size="large" shape="square" />
      <div className={styles.text}>
        <div className={styles.name}>{organization.name}</div>
        <div className={styles.role}>{organization.role}</div>
      </div>
    </div>
  );
}

export { OrganizationListItem };
