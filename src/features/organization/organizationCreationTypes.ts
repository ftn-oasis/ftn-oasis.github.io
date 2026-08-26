// 組織作成フォーム (~/orgs/new) の「組織種別」選択肢. 依頼された8種類
// (独立委員会/特別委員会/常設委員会/特設委員会/事務局/部活動/同好会/有志) は
// 既存の `OrganizationType` (types.ts — 学級/執行機関/議決機関/独立委員会/
// クラブ/有志. 組織一覧/組織ヘッダーの種別バッジ/フィルターサイドバーで既に
// 使用中) と一致しないため, ユーザーに確認のうえ既存の型とは統合せず,
// この作成フォーム専用の独立した型として新設しています.
//
// **TODO: 将来的には `OrganizationType` と統合すべきです** — 現状は
// 「新しく作った組織の種別」と「一覧/ヘッダーで表示される既存組織の種別」が
// 異なる2つの語彙になってしまっており (例: 新規作成時は「部活動」だが,
// 一覧側では同じものが「クラブ」と表示される), 実際にバックエンドと繋ぐ際は
// どちらかに一本化する (あるいは両者の対応関係を定義する) 必要があります.
const OrganizationCreationType = {
  IndependentCommittee: "independent-committee",
  SpecialCommittee: "special-committee",
  StandingCommittee: "standing-committee",
  AdHocCommittee: "ad-hoc-committee",
  Secretariat: "secretariat",
  Club: "club",
  InterestGroup: "interest-group",
  Volunteer: "volunteer",
} as const;

type OrganizationCreationType =
  (typeof OrganizationCreationType)[keyof typeof OrganizationCreationType];

const ORGANIZATION_CREATION_TYPE_LABEL: Record<OrganizationCreationType, string> = {
  [OrganizationCreationType.IndependentCommittee]: "独立委員会",
  [OrganizationCreationType.SpecialCommittee]: "特別委員会",
  [OrganizationCreationType.StandingCommittee]: "常設委員会",
  [OrganizationCreationType.AdHocCommittee]: "特設委員会",
  [OrganizationCreationType.Secretariat]: "事務局",
  [OrganizationCreationType.Club]: "部活動",
  [OrganizationCreationType.InterestGroup]: "同好会",
  [OrganizationCreationType.Volunteer]: "有志",
};

// ドロップダウン (OrganizationTypeSelectField) の表示順 — 依頼文に列挙された順序どおり
const ORGANIZATION_CREATION_TYPES: OrganizationCreationType[] = [
  OrganizationCreationType.IndependentCommittee,
  OrganizationCreationType.SpecialCommittee,
  OrganizationCreationType.StandingCommittee,
  OrganizationCreationType.AdHocCommittee,
  OrganizationCreationType.Secretariat,
  OrganizationCreationType.Club,
  OrganizationCreationType.InterestGroup,
  OrganizationCreationType.Volunteer,
];

export {
  ORGANIZATION_CREATION_TYPE_LABEL,
  ORGANIZATION_CREATION_TYPES,
  OrganizationCreationType,
};
