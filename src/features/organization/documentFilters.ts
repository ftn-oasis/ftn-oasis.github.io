import {
  IconArchive,
  IconBinaryTree,
  IconEyeCheck,
  IconEyeOff,
  IconFileCode2,
  IconHome,
  IconPencil,
  IconSettings,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

type DocumentFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// DocumentFilterSidebar/OrganizationDocumentsSection の両方から使うため
// (選択中判定/見出し表示で同じ一覧が必要), コンポーネントファイルではなく
// このファイルに切り出している (react-refresh の「1ファイル1コンポーネント」
// 制約を避ける意図もある). 「所属する組織のみ」フィルターは組織横断の一覧
// (~/documents) と組織プロフィールページ配下 (~/orgs/:orgId/documents) とで
// 意味が異なる — 前者は「自分が所属する組織の文書だけに絞る」, 後者は既に
// 単一の組織に閉じているため, 代わりに「子組織を含む」(選択中の組織の子組織の
// 文書も一覧に含める) という意味に切り替える (依頼により後者だけ変更, 横断
// 一覧側は従来どおり)
function getDocumentFilters(scopedToOrganization: boolean): DocumentFilter[] {
  const ownOrgFilter: DocumentFilter = scopedToOrganization
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
      key: "involved",
      icon: IconUsers,
      label: "作成に関与",
      query: "関与: @私",
    },
    {
      key: "managed",
      icon: IconSettings,
      label: "管理下",
      query: "管理権限: @私 有効: true",
    },
    {
      key: "editable",
      icon: IconPencil,
      label: "編集可",
      query: "編集権限: @私 有効: true",
    },
    {
      key: "public",
      icon: IconEyeCheck,
      label: "公開中",
      query: "公開: true 有効: true",
    },
    {
      key: "private",
      icon: IconEyeOff,
      label: "非公開",
      query: "公開: false 有効: true",
    },
    {
      key: "archived",
      icon: IconArchive,
      label: "無効化済",
      query: "有効: false",
    },
    {
      key: "template",
      icon: IconFileCode2,
      label: "雛形",
      query: "雛形: true 有効: true",
    },
  ];
}

export { type DocumentFilter, getDocumentFilters };
