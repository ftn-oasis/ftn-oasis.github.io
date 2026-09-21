// 議事録などの Markdown ファイルを解析するための, フレームワークに依存しない
// (React を知らない) パーサー. 描画側は components/MarkdownDocument.tsx を参照.
//
// 対応する frontmatter (--- で挟まれた冒頭のブロック) は本アプリで実際に使う
// 議事録の形式 (meeting_id/title/date/time/place/chair/recorder/visibility/
// speakers/attendees/absentees) に絞った簡易パーサーです — 汎用の YAML
// パーサーではなく, この形式で書かれる想定の frontmatter だけを読み取ります
// (js-yaml 等の依存を増やさず, このアプリで実際に使う分だけをカバーするための
// 意図的な割り切りです). 「議事録は全て逐語録なので, yamlの部分から逐語録か
// 要約録かの別を取り払ってほしい」という依頼のため, verbatim は扱いません.
//
// 本文側は, 依頼で共有された議事録の書式に合わせて以下を認識します:
// - `#`〜`######` の見出し
// - ``` で囲われたフェンス付きコードブロック — 中身の先頭行が `@id: ...`
//   (発言者の発言) で始まっていれば発言記録 (transcript, 詳細は
//   parseTranscript/isTranscriptFence を参照), そうでなければ通常の
//   コードブロック (GitHub 風にそのまま等幅フォントで表示するだけ)
// - `> ...` = 引用/補足 (blockquote)
// - `- [決定] ...`/`- [宿題] ...`/`- ...` = リスト項目 (タグ付き/無し.
//   ただし [決定] は描画側 (MarkdownDocument.tsx) が表示しない)
// - それ以外 = 通常の段落
// これら以外の行 (frontmatter が無い一般的な Markdown 資料など) は, 該当する
// パターンに一致しないため自然に見出し/段落/リスト/引用として扱われます.

type MinutesSpeaker = {
  name: string;
  role: string;
};

type MinutesFrontmatter = {
  meetingId?: string;
  title?: string;
  date?: string;
  time?: string;
  place?: string;
  chair?: string;
  recorder?: string;
  visibility?: string;
  speakers: Record<string, MinutesSpeaker>;
  attendees: string[];
  absentees: string[];
};

type MarkdownListItem = {
  tag: "決定" | "宿題" | null;
  text: string;
};

// 発言記録の1エントリ. "turn" は特定の発言者による1発言分 (複数行/箇条書きを
// 含み得るため, 内容は改めてブロックとして解釈したもの `blocks` を持つ),
// "plain" は発言者に紐付かない行 (依頼の例の「この行は誰の発言としても
// 扱われません」に相当) — 通常のブロック (段落/箇条書き/引用など) として
// そのまま扱う
type TranscriptEntry =
  | { type: "turn"; speaker: string; blocks: MarkdownBlock[] }
  | { type: "plain"; block: MarkdownBlock };

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; items: MarkdownListItem[] }
  | { type: "code"; text: string }
  | { type: "transcript"; entries: TranscriptEntry[] };

type ParsedMarkdownDocument = {
  frontmatter: MinutesFrontmatter | null;
  blocks: MarkdownBlock[];
};

// frontmatter 内の " #以降" をコメントとして取り除く. 本アプリの frontmatter は
// クォート内に "#" を含む値を扱わないため, この単純な実装で十分
function stripComment(line: string): string {
  const hashIndex = line.indexOf(" #");
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function parseScalar(raw: string): unknown {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner === "" ? [] : inner.split(",").map((item) => item.trim());
  }
  return value;
}

// "name: 田中太郎, role: 会長" のようなインライン (flow-style) マップを解析する
function parseInlineMap(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const separatorIndex = pair.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

function parseFrontmatterYaml(yamlBlock: string): MinutesFrontmatter {
  const data: Record<string, unknown> = {};
  const speakers: Record<string, MinutesSpeaker> = {};
  let inSpeakers = false;

  for (const rawLine of yamlBlock.split("\n")) {
    if (!rawLine.trim()) continue;
    const line = stripComment(rawLine);
    const isIndented = /^\s{2,}\S/.test(line);

    if (isIndented && inSpeakers) {
      const speakerMatch = line.trim().match(/^([\w-]+):\s*\{(.*)\}\s*$/);
      if (speakerMatch) {
        const [, id, inner] = speakerMatch;
        const fields = parseInlineMap(inner);
        speakers[id] = { name: fields.name ?? id, role: fields.role ?? "" };
      }
      continue;
    }

    inSpeakers = false;
    const entryMatch = line.match(/^([\w-]+):\s*(.*)$/);
    if (!entryMatch) continue;
    const [, key, rawValue] = entryMatch;

    if (key === "speakers" && rawValue.trim() === "") {
      inSpeakers = true;
      continue;
    }

    data[key] = parseScalar(rawValue);
  }

  return {
    meetingId: typeof data.meeting_id === "string" ? data.meeting_id : undefined,
    title: typeof data.title === "string" ? data.title : undefined,
    date: typeof data.date === "string" ? data.date : undefined,
    time: typeof data.time === "string" ? data.time : undefined,
    place: typeof data.place === "string" ? data.place : undefined,
    chair: typeof data.chair === "string" ? data.chair : undefined,
    recorder: typeof data.recorder === "string" ? data.recorder : undefined,
    visibility: typeof data.visibility === "string" ? data.visibility : undefined,
    speakers,
    attendees: Array.isArray(data.attendees) ? (data.attendees as string[]) : [],
    absentees: Array.isArray(data.absentees) ? (data.absentees as string[]) : [],
  };
}

function extractFrontmatter(source: string): {
  frontmatter: MinutesFrontmatter | null;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: source };
  const [, yamlBlock, body] = match;
  return { frontmatter: parseFrontmatterYaml(yamlBlock), body };
}

function parseListItem(line: string): MarkdownListItem {
  const text = line.replace(/^-\s+/, "");
  const tagMatch = text.match(/^\[(決定|宿題)\]\s*(.*)$/);
  return tagMatch ? { tag: tagMatch[1] as "決定" | "宿題", text: tagMatch[2] } : { tag: null, text };
}

function parseBlock(chunk: string): MarkdownBlock {
  const lines = chunk.split("\n");
  const [first] = lines;

  const headingMatch = lines.length === 1 && first.match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    return { type: "heading", level: headingMatch[1].length, text: headingMatch[2] };
  }

  if (lines.every((line) => /^-\s+/.test(line))) {
    return { type: "list", items: lines.map(parseListItem) };
  }

  if (lines.every((line) => /^>\s?/.test(line))) {
    return {
      type: "blockquote",
      text: lines.map((line) => line.replace(/^>\s?/, "")).join(" "),
    };
  }

  return { type: "paragraph", text: chunk };
}

// 発言記録の1発言の先頭行 ("@m7: これはダミーの発言です" のような) を検出する
const SPEAKER_TURN_PATTERN = /^@([\w-]+):\s?(.*)$/;

// フェンス付きコードブロックの中身の先頭行が "@id: ..." で始まっていれば
// 発言記録とみなす — この判定が無いと, 他の (議事録以外の) Markdown 資料が
// 通常のコードサンプルとして ``` を使った場合にまで誤って発言記録として
// 解析されてしまう
function isTranscriptFence(content: string): boolean {
  const firstLine = content.split("\n").find((line) => line.trim() !== "");
  return firstLine !== undefined && SPEAKER_TURN_PATTERN.test(firstLine.trim());
}

// フェンス内を空行区切りのチャンクに分け, 各チャンクの先頭行が "@id: ..." に
// 一致すれば発言 (turn — 「発言内容の部分には改行や箇条書き等通常の markdown
// 記法が使えるように」という依頼のため, 続く行は parseTranscriptContentBlocks
// で改めて段落/箇条書きに分解する), 一致しなければ発言者に紐付かない行
// (plain — 「この行は誰の発言としても扱われません」の例に相当) として,
// 通常のブロック (段落/箇条書き/引用など) にそのまま解釈する
function parseTranscriptEntry(chunk: string): TranscriptEntry {
  const lines = chunk.split("\n");
  const match = lines[0].match(SPEAKER_TURN_PATTERN);
  if (!match) return { type: "plain", block: parseBlock(chunk) };

  const [, speaker, firstLineRest] = match;
  const content = [firstLineRest, ...lines.slice(1)].join("\n");
  return { type: "turn", speaker, blocks: parseTranscriptContentBlocks(content) };
}

function parseTranscript(content: string): MarkdownBlock {
  const entries = content
    .trim()
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(parseTranscriptEntry);
  return { type: "transcript", entries };
}

// フェンス付きコードブロック (``` 〜 ```) の中身を, 発言記録またはただの
// コードブロックとして解釈する
function parseFencedBlock(content: string): MarkdownBlock {
  return isTranscriptFence(content) ? parseTranscript(content) : { type: "code", text: content };
}

// body を「``` で囲われたフェンス」と「それ以外の地の文」に分ける. フェンスの
// 中身は空行を含み得る (発言記録の発言同士を空行で区切るため) ため, 地の文の
// ような空行区切りのチャンク分割をフェンスの中まで適用してしまわないよう,
// 行単位で先にフェンスを抜き出しておく
function splitIntoSegments(body: string): { fenced: boolean; content: string }[] {
  const lines = body.split("\n");
  const segments: { fenced: boolean; content: string }[] = [];
  let textLines: string[] = [];
  let i = 0;

  function flushText() {
    if (textLines.length === 0) return;
    segments.push({ fenced: false, content: textLines.join("\n") });
    textLines = [];
  }

  while (i < lines.length) {
    if (/^```/.test(lines[i].trim())) {
      flushText();
      const fenceLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        fenceLines.push(lines[i]);
        i++;
      }
      i++; // 閉じの ``` 行を読み飛ばす
      segments.push({ fenced: true, content: fenceLines.join("\n") });
      continue;
    }
    textLines.push(lines[i]);
    i++;
  }
  flushText();

  return segments;
}

function parseBlocks(body: string): MarkdownBlock[] {
  return splitIntoSegments(body.trim()).flatMap((segment) =>
    segment.fenced
      ? [parseFencedBlock(segment.content)]
      : segment.content
          .trim()
          .split(/\n{2,}/)
          .map((chunk) => chunk.trim())
          .filter(Boolean)
          .map(parseBlock),
  );
}

// 発言記録の1発言分の内容 (改行区切りの生テキスト) を段落/箇条書きに分解する.
// parseBlocks (空行区切り) とは違い, 発言記録の中には空行が入らない
// (parseTranscript を参照) ため, 空行に頼らず行単位で「- で始まる行が続く間は
// 箇条書き, それ以外は段落」という単純な規則で切り分けている — 「発言内容の
// 部分には改行や箇条書き等通常のmarkdown記法が使えるようにしてほしい」という
// 依頼のための, 発言記録専用の軽量パーサー
function parseTranscriptContentBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
    paragraphLines = [];
  }

  function flushList() {
    if (listLines.length === 0) return;
    blocks.push({ type: "list", items: listLines.map(parseListItem) });
    listLines = [];
  }

  for (const line of content.split("\n")) {
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listLines.push(line.replace(/^\*/, "-"));
    } else {
      flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks;
}

function parseMarkdownDocument(source: string): ParsedMarkdownDocument {
  const { frontmatter, body } = extractFrontmatter(source);
  return { frontmatter, blocks: parseBlocks(body) };
}

export {
  type MarkdownBlock,
  type MarkdownListItem,
  parseMarkdownDocument,
  parseTranscriptContentBlocks,
  type MinutesFrontmatter,
  type MinutesSpeaker,
  type ParsedMarkdownDocument,
  type TranscriptEntry,
};
