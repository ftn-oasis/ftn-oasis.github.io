import { UserNameLink } from "@src/components/ui/UserNameLink";
import clsx from "clsx";
import { Fragment, type ReactNode, useMemo } from "react";

import {
  type MarkdownBlock,
  type MinutesFrontmatter,
  type MinutesSpeaker,
  parseMarkdownDocument,
} from "../minutesMarkdown";
import { resolveMemberId } from "../resolveMemberId";

import styles from "./MarkdownDocument.module.css";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const HEADING_LEVEL_CLASS = [
  styles.heading1,
  styles.heading2,
  styles.heading3,
  styles.heading4,
  styles.heading5,
  styles.heading6,
];

// 本文中の @mention (`@id`)/太字 (`**text**`)/コード (`` `text` ``) を検出して
// React ノードに変換する. @mention は frontmatter の speakers に一致すれば
// 名前で置き換え, 一致しなければ id をそのまま表示する
const INLINE_TOKEN_PATTERN = /@([\w-]+)|\*\*([^*]+)\*\*|`([^`]+)`/g;

function renderInline(
  text: string,
  speakers: Record<string, MinutesSpeaker>,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const [, mentionId, bold, code] = match;
    if (mentionId !== undefined) {
      const speaker = speakers[mentionId];
      const name = speaker ? speaker.name : mentionId;
      nodes.push(
        <UserNameLink
          key={key++}
          userId={resolveMemberId(name)}
          name={`@${name}`}
          className={styles.mention}
        />,
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else if (code !== undefined) {
      nodes.push(
        <code key={key++} className={styles.code}>
          {code}
        </code>,
      );
    }
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}

function resolveName(
  id: string | undefined,
  speakers: Record<string, MinutesSpeaker>,
): string | undefined {
  if (!id) return undefined;
  return speakers[id]?.name ?? id;
}

type FrontmatterHeaderProps = {
  frontmatter: MinutesFrontmatter;
};

// 議事録の frontmatter (meeting_id/title/date/time/place/chair/recorder/
// speakers/attendees/absentees) を要約したヘッダー. 議事録以外の一般的な
// Markdown 資料には frontmatter が無いため, その場合は MarkdownDocument 側で
// そもそも描画しない. 「開催場所や出席者についてもバッジではなく箇条書きで
// 示してほしい」「公開範囲はメタデータに記載しないでほしい」という依頼のため,
// Label/チップは使わず1つの箇条書き (.metaList) にまとめている (visibility
// は意図的に含めていない). 「議事録は全て逐語録なので, yamlの部分から
// 逐語録か要約録かの別を取り払ってほしい」という依頼により, 文書の種別
// (旧 verbatim) の行も無い — frontmatter 自体がこのフィールドを持たなく
// なったため (minutesMarkdown.ts を参照)
// 出席者/欠席者は複数名を「、」区切りで並べる. 文字列に join せず, 1人ずつ
// UserNameLink に変換してから区切り文字を挟むことで, 各名前を個別のリンクに
// できるようにしている
function NameList({
  ids,
  speakers,
}: {
  ids: string[];
  speakers: Record<string, MinutesSpeaker>;
}) {
  return (
    <>
      {ids.map((id, index) => {
        const name = speakers[id]?.name ?? id;
        return (
          <Fragment key={id}>
            {index > 0 && "、"}
            <UserNameLink userId={resolveMemberId(name)} name={name} />
          </Fragment>
        );
      })}
    </>
  );
}

function FrontmatterHeader({ frontmatter }: FrontmatterHeaderProps) {
  const chairName = resolveName(frontmatter.chair, frontmatter.speakers);
  const recorderName = resolveName(frontmatter.recorder, frontmatter.speakers);

  return (
    <div className={styles.frontmatter}>
      {frontmatter.title && <h1 className={styles.title}>{frontmatter.title}</h1>}

      <ul className={styles.metaList}>
        {frontmatter.date && (
          <li>
            日時: {frontmatter.date}
            {frontmatter.time ? ` ${frontmatter.time}` : ""}
          </li>
        )}
        {frontmatter.place && <li>開催場所: {frontmatter.place}</li>}
        {chairName && (
          <li>
            議長: <UserNameLink userId={resolveMemberId(chairName)} name={chairName} />
          </li>
        )}
        {recorderName && (
          <li>
            記録:{" "}
            <UserNameLink userId={resolveMemberId(recorderName)} name={recorderName} />
          </li>
        )}
        {frontmatter.attendees.length > 0 && (
          <li>
            出席者: <NameList ids={frontmatter.attendees} speakers={frontmatter.speakers} />
          </li>
        )}
        {frontmatter.absentees.length > 0 && (
          <li>
            欠席者: <NameList ids={frontmatter.absentees} speakers={frontmatter.speakers} />
          </li>
        )}
      </ul>
    </div>
  );
}

type BlockViewProps = {
  block: MarkdownBlock;
  speakers: Record<string, MinutesSpeaker>;
};

function BlockView({ block, speakers }: BlockViewProps) {
  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(block.level, 1), 6);
      const Tag = HEADING_TAGS[level - 1];
      return (
        <Tag className={clsx(styles.heading, HEADING_LEVEL_CLASS[level - 1])}>
          {renderInline(block.text, speakers)}
        </Tag>
      );
    }

    case "paragraph":
      return <p className={styles.paragraph}>{renderInline(block.text, speakers)}</p>;

    case "blockquote":
      return (
        <blockquote className={styles.blockquote}>
          {renderInline(block.text, speakers)}
        </blockquote>
      );

    case "list": {
      // 「[決定] は表示しなくて構いません」という依頼のため, 決定タグの
      // 項目自体を描画対象から除外する (該当項目が無くなればリスト自体も
      // 描画しない)
      const items = block.items.filter((item) => item.tag !== "決定");
      if (items.length === 0) return null;
      return (
        <ul className={styles.list}>
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 項目自体に安定した ID が無いテキストのみのリストのため
            <li key={index} className={styles.listItem}>
              {item.tag && `[${item.tag}] `}
              {renderInline(item.text, speakers)}
            </li>
          ))}
        </ul>
      );
    }

    // ``` で囲われたコードブロックのうち, 中身が発言記録 (@id: ...) では
    // ないもの — GitHub と同様, そのまま等幅フォントで表示する
    case "code":
      return (
        <pre className={styles.codeBlock}>
          <code>{block.text}</code>
        </pre>
      );

    // "@id: 発言内容" 形式による発言記録. 発言時刻/立場は「本文中に記載せず,
    // 名前だけを記載してほしい」という依頼のため表示しない. 「名前と発言を
    // 区切る線を, 上から下まで1本にしてほしい」という依頼のため, 発言ごとに
    // 線を描かず, .transcript 自身に敷いた1本の縦線 (::before, 詳細は
    // MarkdownDocument.module.css を参照) を発言者名 (1列目)/発言内容 (2列目)
    // の間に通す CSS Grid にしている — 発言者ごとに <span>/<div> を直接
    // グリッドの子要素として並べ (Fragment で包むだけ, 余分な div を挟むと
    // 列がずれるため), 発言者に紐付かない行 (plain) は2列目にだけ配置する
    // (.transcriptPlain) ことで, 縦線をまたいでも列がずれないようにしている
    case "transcript":
      return (
        <div className={styles.transcript}>
          {block.entries.map((entry, index) =>
            entry.type === "turn" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: エントリ自体に安定した ID が無いテキストのみの発言記録のため
              <Fragment key={index}>
                <span className={styles.transcriptSpeaker}>
                  <UserNameLink
                    userId={resolveMemberId(
                      speakers[entry.speaker]?.name ?? entry.speaker,
                    )}
                    name={speakers[entry.speaker]?.name ?? entry.speaker}
                  />
                </span>
                <div className={styles.transcriptContent}>
                  {entry.blocks.map((nested, nestedIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 発言内容から都度分解した, 安定した ID を持たないブロックのため
                    <BlockView key={nestedIndex} block={nested} speakers={speakers} />
                  ))}
                </div>
              </Fragment>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: エントリ自体に安定した ID が無いテキストのみの発言記録のため
              <div key={index} className={styles.transcriptPlain}>
                <BlockView block={entry.block} speakers={speakers} />
              </div>
            ),
          )}
        </div>
      );

    default:
      return null;
  }
}

type MarkdownDocumentProps = {
  source: string;
};

// Markdown ファイルの GitHub 風プレビュー. frontmatter (議事録の meeting_id/
// title/... ブロック) が無い一般的な Markdown 資料もそのまま描画できる —
// frontmatter が無ければ FrontmatterHeader を描画しないだけで, 本文側の
// パース (見出し/段落/リスト/引用) はどちらも共通のロジックを通る
// (parseMarkdownDocument@minutesMarkdown.ts を参照). 行間/文字サイズ/余白は
// 「見た目を全てgithubのそれに合わせてほしい」という依頼のため, GitHub の
// markdown-body 相当の値 (基準 line-height: 1.5, 見出しごとのサイズ/太さ/
// margin, リストの実際の箇条書き記号, blockquote の左ボーダー+灰色文字 など)
// に揃えている (色は本アプリのテーマトークンに置き換え, 明暗どちらにも対応)
function MarkdownDocument({ source }: MarkdownDocumentProps) {
  const { frontmatter, blocks } = useMemo(() => parseMarkdownDocument(source), [source]);
  const speakers = frontmatter?.speakers ?? {};

  return (
    <div className={styles.root}>
      {frontmatter && <FrontmatterHeader frontmatter={frontmatter} />}
      <div className={styles.body}>
        {blocks.map((block, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: ブロック自体に安定した ID を持たない解析結果のため
          <Fragment key={index}>
            <BlockView block={block} speakers={speakers} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export { MarkdownDocument };
