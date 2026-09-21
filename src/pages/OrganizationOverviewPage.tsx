import { OrganizationOverviewSection } from "@src/features/organization/components/OrganizationOverviewSection";
import {
  MOCK_ACTIVITIES,
  MOCK_MEMBERS,
  MOCK_ORGANIZATION,
} from "@src/features/organization/mockData";

// 見つからない場合の表示/OrganizationTabs は OrganizationLayout (親ルート) 側に
// まとめてあるため, ここでは概要タブの本文だけを描画する
function OrganizationOverviewPage() {
  return (
    <OrganizationOverviewSection
      organization={MOCK_ORGANIZATION}
      members={MOCK_MEMBERS}
      activities={MOCK_ACTIVITIES}
    />
  );
}

export { OrganizationOverviewPage };
