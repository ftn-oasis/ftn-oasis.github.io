import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import {
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconFileTypePdf,
  IconFolder,
  IconFolderOpen,
  IconMarkdown,
  IconVideo,
  type TablerIcon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { useSearchParams } from "react-router";

import {
  type MeetingAgendaItem,
  type MeetingMaterial,
  MeetingMaterialFileType,
  type OrganizationTransaction,
} from "../types";
import { EmbeddedTransactionView } from "./EmbeddedTransactionView";
import { MarkdownFileViewer } from "./MarkdownFileViewer";

import styles from "./MeetingMaterialsExplorer.module.css";

const FILE_ICON: Record<MeetingMaterialFileType, TablerIcon> = {
  [MeetingMaterialFileType.Pdf]: IconFileTypePdf,
  [MeetingMaterialFileType.Markdown]: IconMarkdown,
  [MeetingMaterialFileType.Text]: IconFileText,
  [MeetingMaterialFileType.Video]: IconVideo,
  [MeetingMaterialFileType.Transaction]: IconFileText,
};

const FILE_TYPE_LABEL: Record<MeetingMaterialFileType, string> = {
  [MeetingMaterialFileType.Pdf]: "PDF",
  [MeetingMaterialFileType.Markdown]: "Markdown",
  [MeetingMaterialFileType.Text]: "テキスト",
  [MeetingMaterialFileType.Video]: "動画",
  [MeetingMaterialFileType.Transaction]: "会計処理",
};

// 議題ごとに資料をグルーピングする. meeting.agenda の順序をそのまま使い,
// 資料が無い議題はサイドバーに出さない
function groupMaterialsByAgenda(
  materials: MeetingMaterial[],
  agenda: MeetingAgendaItem[],
): { agendaItem: string; materials: MeetingMaterial[] }[] {
  return agenda
    .map((item) => ({
      agendaItem: item.label,
      materials: materials.filter(
        (material) => material.agendaItem === item.label,
      ),
    }))
    .filter((group) => group.materials.length > 0);
}

type MeetingMaterialsExplorerProps = {
  agenda: MeetingAgendaItem[];
  materials: MeetingMaterial[];
  transactions: OrganizationTransaction[];
};

// 資料タブ (/orgs/:orgId/meetings/:meetingId/materials) の本文. GitHub の
// ファイルビューワを参考に, 左にサイドバー (議題ごとのディレクトリツリー,
// 開閉可能)/右にメイン (選択中の資料のプレビュー) を配置する
function MeetingMaterialsExplorer({
  agenda,
  materials,
  transactions,
}: MeetingMaterialsExplorerProps) {
  const groups = groupMaterialsByAgenda(materials, agenda);

  // 議題タブの各項目 (MeetingAgendaList) が ?material=<資料ID> 付きで
  // このタブへリンクしているため, 指定があればその資料を初期選択状態にし,
  // 属する議題のグループも開いておく (無ければ従来通り先頭の議題グループ+
  // その最初の資料)
  const [searchParams] = useSearchParams();
  const linkedMaterialId = searchParams.get("material") ?? undefined;
  const linkedMaterial = materials.find(
    (material) => material.id === linkedMaterialId,
  );

  const [expandedAgendaItems, setExpandedAgendaItems] = useState<Set<string>>(
    () =>
      new Set(
        linkedMaterial
          ? [linkedMaterial.agendaItem]
          : groups.slice(0, 1).map((group) => group.agendaItem),
      ),
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>(
    linkedMaterial?.id ?? groups[0]?.materials[0]?.id,
  );

  const toggleAgendaItem = (agendaItem: string) => {
    setExpandedAgendaItems((current) => {
      const next = new Set(current);
      if (next.has(agendaItem)) {
        next.delete(agendaItem);
      } else {
        next.add(agendaItem);
      }
      return next;
    });
  };

  const selectedMaterial = materials.find(
    (material) => material.id === selectedMaterialId,
  );

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar} aria-label="資料">
        {groups.map((group) => {
          const isExpanded = expandedAgendaItems.has(group.agendaItem);
          return (
            <div key={group.agendaItem}>
              <button
                type="button"
                className={menuItemBase.root}
                onClick={() => toggleAgendaItem(group.agendaItem)}
              >
                <Icon
                  icon={isExpanded ? IconChevronDown : IconChevronRight}
                  size={14}
                  aria-hidden="true"
                  className={styles.chevron}
                />
                <Icon
                  icon={isExpanded ? IconFolderOpen : IconFolder}
                  size={16}
                  aria-hidden="true"
                />
                <span>{group.agendaItem}</span>
              </button>

              {isExpanded &&
                group.materials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    className={clsx(
                      menuItemBase.root,
                      styles.fileRow,
                      material.id === selectedMaterialId && menuItemBase.active,
                    )}
                    onClick={() => setSelectedMaterialId(material.id)}
                  >
                    <Icon
                      icon={FILE_ICON[material.fileType]}
                      size={16}
                      aria-hidden="true"
                    />
                    <span>{material.name}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </nav>

      <div className={styles.main}>
        {!selectedMaterial ? (
          <p className={styles.empty}>資料がありません.</p>
        ) : selectedMaterial.fileType === MeetingMaterialFileType.Transaction ? (
          (() => {
            const transaction = transactions.find(
              (candidate) => candidate.id === selectedMaterial.transactionId,
            );
            return transaction ? (
              <EmbeddedTransactionView transaction={transaction} />
            ) : (
              <p className={styles.empty}>会計処理が見つかりません.</p>
            );
          })()
        ) : selectedMaterial.fileType === MeetingMaterialFileType.Markdown ? (
          // Markdown は MarkdownFileViewer 自身のツールバーが文書名を表示する
          // ため, 他の種別のような外側の見出し (.materialName) は重ねていない.
          // bordered={false} + .markdownContent (.main の padding を打ち消す
          // 負の margin) で, .root の外枠だけが唯一の Box になるようにしている
          // (2重に囲われる不具合を避けるため)
          <div className={styles.markdownContent}>
            <MarkdownFileViewer
              source={selectedMaterial.content ?? ""}
              title={selectedMaterial.name}
              bordered={false}
            />
          </div>
        ) : (
          <>
            <h2 className={styles.materialName}>
              <Icon
                icon={FILE_ICON[selectedMaterial.fileType]}
                size={20}
                aria-hidden="true"
              />
              {selectedMaterial.name}
            </h2>

            {selectedMaterial.fileType === MeetingMaterialFileType.Pdf ||
            selectedMaterial.fileType === MeetingMaterialFileType.Video ? (
              <div className={styles.preview}>
                <Icon
                  icon={FILE_ICON[selectedMaterial.fileType]}
                  size={48}
                  aria-hidden="true"
                />
                <span className={styles.previewLabel}>
                  {FILE_TYPE_LABEL[selectedMaterial.fileType]}のプレビュー
                </span>
              </div>
            ) : (
              <pre className={styles.textPreview}>{selectedMaterial.content}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { MeetingMaterialsExplorer };
