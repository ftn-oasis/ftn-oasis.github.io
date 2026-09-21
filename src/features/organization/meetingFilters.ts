import {
  IconArchive,
  IconBinaryTree,
  IconCalendarEvent,
  IconCalendarOff,
  IconCalendarRepeat,
  IconHome,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

type MeetingFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// MeetingFilterSidebar/OrganizationMeetingsSection の両方から使うため
// (選択中判定/見出し表示で同じ一覧が必要), コンポーネントファイルではなく
// このファイルに切り出している (react-refresh の「1ファイル1コンポーネント」
// 制約を避ける意図もある). 「所属する組織のみ」フィルターは組織横断の一覧
// (~/meetings) と組織プロフィールページ配下 (~/orgs/:orgId/meetings) とで
// 意味が異なる — documentFilters.ts の getDocumentFilters と同じ理由で,
// 後者だけ「子組織を含む」に切り替える
function getMeetingFilters(scopedToOrganization: boolean): MeetingFilter[] {
  const ownOrgFilter: MeetingFilter = scopedToOrganization
    ? {
        key: "own-org-only",
        icon: IconBinaryTree,
        label: "子組織を含む",
        query: "子組織: true",
      }
    : {
        key: "own-org-only",
        icon: IconBinaryTree,
        label: "所属する組織のみ",
        query: "子組織: false",
      };

  return [
    { key: "all", icon: IconHome, label: "全て", query: "" },
    ownOrgFilter,
    {
      key: "upcoming",
      icon: IconCalendarEvent,
      label: "開催予定",
      query: "開催日: 未来",
    },
    {
      key: "required",
      icon: IconUsers,
      label: "要参加",
      query: "参加者: @私",
    },
    {
      key: "postponed",
      icon: IconCalendarRepeat,
      label: "延会",
      query: "延会: true",
    },
    {
      key: "canceled",
      icon: IconCalendarOff,
      label: "流会",
      query: "流会: true",
    },
    {
      key: "past",
      icon: IconArchive,
      label: "過去の会議",
      query: "開催日: 過去",
    },
  ];
}

export { getMeetingFilters, type MeetingFilter };
