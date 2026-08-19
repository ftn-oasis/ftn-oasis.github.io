// 実データを取得する API が無いため, 概要タブなどで使うダミーデータをまとめて置く場所

import { OrganizationType } from "@src/features/organization/types";

import { DocumentVisibility, type DocumentSummary, type Organization } from "./types";

// test-org (文化祭実行委員会) は features/organization/mockData.ts の
// MOCK_ORGANIZATION と同じ組織を指す — 組織プロフィールページからユーザーの
// プロフィールページへの繋がりを確認できるように, 同じ id/type で参照している
const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "student-council", name: "生徒会", role: "書記", type: OrganizationType.ExecutiveBody },
  { id: "newspaper-club", name: "新聞部", role: "部長", type: OrganizationType.Club },
  {
    id: "test-org",
    name: "文化祭実行委員会",
    role: "委員",
    type: OrganizationType.IndependentCommittee,
    hasBankAccount: true,
  },
];

const MOCK_DOCUMENTS: DocumentSummary[] = [
  {
    id: "bunkasai-plan",
    organizationId: "test-org",
    organizationName: "文化祭実行委員会",
    title: "文化祭実行計画書",
    description: "今年度の文化祭の日程・予算・役割分担についてまとめた計画書です.",
    visibility: DocumentVisibility.Public,
    fileType: "PDF",
  },
  {
    id: "council-minutes-2026-08",
    organizationId: "student-council",
    organizationName: "生徒会",
    title: "定例会議事録 (2026年8月)",
    description: "生徒会定例会での議題と決定事項の記録です.",
    visibility: DocumentVisibility.Private,
    fileType: "Markdown",
  },
  {
    id: "newspaper-issue-12",
    organizationId: "newspaper-club",
    organizationName: "新聞部",
    title: "学校新聞 第12号 原稿",
    description: "次号に掲載する記事の草稿一式です.",
    visibility: DocumentVisibility.Private,
    fileType: "Text",
  },
  {
    id: "library-orientation",
    organizationId: "library-committee",
    organizationName: "図書委員会",
    title: "図書館利用ガイダンス映像",
    description: "新入生向けの図書館利用方法を説明する映像です.",
    visibility: DocumentVisibility.Public,
    fileType: "MP4",
  },
];

export { MOCK_DOCUMENTS, MOCK_ORGANIZATIONS };
