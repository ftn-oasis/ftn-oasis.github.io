# 会計処理詳細ページ (`/orgs/:orgId/book/:transactionId`)

> 索引: [`../README.md`](../README.md) / 一覧: [`organization-book.md`](organization-book.md)

GitHub の Pull Request ページを参考にした, 入出金一覧の1件の詳細ページです.
`TransactionListRow` (一覧の各行) は既にこの URL (`/orgs/${organizationId}/book/${id}`)
へリンクしていたため, 実装対象は詳細ページ側のみでした.

## データモデリング

「一覧の1件」と「その詳細」は同一の実体を指すという判断で (`OrganizationMember` が構成員
一覧の実装時に別の型を新設せずフィールド追加で拡張されたのと同じ考え方),
`OrganizationTransaction` (`features/organization/types.ts`) に `status`/`proposerName`/
`items`/`procedure`/`receipt` を追加する形で拡張しています — 別の型 (`TransactionDetail`
等) は新設していません. 一覧側 (`TransactionListRow` など) は引き続き既存のフィールドしか
参照しないため, この拡張によるコンパイル上の影響はありません. 名称 (上部の `<名称>`) は
新しいフィールドを追加せず, 既存の `description` (一覧側で「概要」として使っている, 元々
"装飾用の布地" のような短い名詞句だったフィールド) をそのまま流用しています. なお
`MoneyTransactionActivity.transactionId` (組織の「直近の動向」側, `transaction-N`) とは
あえて別の ID 空間のままです — `ActivityCard` の金銭の出納カードからはこのページへは
(一致する `id` が無いため) まだ遷移できません.

## ルーティング

`/orgs/:orgId` (`OrganizationLayout`) の子ルートとして `book` (一覧, `OrganizationBookPage`)
とは別に `book/:transactionId` (`OrganizationTransactionLayout`) を並べ, その配下にさらに
index (`OrganizationTransactionBreakdownPage`, 金額内訳)/`procedure`
(`OrganizationTransactionProcedurePage`, 手続状況)/`receipt`
(`OrganizationTransactionReceiptPage`, 証憑) をネストしています. `OrganizationTransactionLayout`
が `transactionId` (`organizationId` と合わせて) の存在チェックと, 上部の状態表示+タブの
表示をまとめて担い (`OrganizationLayout` と同じ役割分担), 見つかった `OrganizationTransaction`
を `<Outlet context={transaction} />` (react-router) 経由で3つの子ページへ渡します —
子ページ側は `useOutletContext<OrganizationTransaction>()` で受け取るだけの薄いラッパーで,
自分では検索/存在チェックを行いません. `OrganizationTabs` (概要/文書/会計/…) は `end`
指定の無い `NavLink` (`/orgs/:orgId/book`) のため, `/orgs/:orgId/book/:transactionId`
配下でも「会計」タブは引き続きアクティブに見えます (前方一致).

## 上部2段 (`TransactionHeaderBox`)

1段目は「支出/収入 (太字): 名称 (太字) 金額 (subtext1, regular)」, 2段目は状態ラベル
(`TransactionStatusBadge`, 後述) + `IconUser` + 「起案者: 名前 (太字)」です. `margin: 24px 0`
は `OrganizationHeaderBox`/`TransactionSummaryBox` と同じ値を踏襲しています. **1段目
(`.titleRow`) の文字サイズは `1.25rem`** — 「`~/orgs/組織ID/book` のメイン上部にある残金の
表示 (`TransactionSummaryBox` の `.balance`) と同じ大きさにしてほしい」という依頼のため,
その値をそのまま踏襲しています.

## `TransactionStatusBadge`

承認待 (blue)/支払待 (green)/清算待 (peach)/完了済 (mauve)/否認済 (red) を, 左右が半円
(`border-radius: 999px`) の塗りつぶし背景+太字で表現する専用コンポーネントです. `Label`
(背景透過+細ボーダー) とは視覚的に別物のため, variant として統合せず独立したコンポーネント
にしています. 文字色は塗りつぶし色に依らず一律 `--color-status-text` (Catppuccin base)
— Catppuccin は Latte (light) のアクセントカラーが濃いめ, Mocha (dark) のアクセントカラーが
明るいパステル調という設計のため, base (light は明るい, dark は暗い) との組み合わせでどちらの
テーマでも十分なコントラストが出ます (`--color-status-*`/`--color-status-text` は
`theme.css` に追加. 新しいトークンのため light/dark 両ブロックに追加済みです).

## タブ (`TransactionDetailTabs`)

金額内訳 (`IconListSearch`, 当初 `IconChartPie4` でしたが依頼により変更)/手続状況
(`IconArrowMoveRight`)/証憑 (`IconCertificate`) の3タブです. 見た目は `OrganizationTabs`/
`ProfileTabs` と同じ `tabBase.module.css` を使っていますが, **ヘッダー下部のスロット
(`HeaderBottomPortal`) には差し込んでいません** — このページは `OrganizationLayout`
の子ルートのため, ヘッダー下部のスロットは既に `OrganizationTabs` (会計タブなど) が
使っており, 1つのスロットに2段のタブを同時に差し込むことはできません. そのため
`TransactionDetailTabs` は `TransactionHeaderBox` の下, ページ本文側に普通に描画し,
`OrganizationTransactionLayout.module.css` の `.tabsWrapper` に `border-bottom` を
持たせることで, ヘッダー自身の `border-bottom` を借りられない代わりの区切り線にしています.
金額内訳 (index route) のみ他タブの祖先パスに一致するため `end` 指定が必須です.

## 金額内訳 (`TransactionItemsList`)

名称/概要/金額/個数/計 の5列の `<table>` です (他の一覧が div+flex の「カード風の行」なのに
対し, ここは実際に列が揃った表形式のデータのため, 素直に `<table>` を使っています). 各列
見出しは `<button>` + `IconCaretUpFilled`/`IconCaretDownFilled` (選択中の列, 昇順/降順.
当初は塗りつぶし無しの `IconCaretUp`/`IconCaretDown` でしたが依頼により変更) または
`IconArrowsSort` (非選択の列, 「並び替え可能」であることを示す中立アイコン) で, クリックすると
並び替わります — 同じ列をもう一度押すと昇順/降順がトグルし, 別の列を押すとその列の昇順から
始まります (学年/学級/名前と同じ理由で, 金額内訳の各列も「新しい順」のような強い既定が無い
ため昇順を既定にしています. [`organization-members.md`](organization-members.md) の
`MemberSortDropdown` も参照). 計は `unitPrice × quantity` の場で算出し, `TransactionLineItem`
自体には持たせていません. 最下部の合計行 (名称列を「合計」とし, 計列に全項目の計の合計を
表示) は `--color-secondary1` の背景で通常の行より暗くしています.

**`.table` は `border-collapse: separate; border-spacing: 0;` + `overflow: hidden;`**
— `border-collapse: collapse` だと `border-radius` が効かない (角が丸まらない) ブラウザの
既知の挙動があり, 「金額内訳のリストの角を丸めてほしい」という依頼を機にこの構成へ変更しました
(この標準方針は `CLAUDE.md` の「作業の進め方」を参照). 各列見出しの `<button>`
(`.headerButton`) にも `border-radius: var(--borderRadius-medium)` + `:focus-visible`
の outline を追加しています — 追加前はフォーカス時の見た目が無い状態でした.

## 手続状況 (`TransactionProcedureTimeline`)

縦のタイムラインです. `.root` に `padding: 0 24px;` (「手続き状況のboxについて, 左右の
paddingを24pxとってほしい」という依頼のため) を持たせていますが, **border/border-radius
は付けていません** — 当初はボーダー付きの Box にしていましたが「内容を囲う枠を消してほしい」
という依頼により外し, padding だけ残しています. **上下は 0** — 当初 `padding: 24px;`
(四方) にしていましたが, 親 (`OrganizationTransactionLayout.module.css` の `.content`,
上下 `padding: 24px 0;`) と縦方向の padding が二重にかかり内容が二重に囲われて見える
(48px の間隔になる) 不具合になっていたため, 上下は `.content` 側に任せて 0 にしています.
その中に, 各手順「円+専用の矢印 (アイコンではなく CSS で描いた線+矢頭) を並べた `.rail`」+
「ラベル/日時+担当者 (`IconUser`) の `.stepBody`」を横並びで縦に積んでいます. 未完了の手順は
ただの円 (`--color-overlay1` の枠線のみ, 塗りつぶし無し, 16px), 完了済は
`IconCircleCheckFilled`, 否認 (`denied`) だけは別の円 `IconCircleXFilled` です. 手順の並び
(起案→承認→支払→清算→完了) と, 状態ごとにどこまで完了しているかの対応は `mockData.ts` の
`generateTransactionProcedure`/`COMPLETED_STEP_COUNT_BY_STATUS` を参照してください.
**否認済の場合は起案の直後に否認ステップで打ち切り, それ以降の手順 (承認/支払/清算/完了)
自体を生成していません** — 全手順を表示した上で否認された手順だけ×にする案もありましたが,
依頼により起案の直後で打ち切る形にしています.

- **「直近 (現在の状態)」だけを強調する表示**: 「最後の完了のチェックマーク以外はsubtext0色に」
  「チェックマークは最近のもの以外大きさを24pxに」「最近のものは30px x 30pxに」という一連の
  依頼により, 手順のうち時系列で最後に完了した1件 (`denied` を含む —
  `TransactionProcedureTimeline.tsx` の `lastCompletedIndex`) だけを通常の色+30pxで強調し,
  それより前の完了済の手順は円 (色/24px)・ラベル・日時+担当者のすべてを
  `--color-body-subtext0` (`theme.css` に新規追加 — 既存の `--color-body-subtext` =
  subtext1 とは別のトークンです. これを直接変更すると他の (既に subtext1 を使っている)
  箇所すべてに影響が及んでしまうため) に落として背景に退かせています. 未完了の手順の見た目
  (ただの円, ラベルは通常色) はこの対象外です.
- **`.circle` は常に固定 30px のボックス**: 中のアイコンは16/24/30pxと可変ですが, ボックス
  自体は固定サイズで, アイコンをその中で中央寄せしています — 可変にしていた当初, `.rail`
  (円+矢印の列) は行ごとに独立したフレックスコンテナのため, 円のサイズがそのまま `.rail`
  の実効幅を決めてしまい, 30px の行と24pxの行とで中心の横位置が3pxずれる不具合がありました
  — 固定サイズにすることで `.rail` の実効幅が常に同じになり, `align-items: center`
  による中央寄せが全行で同じ横位置になります.
- **円の縦方向の中心をラベル〜日時+担当者の中心に一致させる**: `.rail` を [前の円からの
  矢印 (無ければ透明なスペーサー `.connectorSpacer`) / 円 / 次の円への矢印 (無ければ
  スペーサー)] の3つを縦に並べる構成にし, `.rail` 自体を `.step` (行全体, `.stepBody`
  の高さで決まる) いっぱいに伸ばしています. 前後の矢印/スペーサーはどちらも `flex: 1 1 0`
  (basis を明示的に 0 にする) なので均等に伸び, 結果として円は自動的に `.rail` の縦方向中央
  = `.stepBody` の縦方向中央 (`padding: 8px 0;` が上下対称なため, パディング込みの中央と
  ラベル〜日時+担当者だけの中央は一致する) に来ます.
- **円を繋ぐ矢印 (`.connector`)**: 汎用の矢印アイコンではなく, 縦線 (`.connectorLine`,
  `background: currentcolor` の1px幅) + CSS の border トリックで描いた矢頭
  (`.connectorArrowhead`) で繋いでいます. **1本の矢印を隣り合う2行に分けて描画**しています
  — 前の行の `.rail` 後半 (次の円への矢印, 線のみ) と, 次の行の `.rail` 前半 (前の円からの
  矢印, 線+矢頭) の2つの要素が, 行同士に隙間が無いためつながって見た目には1本の連続した矢印
  になります (矢頭は「これから到達する円」側にだけ付けています). **`.connector`/
  `.connectorSpacer` の `flex-basis` は `auto` ではなく明示的に `0` にしています** —
  矢頭が付く側 (前の円からの矢印) は矢頭の高さ (5px) の分だけ `auto` だと初期サイズが大きく
  なり, 矢頭の無い側 (次の円への矢印) との間で最終的な高さが5pxずれ, 結果として円の中心が
  2.5pxずれる不具合になっていました — `flex-basis: 0` で純粋に `flex-grow` の比率
  (どちらも1) だけで分配することで, 矢頭の有無に関わらず前後が正確に半分ずつになります.
  **色は既定で `--color-overlay1`, 直近の手順に繋がる矢印だけ `--color-body-subtext0`**
  にしています — それ以外 (まだ完了していない手順同士を繋ぐ矢印など) は overlay1 のままです
  (否認ステップの後ろに矢印は存在しません — 手順自体がそこで打ち切られるため).

## 証憑 (`TransactionReceiptBox`)

「1項目だけのリストのような見た目の Box」として, `DocumentListBox` の `.toolbar` と同じ
考え方の行 (背景 `--color-secondary1`) に文書ID (太字)+アップロード者+アップロード日を
表示し, その下にプレビュー領域を配置しています. **実ファイルの保存先が無いため, プレビューは
本物らしく見せるダミー画像ではなく, それとわかる破線枠+ファイル種別アイコン
(`IconPhoto`/`IconFileTypePdf`) のプレースホルダーにしています** — 実データのように誤解
されるリスクを避けるための意図的な判断です (ユーザーに確認済み).

## 日付の扱い

手続状況の日時/証憑のアップロード日は, `createdAt`/`editedAt` と同じ UTC 起点の日数
(`MOCK_TRANSACTION_LIST_BASE_DAY` からの経過日数) を元に, `mockData.ts` 内の専用ヘルパー
`formatEpochDayTime` で組み立てています. `calendarUtils.formatDateTime` (ローカルタイム
ゾーン基準, 会議のように `setHours` などローカルに構築した `Date` 向け) は意図的に使って
いません — 混在させると `calendarUtils.dateKey` で以前踏んだのと同種のタイムゾーンずれの
不具合になるためです (詳細は [`organization-meetings.md`](organization-meetings.md)).

## モックデータの整合性

`generateTransactionItems` は, 金額内訳の各項目の計の合計が, その会計処理自体の金額
(`amountAbs`) と必ず一致するように生成しています (`splitAmount` で合計を保ったまま分割した
上で, 割り切れる場合だけ個数2-3を採用し, それ以外は1個 = 単価が壊れないようにしています)
— 金額内訳タブの合計行と, 上部の金額表示が食い違わないようにするためです.
