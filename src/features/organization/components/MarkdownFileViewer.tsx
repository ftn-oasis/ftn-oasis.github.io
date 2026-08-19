import { Icon } from "@src/components/ui/Icon";
import { IconCode, IconEye } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

import { MarkdownDocument } from "./MarkdownDocument";

import styles from "./MarkdownFileViewer.module.css";

const MarkdownViewMode = {
  Preview: "preview",
  Source: "source",
} as const;

type MarkdownViewMode = (typeof MarkdownViewMode)[keyof typeof MarkdownViewMode];

type MarkdownFileViewerProps = {
  source: string;
  // トグルの左横に左詰めで表示する文書名
  title: string;
  // false のとき外枠のボーダー/角丸/背景を描画しない — 呼び出し側 (サイドバー
  // +メインの MeetingMaterialsExplorer/MeetingMinutesExplorer の複数開催回
  // ケースなど) が既に外枠を持っており, 二重に囲われてしまう場合に使う.
  // ツールバーと本文の分割 (border-bottom) 自体はこの場合も維持する
  bordered?: boolean;
};

// Markdown ファイルの表示 (資料タブ/議事録タブで共通利用). 上部に文書名
// (左詰め) + プレビュー/ソースの切り替えトグル (IconEye/IconCode,
// ViewModeToggle と同じスライド式) を配置し, 既定はプレビュー
// (MarkdownDocument) — 依頼により「プレビューを標準」としている.
// 「書類本文と文書名･トグルスイッチはリストのヘッダーと要素のように完全に
// 分割し, その高さをリストのそれと等しくしてほしい」という依頼のため,
// DocumentListBox 等の一覧 Box と同じ構造 (外枠のボーダー付き Box +
// 背景色付きの .toolbar (高さ/padding も一覧の .toolbar と同じ 8px 16px) +
// 本文側の .content) にしている. ソース表示は整形前の生の Markdown を
// そのまま等幅フォントで表示するだけ (資料タブの text 種別と同じ
// .textPreview 相当の見た目)
function MarkdownFileViewer({ source, title, bordered = true }: MarkdownFileViewerProps) {
  const [mode, setMode] = useState<MarkdownViewMode>(MarkdownViewMode.Preview);

  return (
    <div className={clsx(styles.root, !bordered && styles.borderless)}>
      <div className={styles.toolbar}>
        <span className={styles.title}>{title}</span>
        <div className={styles.toggleRoot}>
          <div
            className={clsx(
              styles.indicator,
              mode === MarkdownViewMode.Source && styles.indicatorSource,
            )}
            aria-hidden="true"
          />
          <button
            type="button"
            aria-label="プレビューを表示"
            aria-pressed={mode === MarkdownViewMode.Preview}
            onClick={() => setMode(MarkdownViewMode.Preview)}
            className={styles.toggleButton}
          >
            <Icon icon={IconEye} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="ソースを表示"
            aria-pressed={mode === MarkdownViewMode.Source}
            onClick={() => setMode(MarkdownViewMode.Source)}
            className={styles.toggleButton}
          >
            <Icon icon={IconCode} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {mode === MarkdownViewMode.Preview ? (
          <MarkdownDocument source={source} />
        ) : (
          <pre className={styles.sourceView}>{source}</pre>
        )}
      </div>
    </div>
  );
}

export { MarkdownFileViewer };
