import { HeaderBottomPortal } from "@src/components/layout/HeaderBottomPortal";
import { OrganizationOverviewSection } from "@src/features/organization/components/OrganizationOverviewSection";
import { OrganizationTabs } from "@src/features/organization/components/OrganizationTabs";
import {
  MOCK_ACTIVITIES,
  MOCK_MEMBERS,
  MOCK_ORGANIZATION,
  MOCK_TAB_COUNTS,
} from "@src/features/organization/mockData";
import { useParams } from "react-router";

import styles from "./OrganizationProfilePage.module.css";

function OrganizationProfilePage() {
  const { orgId } = useParams();

  // 実データ取得/組織検索の API が無いため, 現状 MOCK_ORGANIZATION 以外は
  // 「見つからない」扱いにする (UserProfilePage の currentUser 判定と同じ考え方)
  if (orgId !== MOCK_ORGANIZATION.id) {
    return <p className={styles.notFound}>組織が見つかりません.</p>;
  }

  return (
    <>
      <HeaderBottomPortal>
        <OrganizationTabs
          organizationId={MOCK_ORGANIZATION.id}
          documentCount={MOCK_TAB_COUNTS.documents}
          bookCount={MOCK_TAB_COUNTS.book}
          meetingCount={MOCK_TAB_COUNTS.meetings}
          memberCount={MOCK_TAB_COUNTS.members}
        />
      </HeaderBottomPortal>
      <OrganizationOverviewSection
        organization={MOCK_ORGANIZATION}
        members={MOCK_MEMBERS}
        activities={MOCK_ACTIVITIES}
      />
    </>
  );
}

export { OrganizationProfilePage };
