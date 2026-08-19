// 予算執行申請フォーム (BudgetExecutionRequestForm) の「対象予算項目」用の
// ダミーデータ. 実データ取得 API/年度予算の仕組み自体が無いため, 所管→組織→項
// の3階層で分類した項目を機械的に用意している. 他の mockData.ts と違い,
// この概念を使うコンポーネントが1つだけのため, purchaseItemDraft.ts と同じ
// 考え方で型と一緒にこのファイルへ独立させている

type BudgetLineItem = {
  id: string;
  // 所管 (予算を管理する上位組織, 例: 生徒会所管)
  jurisdiction: string;
  // 組織 (実際に予算を使う組織, 例: 文化祭実行委員会)
  organizationName: string;
  // 項 (具体的な予算費目, 例: 備品購入費)
  itemName: string;
};

const MOCK_BUDGET_LINE_ITEMS: BudgetLineItem[] = [
  {
    id: "budget-1",
    jurisdiction: "生徒会所管",
    organizationName: "生徒会本部",
    itemName: "運営費",
  },
  {
    id: "budget-2",
    jurisdiction: "生徒会所管",
    organizationName: "生徒会本部",
    itemName: "選挙関連費",
  },
  {
    id: "budget-3",
    jurisdiction: "生徒会所管",
    organizationName: "文化祭実行委員会",
    itemName: "企画運営費",
  },
  {
    id: "budget-4",
    jurisdiction: "生徒会所管",
    organizationName: "文化祭実行委員会",
    itemName: "備品購入費",
  },
  {
    id: "budget-5",
    jurisdiction: "生徒会所管",
    organizationName: "文化祭実行委員会",
    itemName: "広報費",
  },
  {
    id: "budget-6",
    jurisdiction: "文化局所管",
    organizationName: "新聞部",
    itemName: "印刷費",
  },
  {
    id: "budget-7",
    jurisdiction: "文化局所管",
    organizationName: "新聞部",
    itemName: "取材交通費",
  },
  {
    id: "budget-8",
    jurisdiction: "文化局所管",
    organizationName: "吹奏楽部",
    itemName: "楽器修繕費",
  },
  {
    id: "budget-9",
    jurisdiction: "文化局所管",
    organizationName: "吹奏楽部",
    itemName: "楽譜購入費",
  },
  {
    id: "budget-10",
    jurisdiction: "体育局所管",
    organizationName: "サッカー部",
    itemName: "遠征費",
  },
  {
    id: "budget-11",
    jurisdiction: "体育局所管",
    organizationName: "サッカー部",
    itemName: "用具購入費",
  },
  {
    id: "budget-12",
    jurisdiction: "体育局所管",
    organizationName: "バスケットボール部",
    itemName: "遠征費",
  },
];

export { type BudgetLineItem, MOCK_BUDGET_LINE_ITEMS };
