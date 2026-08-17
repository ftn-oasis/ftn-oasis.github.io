import { Icon } from "@src/components/ui/Icon";
import { IconClock } from "@tabler/icons-react";

import type { Activity } from "../types";
import { ActivityCard } from "./ActivityCard";

import styles from "./OrganizationActivityFeed.module.css";

type OrganizationActivityFeedProps = {
  activities: Activity[];
};

function OrganizationActivityFeed({
  activities,
}: OrganizationActivityFeedProps) {
  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>
        <Icon icon={IconClock} size={20} aria-hidden="true" />
        直近の動向
      </h2>
      <div className={styles.list}>
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

export { OrganizationActivityFeed };
