import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { IconNotes } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

import type { MeetingMinutes } from "../types";
import { MarkdownFileViewer } from "./MarkdownFileViewer";

import styles from "./MeetingMinutesExplorer.module.css";

type MeetingMinutesExplorerProps = {
  minutes: MeetingMinutes[];
};

// 議事録タブ (/orgs/:orgId/meetings/:meetingId/minutes) の本文.
// 「資料と同じ形式で示してほしい」という依頼のため, MeetingMaterialsExplorer
// と同じ左サイドバー+右メインの構成を土台にしていますが, ディレクトリツリー
// (議題ごとのグルーピング/開閉) は無く, 開催回 (MeetingMinutes) をそのまま
// 縦一列に並べるだけの単純なリストです. **「会議が1度のときはサイドバーを
// 表示せず, 2回以上開催されたときにサイドバーが出現するようにしてほしい」**
// という依頼のため, minutes.length に応じて構成そのものを出し分けています
// — 1件のときは選ぶ必要が無いため, サイドバー無しの単一 Box で本文をそのまま
// 表示します. 本文 (content) は「議事録のmdファイル」の書式 (frontmatter +
// 発言者形式の本文, minutesMarkdown.ts を参照) のため MarkdownFileViewer
// (プレビュー/ソース切り替え付き) で描画する — frontmatter 自体が
// タイトル/日時/場所/議長/記録などを表示するため, サイドバー選択用の
// 「第N回 日時」ラベル以外に, メイン側で改めて見出しを重ねて表示していない
function MeetingMinutesExplorer({ minutes }: MeetingMinutesExplorerProps) {
  const [selectedId, setSelectedId] = useState(minutes[0]?.id);
  const selected = minutes.find((item) => item.id === selectedId) ?? minutes[0];

  if (!selected) {
    return <p className={styles.empty}>議事録がありません.</p>;
  }

  // サイドバーが無い (会議が1度だけの) 場合は, MarkdownFileViewer 自身の
  // 外枠がそのまま唯一の Box になる — 「2重に囲われてしまっている」という
  // 指摘のため, 以前あった枠+padding だけの外側ラッパーは廃止した
  if (minutes.length < 2) {
    return (
      <MarkdownFileViewer
        source={selected.content}
        title={`議事録_${selected.sessionLabel}.md`}
      />
    );
  }

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar} aria-label="議事録">
        {minutes.map((item) => (
          <button
            key={item.id}
            type="button"
            className={clsx(
              menuItemBase.root,
              item.id === selectedId && menuItemBase.active,
            )}
            onClick={() => setSelectedId(item.id)}
          >
            <Icon icon={IconNotes} size={16} aria-hidden="true" />
            <span className={styles.sessionLabel}>
              {item.sessionLabel}
              <span className={styles.sessionDate}>{item.occurredAt}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className={styles.main}>
        <MarkdownFileViewer
          source={selected.content}
          title={`議事録_${selected.sessionLabel}.md`}
          bordered={false}
        />
      </div>
    </div>
  );
}

export { MeetingMinutesExplorer };
