# 会議詳細ページ (`/orgs/:orgId/meetings/:meetingId`)

> 索引: [`../README.md`](../README.md) / 一覧: [`organization-meetings.md`](organization-meetings.md)

会計処理詳細ページ ([`transaction-detail.md`](transaction-detail.md)) と基本的に同じ構成
(存在チェック+上部要約を担う親レイアウト, ページ本文側のタブバー (`MeetingDetailTabs`,
`TransactionDetailTabs` と同じくヘッダー下部のスロットではなく本文側に描画), `<Outlet
context={meeting} />` + `useOutletContext` で子ページへ受け渡す薄いラッパーページ) です
— 差分のみここに記載します. `MeetingListRow` (一覧の各行) は既にこの URL
(`/orgs/${organizationId}/meetings/${id}`) へリンクしていたため, 実装対象は詳細ページ側
のみでした.

## データモデリング

会計処理詳細ページと同じ考え方 (「一覧の1件」と「その詳細」は同一の実体を指す) で,
`OrganizationMeeting` (`features/organization/types.ts`) に `attendees`/`materials`/
`minutes` を追加する形で拡張しています. **`attendees: OrganizationMember[]` は ID 参照
ではなく実体を直接埋め込んでいます** — 出席者タブの表示にそのまま使う値のため, 構成員一覧
の `MemberListRow` にそのまま渡せる形が自然だと判断しました (`documentId`/`meetingId` 等,
「組織とは分離して考える」ために意図的に ID 参照+フラットな別テーブル相当にしている
`Activity` 系のフィールドとは異なる設計判断です). `minutes: MeetingMinutes[]`
(議事録タブ用, 後述) も配列にしており, 「同じ会議が複数回に分けて開催されることがある」
という想定を表現しています.

## 上部要約 (`MeetingHeaderBox`)

`TransactionHeaderBox` と同じ構成 (1段目 太字1.25rem+2段目メタ情報) です. 1段目は会議名
(太字)+開催日時 (subtext, regular), 2段目は状態ラベル (延会/流会, `MeetingListRow` と
同じ `Label` — 新しいバッジ (`TransactionStatusBadge` のような塗りつぶし) は作らず既存の
ものをそのまま再利用しました. 通常は何も表示しません) +開催場所 (`IconDoor`)+出席者数
(`IconUsers`) です.

## タブ (`MeetingDetailTabs`)

議題 (`IconListDetails`)/資料 (`IconFolders`)/出席者 (`IconUsers`)/議事録 (`IconNotes`,
「出席者の隣に議事録というタブを増やしてほしい」という依頼のため出席者の次, 末尾に追加)
の4タブです.

## 議題タブ (`MeetingAgendaList`)

「リスト形式」という依頼のため, `meeting.agenda` を採番付きのボーダー付き Box (角丸は
「リストの角は既定で丸めてほしい」という標準方針のため) で表示するだけの単純なコンポーネント
です. **「議題の各項目を, 資料タブの対応する議題の一番上の資料を開くリンクにしてほしい」
という依頼により**, その議題に資料が1件以上あれば
`/orgs/:orgId/meetings/:meetingId/materials?material=<資料ID>` へのリンクにしています
(資料が無い議題は従来通り plain text). クエリ文字列 (`?material=`) で資料を指定しているのは,
`MeetingMaterialsExplorer` 側の選択状態がページ内の `useState` (URL に紐付かない) だった
ため — 別ルートである議題タブから「資料タブの特定の資料を開いた状態」を指定するには, 何らかの
形で URL に載せる必要があったための対応です. `MeetingMaterialsExplorer` は `useSearchParams`
(react-router) でこのクエリを読み, 指定があればその資料を初期選択+所属する議題グループを
展開した状態でマウントします (無ければ従来通り先頭の議題グループ+その最初の資料). 議題タブ
→資料タブは別ルート (別コンポーネント) のため, クエリが変わるたびに `MeetingMaterialsExplorer`
は素直に再マウントされ, `useState` の初期化関数がそのたびに正しく再評価されます.

- **議決結果アイコン/提出者**: 「議題の各項目に議決結果アイコンを, 右端に提出者の名前と役職
  を表示してほしい」という依頼に伴い, `meeting.agenda` の型を `string[]` から
  `MeetingAgendaItem[]` (`{ label, voteResult?, submitterName, submitterRole }`) に変更
  しています — 議題名だけでなく議決結果/提出者という付随情報を持つようになったため, 単純な
  文字列配列では表現できなくなったことによる型変更です. この変更に伴い
  `MeetingListRow`/`MeetingCalendarCard` (`meeting.agenda.join(", ")` は
  `Array.prototype.join` が要素を `String()` で暗黙変換してしまうため, 型エラーには
  ならず `"[object Object]"` になる不具合を実際に踏みました — `.map((item) => item.label)
  .join(", ")` に修正)/`MeetingMaterialsExplorer` (`groupMaterialsByAgenda` の議題名比較
  を `item.label` に) /`mockData.ts` の `generateMeetingMaterials`
  (`agenda[i % agenda.length]` → `.label`) も合わせて修正しています.
  **議決結果 (`AgendaItemVoteResult`)** は否決 (`Rejected`)/延会 (`Postponed`)/可決
  (`Approved`) の3種類ですが, **アイコンを表示するのは否決 (赤い `IconX`,
  `--color-status-red`)/延会 (subtext1 色の `IconTriangle`, `--color-body-subtext` —
  依頼で明示的に「subtext1」と指定されたため, より控えめな `--color-body-subtext0` ではなく
  こちらを使用) の2つだけです** — 可決および `voteResult` が `undefined` (「そもそも議決の
  概念が無い」報告事項など) の場合はどちらもアイコンを表示しません. 提出者は `IconUser`
  + `名前 (役職)` を各行の右端に表示します (`.item` を `justify-content: space-between`
  にし, 番号+アイコン+議題名を `.main` としてまとめて左に, 提出者を右に配置). 提出者の役職は
  新しい役職名を作らず, 出席者/構成員一覧と同じ `OrganizationMember.role` をそのまま使って
  います.

## 出席者タブ (`MeetingAttendeeListBox`)

「`../../members` にあるものと同じリスト形式」という依頼のため, 構成員一覧の行
(`MemberListRow`, [`organization-members.md`](organization-members.md)) をそのまま
再利用しています. `MemberListBox` 自体 (ソート状態やページ切り替え時のフォーカス制御など,
一覧専用の複雑さを持つ) は使わず, 見出し (「n人の出席者」)+行の並びだけの簡潔な Box にして
います — 会議1件あたりの出席者は数人程度で, 並び替え/ページネーションの必要が薄いと判断した
ためです.

## 資料タブ (`MeetingMaterialsExplorer`)

GitHub のファイルビューワを参考に, 左にサイドバー (議題ごとのディレクトリツリー, 開閉可能)/
右にメイン (選択中の資料のプレビュー) を配置しています.

- **サイドバーのツリー**: `meeting.materials` を `meeting.agenda` の順序で議題ごとに
  グルーピングし (資料が無い議題はサイドバーに出しません), フォルダ行 (`IconFolder`/
  `IconFolderOpen`+シェブロン) をクリックすると配下のファイル行が開閉します. フォルダ/
  ファイル行はどちらも `menuItemBase` を使い, ファイル行だけ追加の `padding-left` で
  インデントすることでディレクトリの階層を表現しています. 初期状態は先頭の議題グループだけ
  展開し, その中の最初の資料を選択済みにしています.
- **資料の種別 (`MeetingMaterialFileType`)**: PDF/Markdown/テキスト/動画/会計処理の5種類
  です. PDF/動画は実ファイルの保存先が無いため, 証憑タブ (`TransactionReceiptBox`) と同じ
  考え方でそれとわかる破線枠+アイコンのプレースホルダーにしています. **Markdown は
  `MarkdownFileViewer` (GitHub 風プレビュー+ソース切り替え, 詳細は
  [`../markdown-viewer.md`](../markdown-viewer.md)) で描画し, テキストのみ従来通り等幅
  フォントの `<pre>` でそのまま表示します** (テキストは Markdown ではないため対象外).
- **会計処理を資料として埋め込む (`EmbeddedTransactionView`)**: 「`../../book/会計処理ID`
  のページをリンクではなく, メインの中に同じ内容を表示してほしい」という依頼のため, 会計
  処理詳細ページの「中身」(上部要約+タブ切り替え+3つの本文) を, ルーティングに依存しない
  形で切り出した専用コンポーネントを新設しました. `OrganizationTransactionLayout`/
  `TransactionDetailTabs` (実際の URL の子ルート + `NavLink` でタブを切り替える) とは
  異なり, ここには対応する URL が無いため, `ProfileTabs` と同じ考え方 (`tabBase` の見た目を
  `<button>` + `useState` の内部状態で切り替える) にしています. 上部の `TransactionHeaderBox`
  と, 3つの本文コンポーネント (`TransactionItemsList`/`TransactionProcedureTimeline`/
  `TransactionReceiptBox`) はページ版とそのまま共有しているため, 見た目や挙動の変更は
  自動的に両方に反映されます. 参照先の `OrganizationTransaction` は
  `MeetingMaterial.transactionId` から `MOCK_ORGANIZATION_TRANSACTIONS` を検索して解決
  しています (`OrganizationMeetingMaterialsPage` が全件を `MeetingMaterialsExplorer`
  へ渡し, 選択中の資料が変わるたびに探索する形. 件数が少ないため配列探索のままにしています).

## 議事録タブ (`MeetingMinutesExplorer`)

「資料と同じ形式で示してほしい」という依頼のため `MeetingMaterialsExplorer` と同じ左サイド
バー+右メインの構成を土台にしていますが, ディレクトリツリー (議題ごとのグルーピング/開閉)
は無く, 開催回 (`MeetingMinutes`) をそのまま縦一列に並べるだけの単純なリストです.
**「会議が1度のときはサイドバーを表示せず, 2回以上開催されたときにサイドバーが出現する
ようにしてほしい」という依頼**のため, `meeting.minutes.length` に応じて構成そのものを
(サイドバーを CSS で隠すのではなく) 出し分けています — 1件のときは選ぶ必要が無いため,
サイドバー無しの単一 Box (`.singleRoot`) で本文をそのまま表示します. 各開催回の本文
(`content`) は「議事録のmdファイル」の書式 (frontmatter+発言者形式, 詳細は
[`../markdown-viewer.md`](../markdown-viewer.md)) のため `MarkdownFileViewer` で描画
します — frontmatter 自体がタイトル/日時/場所/議長/記録などを表示するため, サイドバーの
「第N回 日時」ラベル以外にメイン側で改めて見出しを重ねて表示していません.

## モックデータ

`generateMeetingAttendees`/`generateMeetingMaterials` (`mockData.ts`) が各会議ごとに
出席者3〜6人・資料2〜4件を機械的に生成します. 資料の種別は5種類 (Markdown/PDF/テキスト/
動画/会計処理) を順番に割り当てており, 会計処理種別のときは `MOCK_ORGANIZATION_TRANSACTIONS`
から実在する取引を1件参照させています (資料名も参照先の `description` から
「会計処理: ○○」として生成). `generateMeetingMinutes` は大半の会議を1回開催 (`minutes`
配列1件) にしつつ, 一部 (index が4の倍数/8の倍数) を2〜3回開催として生成し, サイドバー
有り/無しの両方の見た目を実際に確認できるようにしています — 各回の日付はその会議自体の
`startsAt` (最終回) から1週間おきに遡って算出しています. `buildMinutesContent` が出席者
(`OrganizationMember[]`) をそのまま発言者 (frontmatter の `speakers`) として使い, 議題
(`MeetingAgendaItem[]`, 詳細は上記「議決結果アイコン/提出者」) の `voteResult`
を議事録本文の `[決定]`/`[宿題]` タグに反映しています (`Approved`/`Rejected`/`Postponed`
→ `[決定]`, `undefined` → `[宿題]`) — 議題タブのアイコンと議事録の内容が矛盾しないように
するための対応です.
