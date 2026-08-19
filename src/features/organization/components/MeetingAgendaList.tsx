import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconTriangle, IconUser, IconX } from "@tabler/icons-react";
import { Link } from "react-router";

import { resolveMemberId } from "../resolveMemberId";
import {
  AgendaItemVoteResult,
  type MeetingAgendaItem,
  type MeetingMaterial,
} from "../types";

import styles from "./MeetingAgendaList.module.css";

type MeetingAgendaListProps = {
  agenda: MeetingAgendaItem[];
  materials: MeetingMaterial[];
  organizationId: string;
  meetingId: string;
};

// 議決結果アイコン — 否決は赤い IconX, 延会は subtext1 色の IconTriangle.
// 可決/議決の概念が無い (voteResult が undefined) 場合はどちらも表示しない
// (依頼で明示的にアイコンが指定されたのは否決/延会の2つだけのため)
function VoteResultIcon({ voteResult }: { voteResult?: AgendaItemVoteResult }) {
  if (voteResult === AgendaItemVoteResult.Rejected) {
    return (
      <Icon
        icon={IconX}
        size={16}
        aria-label="否決"
        className={styles.voteRejected}
      />
    );
  }
  if (voteResult === AgendaItemVoteResult.Postponed) {
    return (
      <Icon
        icon={IconTriangle}
        size={16}
        aria-label="延会"
        className={styles.votePostponed}
      />
    );
  }
  return null;
}

// 議題タブ (/orgs/:orgId/meetings/:meetingId) の本文. リスト形式で議題を
// 番号付きで表示する, ボーダー付き Box (角丸は「リストの角は既定で
// 丸めてほしい」という標準方針のため). 「議題の項目を, 資料タブの対応する
// 議題の一番上の資料を開くリンクにしてほしい」という依頼のため, その議題に
// 資料が1件以上あればリンク (?material=<資料ID> 付きで資料タブへ遷移し,
// MeetingMaterialsExplorer 側でその資料を開いた状態にする) にし, 資料が
// 無い議題はこれまで通り plain text のままにする. 議決結果アイコン
// (VoteResultIcon) は番号の隣, 右端には提出者の名前+役職 (IconUser 付き)
// を表示する
function MeetingAgendaList({
  agenda,
  materials,
  organizationId,
  meetingId,
}: MeetingAgendaListProps) {
  return (
    <div className={styles.root}>
      {agenda.map((item, index) => {
        const firstMaterial = materials.find(
          (material) => material.agendaItem === item.label,
        );

        return (
          <div className={styles.item} key={item.label}>
            <div className={styles.main}>
              <span className={styles.index}>{index + 1}.</span>
              <VoteResultIcon voteResult={item.voteResult} />
              {firstMaterial ? (
                <Link
                  to={`/orgs/${organizationId}/meetings/${meetingId}/materials?material=${firstMaterial.id}`}
                  className={styles.link}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={styles.label}>{item.label}</span>
              )}
            </div>

            <span className={styles.submitter}>
              <Icon icon={IconUser} size={14} aria-hidden="true" />
              <UserNameLink
                userId={resolveMemberId(item.submitterName)}
                name={item.submitterName}
              />{" "}
              ({item.submitterRole})
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { MeetingAgendaList };
