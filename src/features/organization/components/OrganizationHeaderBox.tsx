import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import { OrgNameLink } from "@src/components/ui/OrgNameLink";
import {
  IconCalendarWeek,
  IconChevronRight,
  IconUsers,
} from "@tabler/icons-react";
import { Fragment } from "react";

import { resolveOrganizationId } from "../resolveOrganizationId";
import { type OrganizationDetail, OrganizationType } from "../types";

import styles from "./OrganizationHeaderBox.module.css";

const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  [OrganizationType.Class]: "学級",
  [OrganizationType.ExecutiveBody]: "執行機関",
  [OrganizationType.DecisionMakingBody]: "議決機関",
  [OrganizationType.IndependentCommittee]: "独立委員会",
  [OrganizationType.Club]: "クラブ",
  [OrganizationType.Volunteer]: "有志",
};

type OrganizationHeaderBoxProps = {
  organization: OrganizationDetail;
};

function OrganizationHeaderBox({ organization }: OrganizationHeaderBoxProps) {
  // 有志はそもそも上位組織を持たない想定のため, パンくずを表示しない
  const showBreadcrumb =
    organization.type !== OrganizationType.Volunteer &&
    organization.ancestorNames.length > 0;

  return (
    <div className={styles.root}>
      <Avater size={100} shape="square" />
      <div className={styles.info}>
        {showBreadcrumb && (
          <div className={styles.breadcrumb}>
            {organization.ancestorNames.map((name) => (
              <Fragment key={name}>
                <OrgNameLink organizationId={resolveOrganizationId(name)} name={name} />
                <Icon icon={IconChevronRight} size={14} aria-hidden="true" />
              </Fragment>
            ))}
            <OrgNameLink
              organizationId={resolveOrganizationId(organization.name)}
              name={organization.name}
            />
          </div>
        )}

        <div className={styles.nameRow}>
          <OrgNameLink
            organizationId={resolveOrganizationId(organization.name)}
            name={organization.name}
            className={styles.name}
          />
          <Label>{ORGANIZATION_TYPE_LABEL[organization.type]}</Label>
        </div>

        <p className={styles.description} title={organization.description}>
          {organization.description}
        </p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Icon icon={IconUsers} size={16} aria-hidden="true" />
            所属人数: {organization.memberCount}人
          </span>
          {organization.foundedAt && (
            <span className={styles.metaItem}>
              <Icon icon={IconCalendarWeek} size={16} aria-hidden="true" />
              設立日: {organization.foundedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { OrganizationHeaderBox };
