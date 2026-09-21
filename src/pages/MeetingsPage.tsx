import { OrganizationMeetingsSection } from "@src/features/organization/components/OrganizationMeetingsSection";
import { MOCK_ORGANIZATION_MEETINGS } from "@src/features/organization/mockData";

// ~/meetings — Header/NavDrawer の「予定されている会議」が指すページ.
// DocumentsPage と同じ考え方で, OrganizationMeetingsSection (リスト/
// カレンダー表示切り替えを含む) をそのまま再利用し, 組織で絞り込まない
// 全件 (MOCK_ORGANIZATION_MEETINGS) を渡している
function MeetingsPage() {
  return <OrganizationMeetingsSection meetings={MOCK_ORGANIZATION_MEETINGS} />;
}

export { MeetingsPage };
