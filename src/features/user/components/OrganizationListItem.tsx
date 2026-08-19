import { Avater } from "@src/components/ui/Avatar";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import clsx from "clsx";
import { Link } from "react-router";

import type { Organization } from "../types";

import styles from "./OrganizationListItem.module.css";

type OrganizationListItemProps = {
  organization: Organization;
};

// アイコン+組織名+役職の行全体を1つのボタンとして, 組織プロフィールページへリンクする
function OrganizationListItem({ organization }: OrganizationListItemProps) {
  return (
    <Link
      to={`/orgs/${organization.id}`}
      className={clsx(menuItemBase.root, styles.root)}
    >
      <Avater size="medium" shape="square" />
      <div className={styles.text}>
        <div className={styles.name} title={organization.name}>
          {organization.name}
        </div>
        <div className={styles.role} title={organization.role}>
          {organization.role}
        </div>
      </div>
    </Link>
  );
}

export { OrganizationListItem };
