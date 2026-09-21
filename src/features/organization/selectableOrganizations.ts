import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";

import { OrganizationType } from "./types";

// 「組織から有志は選択できないようにしてほしい」という依頼のため, 所属組織
// (MOCK_MY_ORGANIZATIONS) のうち有志を除いたものを, 会計申請作成フォーム
// (支出/予算執行/寄付の3種類共通) の組織ドロップダウンの選択肢にする.
// 3フォームすべてから使うため, どのフォームにも属さないこのファイルに置いている
const SELECTABLE_ORGANIZATIONS = MOCK_MY_ORGANIZATIONS.filter(
  (organization) => organization.type !== OrganizationType.Volunteer,
);

export { SELECTABLE_ORGANIZATIONS };
