import { HeaderBottomPortal } from "@src/components/layout/HeaderBottomPortal";
import { OrganizationTabs } from "@src/features/organization/components/OrganizationTabs";
import {
  MOCK_MEMBERS,
  MOCK_ORGANIZATION,
  MOCK_ORGANIZATION_DOCUMENTS,
  MOCK_ORGANIZATION_MEETINGS,
  MOCK_ORGANIZATION_TRANSACTIONS,
} from "@src/features/organization/mockData";
import { MeetingStatus, TransactionStatus } from "@src/features/organization/types";
import { Outlet, useParams } from "react-router";

import styles from "./OrganizationLayout.module.css";

// タブ横の件数バッジ. 「文書: 文書の数」「会計: 完了又は却下となったもの以外の
// 数」「会議: 現在予定されている会議の数」「構成員: 構成員の数」という依頼のため,
// MOCK_TAB_COUNTS (ダミーの固定値) はやめ, 実在するモックデータから算出する.
// 「現在予定されている会議」は, 流会 (Canceled, 開催されない) を除いた,
// 開催日時 (startsAt) が現在より後の会議とみなしている — 延会 (Postponed)
// は日程こそ動くもののまだ開催予定であることに変わりないため対象に含めている
function getOrganizationTabCounts(organizationId: string) {
  const documentCount = MOCK_ORGANIZATION_DOCUMENTS.filter(
    (document) => document.organizationId === organizationId,
  ).length;

  const bookCount = MOCK_ORGANIZATION_TRANSACTIONS.filter(
    (transaction) =>
      transaction.organizationId === organizationId &&
      transaction.status !== TransactionStatus.Completed &&
      transaction.status !== TransactionStatus.Denied,
  ).length;

  const now = new Date();
  const meetingCount = MOCK_ORGANIZATION_MEETINGS.filter(
    (meeting) =>
      meeting.organizationId === organizationId &&
      meeting.status !== MeetingStatus.Canceled &&
      new Date(meeting.startsAt) >= now,
  ).length;

  const memberCount = MOCK_MEMBERS.filter(
    (member) => member.organizationId === organizationId,
  ).length;

  return { documentCount, bookCount, meetingCount, memberCount };
}

// /orgs/:orgId 配下のページ共通のレイアウト. OrganizationTabs (概要/文書/会計/会議/
// 構成員/設定) はどのタブを開いていても常に表示するため, 個々のページではなく
// ここでまとめて描画する
function OrganizationLayout() {
  const { orgId } = useParams();

  if (orgId !== MOCK_ORGANIZATION.id) {
    return <p className={styles.notFound}>組織が見つかりません.</p>;
  }

  const { documentCount, bookCount, meetingCount, memberCount } =
    getOrganizationTabCounts(MOCK_ORGANIZATION.id);

  return (
    <>
      <HeaderBottomPortal>
        <OrganizationTabs
          organizationId={MOCK_ORGANIZATION.id}
          documentCount={documentCount}
          bookCount={bookCount}
          meetingCount={meetingCount}
          memberCount={memberCount}
        />
      </HeaderBottomPortal>
      <Outlet />
    </>
  );
}

export { OrganizationLayout };
