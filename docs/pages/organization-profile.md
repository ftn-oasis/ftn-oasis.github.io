# 組織プロフィールページ (`/orgs/:orgId`)

> 索引: [`../README.md`](../README.md)

`/orgs/:orgId` 配下は `src/pages/OrganizationLayout.tsx` を親ルートとするネストしたルート
です (`App.tsx` の `<Route path="/orgs/:orgId" element={<OrganizationLayout />}>` 配下に
index route `OrganizationOverviewPage`/`path="documents"` の `OrganizationDocumentsPage`
を並べています). `OrganizationLayout` が `UserProfilePage` の「見つからない」判定
(`orgId` が `MOCK_ORGANIZATION.id` (`"test-org"`) と一致しない場合に「組織が見つかりません」
を表示) と `OrganizationTabs` (下記) の表示をまとめて担い, 各ページ
(`OrganizationOverviewPage`/`OrganizationDocumentsPage` など) は本文コンポーネントを描画する
だけの薄いラッパーです — `/orgs/:orgId` 配下のページが増えるたびに同じ判定/タブ表示を書き
直さずに済むよう, 文書タブ (`OrganizationDocumentsPage`) を追加したタイミングでこの形に
切り出しました (切り出す前は `OrganizationProfilePage.tsx` という1ファイルが両方を兼ねて
いました). React Router のネストしたルートでは, 親ルート (`/orgs/:orgId`) の `useParams()`
の結果は `<Outlet />` 経由で描画される子ルート側でもそのまま (マージされた形で) 取得できる
ため, 子ページ自身は `orgId` を扱う必要がありません. データ層は `features/organization/`
直下に `types.ts`/`mockData.ts`, 表示側は `features/organization/components/` 配下に
分割しています.

## タブ (`OrganizationTabs`)

`ProfileTabs` と見た目こそ `tabBase.module.css` を共有していますが, 実装は別物です.
`ProfileTabs` は本文切り替えが `useState` だけで完結する (URL が変わらない) のに対し,
`OrganizationTabs` は各タブが実際の `<NavLink>` (概要 `/orgs/:orgId` (`end` 必須 — 無いと
他の全タブでも概要が選択中に見えてしまいます)/文書 `/orgs/:orgId/documents`/会計
`/orgs/:orgId/book`/会議 `/orgs/:orgId/meetings`/構成員 `/orgs/:orgId/members`/設定
`/orgs/:orgId/settings`) です — 概要/文書/会計/会議/構成員は実装済みですが, 設定タブだけは
まだ実ページが無いため, 選択すると `NotFoundPage` (404) が表示されます (ヘッダーの下部
スロットも失われます). **「設定」のリンク先は依頼文に明記が無かったため, 他のタブと同じ
`/orgs/:orgId/設定パス` の形で `/orgs/:orgId/settings` と推測しています** — 別のパスに
したい場合は `OrganizationTabs.tsx` の `tabs` 配列を修正してください. 各タブはラベルの左に
`Icon` (`size={16}`, `aria-hidden="true"`) を表示します — 概要 `IconHome`/文書
`IconFileText`/会計 `IconReceiptYen`/会議 `IconCalendarTime`/構成員 `IconUsers`/設定
`IconSettings` (依頼文の `IconRecipientYen`/`IconSetting` は `@tabler/icons-react`
に存在しない名称だったため, それぞれ実在する `IconReceiptYen`/`IconSettings` に読み替えて
います — 前者は `CreateButton` の「会計申請を作成」, 後者は `DocumentFilterSidebar` の
「管理下」フィルターで既に使われているアイコンと同じです).

## ヘッダーの Box (`OrganizationHeaderBox`)

`height: 116px; margin: 24px 0;` の横並びで, 左に組織アバター (`size={100} shape="square"`),
右にパンくず/組織名+種別バッジ/概要文/メタ情報の4行を `justify-content: center` で縦に
並べています.

- パンくず (`ancestorNames` + 自分の名前を `IconChevronRight` で繋いだもの) は依頼文の
  「「組織の概要」と同じ大きさ」という指定の意図が明確ではなかったため, 説明文などと同じ
  二次的なテキストサイズ (`0.875rem`) として実装しました — 意図と違う場合は
  `OrganizationHeaderBox.module.css` の `.breadcrumb` を調整してください.
  `organization.type === OrganizationType.Volunteer` (有志) の場合と `ancestorNames`
  が空の場合はパンくず自体を描画しません.
- 種別バッジは `OrganizationType` (学級/執行機関/議決機関/独立委員会/クラブ/有志.
  `DocumentVisibility` と同じ, `erasableSyntaxOnly` 対応の const オブジェクト + union 型)
  を `Label` で表示します.
- 設立日 (`foundedAt?: string`) が無い場合は `IconCalendarWeek` ごとメタ情報のその項目自体を
  描画しません (所属人数は常に表示).

## 本文 (概要タブ)

`OrganizationOverviewSection.module.css` の `.root` で `max-width: 1280px; padding: 0 16px;
margin: 0 auto;` として `OverviewSection` と揃え, `.body` を `display: grid;
grid-template-columns: 3fr 1fr;` で左をメイン (`OrganizationActivityFeed`), 右をサイドバー
(`OrganizationSidebar`) に3:1で分割しています — [`user-profile.md`](user-profile.md) の
`OverviewSection` の 1:3 (サイドバー:メイン, サイドバーが左) とは列の比率も左右も逆なので,
実装する際に混同しないよう注意してください.

- `OrganizationSidebar` は「構成員」見出し + 参加ユーザーのアバター (`size={35}`) を
  `flex-wrap: wrap` で左詰めに並べたものです.
- `OrganizationActivityFeed` は `IconClock` + 「直近の動向」見出し + `ActivityCard` の
  一覧です. カードの外形 (`border`/`border-radius`/`padding: 16px`) は `DocumentCard`
  と同じものを流用し, 幅だけ 100% に引き延ばしています. `.root` には `box-sizing:
  border-box` を明示しています — これが無いと `width: 100%` に `padding`/`border`
  が上乗せされて `main` の幅からはみ出す不具合になっていました.

## `ActivityCard`

ユーザーアバター (`size={40}`) + 名前 (太字) + 日時 (小さく, 名前の下) の共通ヘッダーの下に,
`activity.type` ごとに異なる本文 (`MeetingActivityBody`/`MoneyActivityBody`/
`DocumentActivityBody`, `ActivityCard.tsx` 内の非 export のローカル関数) を出し分ける構成です.

- **会議作成**: 「日時」「開催場所」「出席者」は鉤括弧を付けず `ラベル: 値` とし, 3つを
  まとめて1行 (`.meta`/`.metaGroup`, `DocumentCard` の `.meta`/`.metaGroup` と同じ命名・
  考え方) にしています — `flex-wrap: wrap` なので, 画面が狭く1行に収まらない場合は
  `metaGroup` 単位 (項目の途中ではなく) で折り返します. 「議題」だけ他とは別行のまま複数件
  のときに特別な形式になります (こちらも鉤括弧は付けません) — 1件なら他と同じ `議題: 値`,
  2件以上なら `議題:` の行の下に箇条書きを続けます. `ラベル:` の部分 (「日時」等) は
  `.meta`/`.fieldRow` の `--color-body-subtext` のままですが, 値の部分だけ `.metaValue`
  (`--color-body-body`) で囲んで, 議題の箇条書き (`.list`, 同じく `--color-body-body`)
  と色を揃えています — ラベルより値を目立たせるための区別です. `.list` の `padding-left`
  は `2rem` (既定の `1.25em` (約20px) から拡大した値) にしています.
- **金銭の出納**: アイコンは `IconCreditCard` (当初 `IconCurrencyYen` でしたが変更).
  金額は「収入」(`amount >= 0`)/「支出」(負) をコロンで数値に繋ぎ, 符号は付けず絶対値
  (`Math.abs`) で表示します (当初 `+`/`-` の符号付きで実装していましたが変更).
  `toLocaleString()` 等でのカンマ区切りはせず (依頼文で明示的に「コンマ無し」), 末尾に
  「円」を付けています.
- 会議の議題/出納の項目/文書の変更点の箇条書きは, いずれも見出しの直下にそのまま描画します
  (当初は出納/文書の2つだけ `padding: 16px` の Mantle 背景 Box で囲んでいましたが, 依頼により
  箇条書きは全種類とも Box 無しの `.list` に統一しました). 一覧が `ActivityCard.tsx` の
  `READ_MORE_THRESHOLD` (= 5) 件以上のとき, 表示自体は先頭5件で打ち切り, 代わりに太字下線の
  「詳しく見る」(`ReadMoreLink`, 非 export のローカル関数) を末尾に出します — 依頼文の会議/
  出納/文書それぞれのリンク先 (`/orgs/:orgId/meetings/:meetingId` など) に対応するページ自体は
  実装済みですが, `Activity` 側の `meetingId`/`transactionId`/`documentId` は下記
  「データモデリング」のとおり一覧側とはあえて別の ID 空間のままにしているため, 実際に
  クリックすると (一致する `id` が無く) 404 になります.

## データモデリング

依頼文に「上記にある ID などは組織とは分離して考え, データベースで見た際には木構造では
なくなっている可能性があることに注意」という指示があったため, `types.ts` の `Activity`
(会議作成/金銭の出納/文書の変更) は組織の子要素としてネストさせず, `MOCK_DOCUMENTS`
(`features/user/mockData.ts`) と同じようにそれぞれ独立した `id` + `organizationId`
(参照用の外部キー相当のフィールド) を持つフラットな配列として表現しています. 会議/出納/
文書側の ID (`meetingId`/`transactionId`/`documentId`/`versionId`) も同様に, 組織 ID
から導出/prefix したりせず, 完全に独立した文字列にしています — 実際の DB 設計でもこの形
(別テーブル + 外部キー) を想定した実装です.

## `currentUser` (test-user) との繋がり

`/users/:userId` 側から組織プロフィールページの見え方を確認できるよう,
`features/user/mockData.ts` の `MOCK_ORGANIZATIONS` の1件を `test-org`
(`features/organization/mockData.ts` の `MOCK_ORGANIZATION` と同じ組織) にし,
`MOCK_DOCUMENTS` の `bunkasai-plan` (文化祭実行計画書) を `test-org` の所有にしています.
`features/organization/mockData.ts` 側の `bunkasai-plan` を編集した `DocumentChangeActivity`
の `actorName` は `currentUser.name` を直接参照しています (ハードコードした文字列を2箇所に
置いて食い違うのを防ぐため). 当初は `DocumentSummary` に `lastEditedBy?: string` を追加し,
`DocumentCard` の3行目にも `IconPencil` + 「{name}が編集」として同じ編集を表示していましたが,
自分自身のプロフィールページで「自分が編集した」と表示するのは自明で不要と判断し,
`lastEditedBy` フィールドごと削除しました (`ActivityCard` 側の表示は組織のページなので
引き続き有用です).
