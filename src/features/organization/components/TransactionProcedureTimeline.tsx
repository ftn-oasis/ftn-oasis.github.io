import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCircleCheckFilled, IconCircleXFilled, IconUser } from "@tabler/icons-react";
import clsx from "clsx";

import { resolveMemberId } from "../resolveMemberId";
import {
  type TransactionProcedureStep,
  TransactionProcedureStepKey,
} from "../types";

import styles from "./TransactionProcedureTimeline.module.css";

// 過去の完了済手順のアイコンサイズ (「最近のもの以外は24pxにしてほしい」という
// 依頼のため). 直近 (最後に完了した手順) は 30px (「最近のものは30px x 30pxの
// 大きさにしてほしい」という依頼のため)
const PAST_ICON_SIZE = 24;
const CURRENT_ICON_SIZE = 30;

type TransactionProcedureTimelineProps = {
  procedure: TransactionProcedureStep[];
};

// 手続状況タブ (/orgs/:orgId/book/:transactionId/procedure) の本文.
// 縦のタイムラインで, 手順を専用の矢印 (IconArrowDown などの汎用アイコンでは
// なく, 線+CSSで描いた矢頭) で繋いで時系列順に表示する. 未完了の手順はただの円,
// 完了済は緑のチェック, 却下は赤いバツで表現する (却下の場合は起案の直後で
// 手順自体がそこで打ち切られている — 生成側の generateTransactionProcedure@
// mockData.ts を参照).
//
// 「最後の完了のチェックマーク以外はsubtext0色に」「チェックマークは最近の
// もの以外大きさを24pxに」「最近のものは30px x 30pxに」という依頼により,
// 手順のうち直近 (時系列で最後に完了した1件, denied を含む) だけを通常の色+
// 通常サイズで強調し, それより前の完了済の手順は円 (アイコン色+サイズ)・
// ラベル・日時+担当者のすべてを --color-body-subtext0 (通常の subtext よりさらに
// 控えめな色)/24px に落として背景に退かせる — 「現在の状態」だけが目立つ表示に
// している. 未完了の手順の見た目 (ただの円, ラベルは通常色) はこの対象外.
//
// **円 (.circle) は 16/24/30px とサイズが混在するが, 常に固定の CIRCLE_BOX_SIZE
// (30px) のボックスとして描画し, 中身のアイコンをその中で中央寄せしている**
// — サイズを可変にすると, 各行の .rail の実効幅がその行の円のサイズにしか
// 合わせて自動計算されず (rail 同士は独立したフレックスコンテナのため),
// 円によって中心の横位置がずれてしまう不具合になっていました (「最近の
// チェックマークの中心と他のチェックマーク・矢印の中心がズレている」という
// 指摘はこれです) — 全ての円のボックスを同じ固定サイズにすることで,
// .rail の中央寄せが常に同じ横位置になるよう修正しています.
//
// **矢印は「前段階の円の縁から次の円の縁まで伸びる」よう, かつ「円の縦方向の
// 中心が, その手順のラベル上端〜日時+担当者下端の中心と一致する」よう,
// 各行の .rail を [前の円からの矢印 (無ければ透明なスペーサー) / 円 /
// 次の円への矢印 (無ければ透明なスペーサー)] の3つを縦に並べた構成にしている
// — 前後どちらも flex: 1 1 auto で均等に伸びるため, 円は自動的に .rail
// (= .stepBody と同じ高さ) の縦方向中央に来る. 1つの矢印は隣り合う2行の
// 「次の円への矢印」(線のみ) と「前の円からの矢印」(線+矢頭) の2つの要素を
// 繋げて見せている (行同士に隙間が無いため, 見た目には1本の連続した矢印になる.
// 矢頭は「これから到達する円」側 = 後続行の「前の円からの矢印」にだけ付けている)
function TransactionProcedureTimeline({
  procedure,
}: TransactionProcedureTimelineProps) {
  const lastCompletedIndex = procedure.reduce(
    (last, step, index) => (step.completed ? index : last),
    -1,
  );

  return (
    <div className={styles.root}>
      {procedure.map((step, index) => {
        const isDenied = step.key === TransactionProcedureStepKey.Denied;
        const isCurrent = index === lastCompletedIndex;
        const isPast = step.completed && !isCurrent;
        // このステップの円に到達する矢印 (rail 前半, 前の円からの矢印) は,
        // このステップ自身が直近 (現在の状態) の場合だけ subtext0 にする —
        // 「最近のチェックマークに伸びる矢印もsubtext0色にしてほしい」
        // という依頼のため. 次のステップへ向かう矢印 (rail 後半) は,
        // 次のステップが直近かどうかで判定する (同じ1本の矢印を隣り合う
        // 2行に分けて描画しているため, 両側で同じ判定結果になる)
        const approachIsToCurrent = index === lastCompletedIndex;
        const departIsToCurrent = index + 1 === lastCompletedIndex;

        return (
          <div className={styles.step} key={step.key}>
            <div className={styles.rail}>
              {index > 0 ? (
                <span
                  className={clsx(
                    styles.connector,
                    approachIsToCurrent && styles.connectorMuted,
                  )}
                >
                  <span className={styles.connectorLine} />
                  <span className={styles.connectorArrowhead} />
                </span>
              ) : (
                <span className={styles.connectorSpacer} />
              )}

              <span className={styles.circle}>
                {isDenied ? (
                  <Icon
                    icon={IconCircleXFilled}
                    size={isPast ? PAST_ICON_SIZE : CURRENT_ICON_SIZE}
                    aria-hidden="true"
                    className={isPast ? styles.circleMuted : styles.circleDenied}
                  />
                ) : step.completed ? (
                  <Icon
                    icon={IconCircleCheckFilled}
                    size={isPast ? PAST_ICON_SIZE : CURRENT_ICON_SIZE}
                    aria-hidden="true"
                    className={isPast ? styles.circleMuted : styles.circleCompleted}
                  />
                ) : (
                  <span className={styles.circleIncomplete} />
                )}
              </span>

              {index < procedure.length - 1 ? (
                <span
                  className={clsx(
                    styles.connector,
                    departIsToCurrent && styles.connectorMuted,
                  )}
                >
                  <span className={styles.connectorLine} />
                </span>
              ) : (
                <span className={styles.connectorSpacer} />
              )}
            </div>

            <div className={styles.stepBody}>
              <span className={clsx(styles.label, isPast && styles.labelMuted)}>
                {step.label}
              </span>
              {step.completed && (
                <span className={clsx(styles.meta, isPast && styles.metaMuted)}>
                  <Icon icon={IconUser} size={14} aria-hidden="true" />
                  {step.actorName && (
                    <UserNameLink
                      userId={resolveMemberId(step.actorName)}
                      name={step.actorName}
                    />
                  )}{" "}
                  ・ {step.occurredAt}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { TransactionProcedureTimeline };
