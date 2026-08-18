import { HeaderBottomPortal } from "@src/components/layout/HeaderBottomPortal";
import { OrganizationTabs } from "@src/features/organization/components/OrganizationTabs";
import {
  MOCK_ORGANIZATION,
  MOCK_TAB_COUNTS,
} from "@src/features/organization/mockData";
import { Outlet, useParams } from "react-router";

import styles from "./OrganizationLayout.module.css";

// /orgs/:orgId 配下のページ共通のレイアウト. OrganizationTabs (概要/文書/会計/会議/
// 構成員/設定) はどのタブを開いていても常に表示するため, 個々のページではなく
// ここでまとめて描画する
function OrganizationLayout() {
  const { orgId } = useParams();

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
      <Outlet />
    </>
  );
}

export { OrganizationLayout };
