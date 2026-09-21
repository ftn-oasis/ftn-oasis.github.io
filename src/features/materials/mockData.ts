// 実データを取得する API が無いため, ~/materials 用のダミーデータをまとめて置く場所

import { type MaterialChangeLogEntry, type MaterialDocument, MaterialSectionKey } from "./types";

const MOCK_MATERIAL_DOCUMENTS: MaterialDocument[] = [
  // 「規則/資料の最上部にそれぞれ "規則について"/"資料について" という文書を
  // 配置してほしい」という依頼のため, 各セクションの先頭 (parentKey 無しの
  // 最上位文書として, 配列内でもそのセクションの最初) に置いている.
  // ホーム画面のセクション見出し/パンくずのセクション名からもこの文書へ
  // リンクする (SECTION_OVERVIEW_DOCUMENT_KEY を参照)
  {
    key: "about-rules",
    sectionKey: MaterialSectionKey.Rules,
    title: "規則について",
    content:
      "# 規則について\n\nこのセクションでは, 自治会に関する規則をまとめています.\n\n- 会則\n- 規程 (会議の運営・会計処理など)\n- 協定 (学校側との取り決め)\n\n各文書の内容は左のサイドバーから選択してください.",
  },
  {
    key: "bylaws",
    sectionKey: MaterialSectionKey.Rules,
    title: "会則",
    content:
      "# 会則\n\n生徒会の目的・組織・運営に関する基本的な取り決めです.\n\n## 第1条 (目的)\n\n本会は, 生徒の自治活動を通じて学校生活の充実と向上を図ることを目的とする.\n\n## 第2条 (組織)\n\n- 生徒会執行部\n- 代表委員会\n- 各種委員会\n\n## 第3条 (会員)\n\n本校に在籍する全生徒を会員とする.",
  },
  {
    key: "regulations",
    sectionKey: MaterialSectionKey.Rules,
    title: "規程",
    content:
      "# 規程\n\n会則に基づく, より具体的な運用上の取り決めです. 分野ごとに以下の下位規程に分かれています.\n\n- 規程1 (会議の運営)\n- 規程2 (会計処理)",
  },
  {
    key: "regulations-1",
    sectionKey: MaterialSectionKey.Rules,
    parentKey: "regulations",
    title: "規程1",
    content:
      "# 規程1 (会議の運営)\n\n- 定例会議は月1回以上開催する\n- 議決は出席者の過半数の賛成による",
  },
  {
    key: "regulations-2",
    sectionKey: MaterialSectionKey.Rules,
    parentKey: "regulations",
    title: "規程2",
    content:
      "# 規程2 (会計処理)\n\n- 支出は事前に会計担当者の承認を得る\n- 領収書は必ず保管する",
  },
  {
    key: "agreements",
    sectionKey: MaterialSectionKey.Rules,
    title: "協定",
    content:
      "# 協定\n\n学校側 (職員会議) との間で取り交わされている協定事項です. 個別の協定内容は以下を参照してください.\n\n- 協定1 (施設利用について)\n- 協定2 (予算について)",
  },
  {
    key: "agreements-1",
    sectionKey: MaterialSectionKey.Rules,
    parentKey: "agreements",
    title: "協定1",
    content:
      "# 協定1 (施設利用について)\n\n- 使用後は原状回復すること\n- 21時以降の利用は認められない",
  },
  {
    key: "agreements-2",
    sectionKey: MaterialSectionKey.Rules,
    parentKey: "agreements",
    title: "協定2",
    content:
      "# 協定2 (予算について)\n\n年度当初に活動計画とあわせて予算案を提出する.",
  },
  {
    key: "about-guides",
    sectionKey: MaterialSectionKey.Guides,
    title: "資料について",
    content:
      "# 資料について\n\nこのセクションでは, 立場別の案内資料をまとめています.\n\n- 新入生の方々へ\n- 会計担当者の方々へ\n- 部長の方々へ\n- 執行部役員に立候補する方々へ\n- 常設委員会に入りたい方々へ\n- 行事を行う方々へ\n- 有志の方々へ\n\n各文書の内容は左のサイドバーから選択してください.",
  },
  {
    key: "new-students",
    sectionKey: MaterialSectionKey.Guides,
    title: "新入生の方々へ",
    content:
      "# 新入生の方々へ\n\n生徒会活動への参加を歓迎します. まずは以下をご確認ください.\n\n- クラスの委員は入学後1週間以内に選出されます\n- 部活動・委員会への参加は自由です\n- わからないことがあれば, 各クラスの委員長にお尋ねください\n\n> (補足) 有志での活動参加もいつでも歓迎しています.\n\n個別のトピックは以下も参照してください.",
  },
  {
    key: "new-students-committee",
    sectionKey: MaterialSectionKey.Guides,
    parentKey: "new-students",
    title: "クラス委員の選出について",
    content:
      "# クラス委員の選出について\n\n- 入学後1週間以内に, クラスごとに委員長・副委員長を選出します\n- 立候補が無い場合は話し合い, またはくじ引きで決定します\n- 任期は1学期ごとです (再任も可能です)",
  },
  {
    key: "new-students-clubs",
    sectionKey: MaterialSectionKey.Guides,
    parentKey: "new-students",
    title: "部活動・委員会への参加について",
    content:
      "# 部活動・委員会への参加について\n\n- 入学後2週間は仮入部期間です. 複数の部活動・委員会を見学できます\n- 委員会は各クラスの委員長を通じて, または直接委員長へ申し出ることで参加できます\n- 部活動・委員会は年度途中からの参加も可能です",
  },
  // 「入れ子になっている文書の親のアイコンについて, グループとして纏められて
  // いるだけ (それ自身は文書ではない) であれば IconFolder/IconFolderOpen を
  // 表示してほしい」という依頼の動作確認用. content を持たないため, サイド
  // バーのリンクは自分自身ではなく最初の子文書 (関連リンク集-clubs) を指す
  // (resolveDisplayableDocument を参照)
  {
    key: "new-students-links",
    sectionKey: MaterialSectionKey.Guides,
    parentKey: "new-students",
    title: "関連リンク集",
  },
  {
    key: "new-students-links-clubs",
    sectionKey: MaterialSectionKey.Guides,
    parentKey: "new-students-links",
    title: "部活動一覧",
    content:
      "# 部活動一覧\n\n運動部・文化部それぞれの一覧です. 詳しくは各部の見学時にお尋ねください.\n\n## 運動部\n\n- サッカー部\n- バスケットボール部\n\n## 文化部\n\n- 吹奏楽部\n- 新聞部",
  },
  {
    key: "new-students-links-committees",
    sectionKey: MaterialSectionKey.Guides,
    parentKey: "new-students-links",
    title: "委員会一覧",
    content:
      "# 委員会一覧\n\n常設委員会の一覧です.\n\n- 図書委員会\n- 保健委員会\n- 情報委員会",
  },
  {
    key: "treasurers",
    sectionKey: MaterialSectionKey.Guides,
    title: "会計担当者の方々へ",
    content:
      "# 会計担当者の方々へ\n\n各組織の会計処理を担当される方向けの案内です.\n\n## 手続きの流れ\n\n- 起案 → 承認 → 支払 → 清算 → 完了 の順で処理されます\n- 領収書 (証憑) は必ず提出してください\n\n入出金の記録は `~/orgs/組織ID/book` から確認できます.",
  },
  {
    key: "club-presidents",
    sectionKey: MaterialSectionKey.Guides,
    title: "部長の方々へ",
    content:
      "# 部長の方々へ\n\n部活動の運営を担当される方向けの案内です.\n\n- 年度当初に活動計画書を提出してください\n- 対外試合・大会への参加は事前申請が必要です\n- 部員名簿は毎年度更新してください",
  },
  {
    key: "executive-candidates",
    sectionKey: MaterialSectionKey.Guides,
    title: "執行部役員に立候補する方々へ",
    content:
      "# 執行部役員に立候補する方々へ\n\n生徒会執行部への立候補を検討されている方向けの案内です.\n\n## 立候補の流れ\n\n- 立候補届の提出\n- 所信表明\n- 全校投票\n\n立候補届は代表委員会にて配布しています.",
  },
  {
    key: "committee-members",
    sectionKey: MaterialSectionKey.Guides,
    title: "常設委員会に入りたい方々へ",
    content:
      "# 常設委員会に入りたい方々へ\n\n常設委員会 (独立委員会) への参加を希望される方向けの案内です.\n\n- 各委員会は随時委員を募集しています\n- 委員長への相談, または代表委員会への申し出により参加できます",
  },
  {
    key: "event-organizers",
    sectionKey: MaterialSectionKey.Guides,
    title: "行事を行う方々へ",
    content:
      "# 行事を行う方々へ\n\n文化祭・体育祭などの行事を企画・運営される方向けの案内です.\n\n- 実施計画書を1か月前までに提出してください\n- 会場・備品の利用は事前予約が必要です\n- 終了後は報告書を提出してください",
  },
  {
    key: "volunteers",
    sectionKey: MaterialSectionKey.Guides,
    title: "有志の方々へ",
    content:
      "# 有志の方々へ\n\n有志活動として新しい取り組みを始めたい方向けの案内です.\n\n- 有志団体は代表委員会への届出だけで活動を始められます\n- 継続的な活動を希望する場合はクラブ化を検討できます",
  },
];

// 「資料や規則のセクションのタイトルやパンくずがクリックされた場合, その
// セクションの "規則について"/"資料について" が開くようにしてほしい」という
// 依頼のため, 各セクションを代表する文書の key をまとめておく
// (MaterialsHomeSection のセクション見出し/MaterialBreadcrumb のセクション名
// のリンク先として使う)
const SECTION_OVERVIEW_DOCUMENT_KEY: Record<MaterialSectionKey, string> = {
  [MaterialSectionKey.Rules]: "about-rules",
  [MaterialSectionKey.Guides]: "about-guides",
};

// content を持たない文書 (単なるグルーピングのための節目) が渡された場合,
// 最初の子文書を再帰的にたどって, 実際に表示できる (content を持つ) 文書を
// 返す. サイドバーのリンク先/パンくずの祖先リンク/直接 URL でアクセスされた
// 場合のフォールバックのいずれからも共通で使う
function resolveDisplayableDocument(document: MaterialDocument): MaterialDocument {
  if (document.content !== undefined) return document;
  const firstChild = MOCK_MATERIAL_DOCUMENTS.find(
    (candidate) => candidate.parentKey === document.key,
  );
  return firstChild ? resolveDisplayableDocument(firstChild) : document;
}

const MOCK_MATERIAL_CHANGES: MaterialChangeLogEntry[] = [
  { id: "change-1", documentKey: "bylaws", summary: "会則の第2条 (組織) を改訂しました", occurredAt: "2026/08/15" },
  { id: "change-2", documentKey: "regulations-2", summary: "会計処理の承認フローを更新しました", occurredAt: "2026/08/10" },
  { id: "change-3", documentKey: "event-organizers", summary: "実施計画書の提出期限を1か月前に変更しました", occurredAt: "2026/08/05" },
  { id: "change-4", documentKey: "new-students", summary: "新入生向け案内に部活動紹介を追記しました", occurredAt: "2026/07/28" },
  { id: "change-5", documentKey: "agreements-1", summary: "施設利用に関する協定を更新しました", occurredAt: "2026/07/20" },
  { id: "change-6", documentKey: "treasurers", summary: "証憑提出のルールを明確化しました", occurredAt: "2026/07/12" },
  { id: "change-7", documentKey: "executive-candidates", summary: "立候補の流れに所信表明を追加しました", occurredAt: "2026/07/01" },
  { id: "change-8", documentKey: "club-presidents", summary: "部員名簿の更新時期を明記しました", occurredAt: "2026/06/22" },
  { id: "change-9", documentKey: "committee-members", summary: "委員会への参加方法を追記しました", occurredAt: "2026/06/10" },
  { id: "change-10", documentKey: "volunteers", summary: "有志団体のクラブ化について追記しました", occurredAt: "2026/05/30" },
];

export {
  MOCK_MATERIAL_CHANGES,
  MOCK_MATERIAL_DOCUMENTS,
  resolveDisplayableDocument,
  SECTION_OVERVIEW_DOCUMENT_KEY,
};
