import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import { Label } from "@src/components/ui/Label";
import { IconUsers } from "@tabler/icons-react";
import { Link } from "react-router";

import { type OrganizationDetail, OrganizationType } from "../types";

import styles from "./OrgListRow.module.css";

const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  [OrganizationType.Class]: "学級",
  [OrganizationType.ExecutiveBody]: "執行機関",
  [OrganizationType.DecisionMakingBody]: "議決機関",
  [OrganizationType.IndependentCommittee]: "独立委員会",
  [OrganizationType.Club]: "クラブ",
  [OrganizationType.Volunteer]: "有志",
};

type OrgListRowProps = {
  organization: OrganizationDetail;
};

// 組織一覧の1行. 行全体が1つのリンク. MemberListRow と同じ考え方 (先頭に
// アバター, 中央に名前 (太字)+種別ラベル/概要, 右詰めで所属人数) — 依頼の
// 「組織のアイコン, 種類などを要素として持つリスト」を反映している.
// アバターは OrganizationHeaderBox と同じ size="medium" shape="square"
function OrgListRow({ organization }: OrgListRowProps) {
  return (
    <Link to={`/orgs/${organization.id}`} className={styles.root}>
      <Avater size="medium" shape="square" />
      <div className={styles.info}>
        <span className={styles.titleRow}>
          <span className={styles.title} title={organization.name}>
            {organization.name}
          </span>
          <Label>{ORGANIZATION_TYPE_LABEL[organization.type]}</Label>
        </span>
        <span className={styles.description} title={organization.description}>
          {organization.description}
        </span>
      </div>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconUsers} size={14} aria-hidden="true" />
          {organization.memberCount}人
        </span>
      </div>
    </Link>
  );
}

export { OrgListRow };
