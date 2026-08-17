import { Divider } from "@src/components/ui/Divider";

import type {
  Activity,
  OrganizationDetail,
  OrganizationMember,
} from "../types";
import { OrganizationActivityFeed } from "./OrganizationActivityFeed";
import { OrganizationHeaderBox } from "./OrganizationHeaderBox";
import { OrganizationSidebar } from "./OrganizationSidebar";

import styles from "./OrganizationOverviewSection.module.css";

type OrganizationOverviewSectionProps = {
  organization: OrganizationDetail;
  members: OrganizationMember[];
  activities: Activity[];
};

function OrganizationOverviewSection({
  organization,
  members,
  activities,
}: OrganizationOverviewSectionProps) {
  return (
    <div className={styles.root}>
      <OrganizationHeaderBox organization={organization} />

      <Divider />

      <div className={styles.body}>
        <main className={styles.main}>
          <OrganizationActivityFeed activities={activities} />
        </main>
        <OrganizationSidebar members={members} />
      </div>
    </div>
  );
}

export { OrganizationOverviewSection };
