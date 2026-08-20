import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MarkdownFileViewer } from "@src/features/organization/components/MarkdownFileViewer";
import {
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconFolder,
  IconFolderOpen,
} from "@tabler/icons-react";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Link } from "react-router";

import { MOCK_MATERIAL_DOCUMENTS, resolveDisplayableDocument } from "../mockData";
import type { MaterialDocument } from "../types";

import styles from "./MaterialsExplorer.module.css";

type MaterialTreeNode = MaterialDocument & { children: MaterialTreeNode[] };

// フラットな配列 (同じセクション内のものだけを渡す前提) から親子関係の木を組み立てる
function buildTree(documents: MaterialDocument[]): MaterialTreeNode[] {
  const nodeByKey = new Map<string, MaterialTreeNode>(
    documents.map((document) => [document.key, { ...document, children: [] }]),
  );
  const roots: MaterialTreeNode[] = [];

  for (const document of documents) {
    const node = nodeByKey.get(document.key);
    if (!node) continue;
    const parent = document.parentKey ? nodeByKey.get(document.parentKey) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// selectedDocument から親をたどり, 祖先の key をすべて返す (サイドバーの
// 初期展開状態に使う)
function getAncestorKeys(
  document: MaterialDocument | undefined,
  allDocuments: MaterialDocument[],
): string[] {
  const keys: string[] = [];
  let current = document;
  while (current?.parentKey) {
    const parent = allDocuments.find((candidate) => candidate.key === current?.parentKey);
    if (!parent) break;
    keys.push(parent.key);
    current = parent;
  }
  return keys;
}

type MaterialTreeItemProps = {
  node: MaterialTreeNode;
  depth: number;
  selectedDocumentKey: string;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
};

// ツリーの1行. 子を持つ文書は「開閉トグル」+「その文書自体 (または, content
// を持たないただのグループの場合は最初の子文書) を開くリンク」の両方を兼ねる.
// アイコンは, 子の有無だけでなく自分自身が content を持つかどうかでも変わる —
// content を持つ文書 (子の有無を問わず, 会則･協定･資料2のような例) は常に
// IconFileText, content を持たない (単なるグルーピングのための) 節目だけ
// IconFolder/IconFolderOpen になる
function MaterialTreeItem({
  node,
  depth,
  selectedDocumentKey,
  expandedKeys,
  onToggle,
}: MaterialTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const hasOwnContent = node.content !== undefined;
  const icon = hasOwnContent
    ? IconFileText
    : isExpanded
      ? IconFolderOpen
      : IconFolder;
  const linkTargetKey = resolveDisplayableDocument(node).key;

  return (
    <div>
      <div className={styles.treeRow} style={{ "--depth": depth } as CSSProperties}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.key)}
            aria-label={isExpanded ? "折りたたむ" : "展開する"}
            aria-expanded={isExpanded}
            className={styles.chevronButton}
          >
            <Icon
              icon={isExpanded ? IconChevronDown : IconChevronRight}
              size={14}
              aria-hidden="true"
              className={styles.chevron}
            />
          </button>
        ) : (
          <span className={styles.chevronSpacer} aria-hidden="true" />
        )}
        <Link
          to={`/materials/${linkTargetKey}`}
          className={clsx(
            menuItemBase.root,
            styles.fileLink,
            // content を持たないグループ自身は選択状態になり得ないため,
            // (resolve 後の linkTargetKey ではなく) node 自身の key で比較する
            node.key === selectedDocumentKey && menuItemBase.active,
          )}
        >
          <Icon icon={icon} size={16} aria-hidden="true" className={styles.nodeIcon} />
          <span>{node.title}</span>
        </Link>
      </div>

      {hasChildren &&
        isExpanded &&
        node.children.map((child) => (
          <MaterialTreeItem
            key={child.key}
            node={child}
            depth={depth + 1}
            selectedDocumentKey={selectedDocumentKey}
            expandedKeys={expandedKeys}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

type MaterialsExplorerProps = {
  selectedDocumentKey: string;
};

// 文書詳細ページ (/materials/:documentKey) 下部の, GitHub のファイル
// ビューワを参考にしたサイドバー+メイン構成. 「文書閲覧画面では, 規則, 資料
// がそれぞれルートとして表示され, 一つのサイドバーで規則と資料の間を移動する
// ことができるようにリンクが配置されることが無いようにしてほしい」という
// 依頼のため, 「規則」「資料」を並べたフォルダ選択は行わず, 選択中の文書が
// 属するセクションの文書だけを (親子関係の入れ子構造のまま) サイドバーに
// 表示する — セクションをまたいだ移動はできない (ホームに一度戻る必要がある)
function MaterialsExplorer({ selectedDocumentKey }: MaterialsExplorerProps) {
  const selectedDocument = MOCK_MATERIAL_DOCUMENTS.find(
    (document) => document.key === selectedDocumentKey,
  );

  const sectionDocuments = selectedDocument
    ? MOCK_MATERIAL_DOCUMENTS.filter(
        (document) => document.sectionKey === selectedDocument.sectionKey,
      )
    : [];
  const tree = buildTree(sectionDocuments);

  // 初期状態は選択中の文書の祖先だけを開く (MeetingMaterialsExplorer の
  // 「初期状態は先頭の議題グループだけ展開」と同じ考え方)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(getAncestorKeys(selectedDocument, sectionDocuments)),
  );

  const toggleKey = (key: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar} aria-label="規則・資料">
        {tree.map((node) => (
          <MaterialTreeItem
            key={node.key}
            node={node}
            depth={0}
            selectedDocumentKey={selectedDocumentKey}
            expandedKeys={expandedKeys}
            onToggle={toggleKey}
          />
        ))}
      </nav>

      <div className={styles.main}>
        {/* MaterialDetailPage が content を持つ文書に解決した上で
            selectedDocumentKey を渡すため, ここに到達する時点で content が
            無いことは通常無い (万一に備えた防御的な分岐) */}
        {!selectedDocument || selectedDocument.content === undefined ? (
          <p className={styles.empty}>文書がありません.</p>
        ) : (
          <div className={styles.markdownContent}>
            <MarkdownFileViewer
              source={selectedDocument.content}
              title={`${selectedDocument.title}.md`}
              bordered={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { MaterialsExplorer };
