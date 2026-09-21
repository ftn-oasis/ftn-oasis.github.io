import { Icon } from "@src/components/ui/Icon";
import { UserNameLink } from "@src/components/ui/UserNameLink";
import { IconCircle, IconUser } from "@tabler/icons-react";
import clsx from "clsx";

import type { DocumentVersion } from "../types";

import styles from "./DocumentVersionTimeline.module.css";

// 選択中以外の版のアイコンサイズ (TransactionProcedureTimeline の
// PAST_ICON_SIZE と同じ考え方. 選択中は CSS (.circleRing, 30px四方) 側で
// サイズを決めるため, こちらのサイズ定数は不要)
const PAST_ICON_SIZE = 24;

type DocumentVersionTimelineProps = {
  // 古い順 (versions[0] が初版)
  versions: DocumentVersion[];
  selectedVersionId: string;
  onSelect: (versionId: string) => void;
};

// 版タブ (/orgs/:orgId/documents/:documentId/versions) のタイムライン.
// 「../../book/会計処理ID/procedureのタイムラインを逆転させ, アイコンを
// 塗り潰しの丸にしてほしい」という依頼のため, TransactionProcedureTimeline
// と同じ構造 (rail+円+矢印+stepBody) を踏襲しつつ, (1) 新しい順に表示,
// (2) 完了/却下/未完了の区別が無い (版は全て確定済みの事実) ため, 選択中の
// 版だけを強調する2種類の円のみ, (3) タイトルは手順名ではなく編集日時, 下に
// 編集者名, (4) 各行はクリック可能なボタンにして, 選択中の版 (＝左側の
// ビューワに表示する版) を強調する — という差分がある.
//
// 「矢印は下から上に伸びるようにしてほしい (新しい版が上に来る表示なので,
// 古い版→新しい版の順で矢印が上向きに進む)」という依頼のため, 矢印の向きを
// 逆転させています — 1本の矢印を隣り合う2行に分けて描画する構造自体は
// TransactionProcedureTimeline と同じですが, 矢頭を後半 (円の下, 次の円へ
// 向かう側) に置き, 上向きに描画しています (以前は前半 = 円の上に矢頭を
// 置き, 下向きでした)
function DocumentVersionTimeline({
  versions,
  selectedVersionId,
  onSelect,
}: DocumentVersionTimelineProps) {
  const reversed = [...versions].reverse();

  return (
    <div className={styles.root}>
      {reversed.map((version, index) => {
        const isSelected = version.id === selectedVersionId;

        return (
          <button
            type="button"
            key={version.id}
            className={styles.step}
            onClick={() => onSelect(version.id)}
            aria-pressed={isSelected}
          >
            <div className={styles.rail}>
              {index > 0 ? (
                <span className={styles.connector}>
                  <span className={styles.connectorLine} />
                </span>
              ) : (
                <span className={styles.connectorSpacer} />
              )}

              <span className={styles.circle}>
                {isSelected ? (
                  <span className={styles.circleRing}>
                    <span className={styles.circleRingDot} />
                  </span>
                ) : (
                  <Icon
                    icon={IconCircle}
                    size={PAST_ICON_SIZE}
                    aria-hidden="true"
                    className={styles.circleMuted}
                  />
                )}
              </span>

              {index < reversed.length - 1 ? (
                <span className={styles.connector}>
                  <span className={styles.connectorArrowhead} />
                  <span className={styles.connectorLine} />
                </span>
              ) : (
                <span className={styles.connectorSpacer} />
              )}
            </div>

            <div className={styles.stepBody}>
              <span className={clsx(styles.label, !isSelected && styles.labelMuted)}>
                {version.editedAt}
              </span>
              <span className={clsx(styles.meta, !isSelected && styles.metaMuted)}>
                <Icon icon={IconUser} size={14} aria-hidden="true" />
                <UserNameLink
                  userId={version.editor.id}
                  name={version.editor.name}
                  // 版タイムラインの各行自体がボタン (版を選択する) のため,
                  // クリックが親のボタンまでバブリングして選択操作が二重に
                  // 発火しないようにする
                  onClick={(event) => event.stopPropagation()}
                />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { DocumentVersionTimeline };
