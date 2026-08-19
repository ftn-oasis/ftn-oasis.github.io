import {
  IconArchive,
  IconBinaryTree,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCreditCard,
  IconHome,
  IconMoneybagMinus,
  IconMoneybagPlus,
  IconReceipt,
  type TablerIcon,
} from "@tabler/icons-react";

type TransactionFilter = {
  key: string;
  icon: TablerIcon;
  label: string;
  // フィルターの実装はまだ無いため, 選択すると検索欄にこの文字列を入れるだけ
  query: string;
};

// TransactionFilterSidebar/OrganizationBookSection の両方から使うため
// (選択中判定/見出し表示で同じ一覧が必要), コンポーネントファイルではなく
// このファイルに切り出している (react-refresh の「1ファイル1コンポーネント」
// 制約を避ける意図もある). 「所属する組織のみ」フィルターは組織横断の一覧
// (~/books) と組織プロフィールページ配下 (~/orgs/:orgId/book) とで意味が
// 異なる — documentFilters.ts の getDocumentFilters と同じ理由で, 後者だけ
// 「子組織を含む」に切り替える
function getTransactionFilters(scopedToOrganization: boolean): TransactionFilter[] {
  const ownOrgFilter: TransactionFilter = scopedToOrganization
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
      key: "expense",
      icon: IconMoneybagMinus,
      label: "支出",
      query: "種別: 支出 有効: true",
    },
    {
      key: "income",
      icon: IconMoneybagPlus,
      label: "収入",
      query: "種別: 収入 有効: true",
    },
    {
      key: "approval-pending",
      icon: IconClock,
      label: "承認待",
      query: "状態: 承認待",
    },
    {
      key: "payment-pending",
      icon: IconCreditCard,
      label: "支払待",
      query: "状態: 支払待",
    },
    {
      key: "settlement-pending",
      icon: IconReceipt,
      label: "清算待",
      query: "状態: 清算待",
    },
    {
      key: "completed",
      icon: IconCircleCheck,
      label: "完了済",
      query: "状態: 完了済",
    },
    {
      key: "denied",
      icon: IconCircleX,
      label: "却下済",
      query: "状態: 却下済",
    },
    {
      key: "archived",
      icon: IconArchive,
      label: "無効化済",
      query: "有効: false",
    },
  ];
}

export { getTransactionFilters, type TransactionFilter };
