# 組織の入出金一覧 (`/orgs/:orgId/book`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`src/features/organization/components/OrganizationBookSection.tsx` は `/orgs/:orgId/book`
([`organization-profile.md`](organization-profile.md)) の本文です. 「基本的な構造は
文書一覧 (`OrganizationDocumentsSection`) と同じで, そこからの変更点」という依頼文の通り,
`Document*` 系のコンポーネント一式 (`DocumentFilterSidebar`/`DocumentSearchBar`/
`DocumentSortDropdown`/`DocumentListBox`/`DocumentListRow`) をそれぞれ `Transaction*`
として並行複製し (`Pagination`/`Divider` は既存のものをそのまま再利用), 以下の差分だけを
反映しています — 既存の `Document*` コンポーネント自体は変更していません (実装済みで動作
確認済みのコードを, 依頼されていない範囲まで リファクタリングして壊すリスクを避けるため,
「機能ごとに似た構成でも別コンポーネントとして持つ」方針を踏襲しています).

## レイアウト

`OrganizationDocumentsSection` (サイドバー/`Divider`/メインのグリッド1枚だけの `.root`) とは
異なり, `OrganizationOverviewSection` (`OrganizationHeaderBox` + `Divider` + サイドバー/
メインの `.body`) と同じ2段構成にしています — `TransactionSummaryBox` (後述) を「サイドバー
とメインに跨るように配置してほしい」という依頼のため, `OrganizationBookSection.module.css`
を `.root` (`max-width: 1280px; padding: 0 16px; margin: 0 auto;`,
`OrganizationOverviewSection` の `.root` と同一) + `.body` (`display: grid;
grid-template-columns: 1fr auto 3fr; gap: 16px; padding: 24px 0;`, サイドバー/`Divider`/
メインは元の `.root` の中身をそのまま移した) の2階層に分割し, `TransactionSummaryBox`
とその下の水平 `<Divider />` (依頼により追加) を `.body` の外 (`.root` 直下) に置いています.

## `TransactionSummaryBox`

残金/支出合計/収入合計を表示する Box です. 当初「`OrganizationHeaderBox` と同じ大きさ」
という依頼から `height: 116px` を指定していましたが, 「要素の高さは内容 (文字の高さ)
に合わせてほしい」という依頼により固定高さをやめ, 中身 (2行のテキスト) に応じた自然な
高さにしています (`margin: 24px 0` は `OrganizationHeaderBox` と同じ値のまま残しています
— こちらは上下の余白であり「高さ」ではないため対象外の判断). 「"残金" の横に
`IconMoneybag` を表示してほしい」という依頼で `.balance` (`残金: {balance}円`) の左に
アイコンを追加し, 支出合計/収入合計の行 (`.meta`) は `OrganizationHeaderBox` の
`.meta`/`.metaItem` (`IconMoneybagMinus`/`IconMoneybagPlus`, サイドバーの支出/収入フィルター
と同じアイコン) と同じ構造です. `balance`/`incomeTotal`/`expenseTotal` は
`OrganizationBookSection` が prop の `transactions` (絞り込み前の全件) から算出して渡します
— 一覧上部の「計」(`TransactionListBox` の `totalAmount`, 絞り込み後の `sorted` が対象)
とは異なる集合が対象である点に注意してください. `incomeTotal`/`expenseTotal` は常に0以上
(収入の合計/支出の絶対値の合計) ですが, `balance` (収入-支出) は負の値になり得るため,
「計」と同様に符号付きの数値をそのまま表示しています.

## `type OrganizationTransaction` (`types.ts`)

`OrganizationDocument` と同じ形の, 入出金一覧の1件を表すフラットな型です. `amount` (収入:
正の数/支出: 負の数. `MoneyTransactionActivity` と同じ約束) と, 表示用に整形済みの金額文字列
(絶対値+円, 符号無し. 例: `"8400円"`) を持つ `title` フィールドを別々に持たせています —
`title` はソート (`TransactionSortField.Title`) や一覧の見出し表示に `OrganizationDocument.title`
と全く同じコードパスで使うためのもので, 符号 (収入/支出) の表現は一覧側の +/- アイコンに
任せています. 決済手段は `PaymentMethod` (`erasableSyntaxOnly` 対応の const オブジェクト
+ union 型, 現金/銀行振込/引き落し) です. `TransactionSortField`/`TransactionSortDirection`
も `DocumentSortField`/`DocumentSortDirection` と同じ形 (`EditedAt`/`CreatedAt`/`Title`,
`Asc`/`Desc`) で独立して定義しています — 別ドメインの型を流用せず, 各機能が自分の型を持つ
という既存の方針に揃えています.

(会計処理詳細ページとの型拡張 — `status`/`proposerName`/`items`/`procedure`/`receipt` の
追加 — は [`transaction-detail.md`](transaction-detail.md) を参照してください.)

## `TransactionFilterSidebar`

`DOCUMENT_FILTERS` の9件と違い, 依頼文で明示された5件 (`IconHome` 全て/`IconBinaryTree`
組織内のみ/`IconMoneybagMinus` 支出 (`query: "種別: 支出 有効: true"`)/`IconMoneybagPlus`
収入 (`query: "種別: 収入 有効: true"`)/`IconArchive` 無効化済) だけを持ちます — 支出/収入
の2件は当初 `有効: true` を含めていませんでしたが, 依頼により `DOCUMENT_FILTERS` の
「管理下」等と同じ形式 (属性の後ろに `有効: true` を付ける) に揃えています. 構造
(menuItemBase ベース, `searchText` との完全一致で選択中判定, `useFixedSidebarPosition`
によるスクロール追従) は `DocumentFilterSidebar` と同一です.

## `TransactionListRow`

`DocumentListRow` の3列構成 (太字タイトル/概要/末尾のアイコン+ラベル) を踏襲しつつ, 依頼された
3点を変更しています — (1) 行の先頭に `transaction.amount >= 0` で `IconMoneybagPlus`/
`IconMoneybagMinus` (サイドバーの収入/支出フィルターと同じアイコン. 当初は
`IconPlus`/`IconMinus` でしたが, 依頼により差し替えました) を追加 (収入/支出を示す. 色は
他のアイコンと揃えて `--color-body-subtext` のままにしています — 依頼に無い緑/赤などの色分け
は追加していません), (2) 太字タイトルを文書名ではなく `transaction.title` (整形済みの金額
文字列), (3) 末尾を `IconFile` + ファイル種別ではなく `IconCoinYen` + 決済手段ラベル
(`PAYMENT_METHOD_LABEL`, コンポーネント内定義) にしています. リンク先は
`/orgs/:orgId/book/:transactionId` ([`transaction-detail.md`](transaction-detail.md)) です.

## `TransactionListBox`

`DocumentListBox` と全く同じ構造 (ページ切り替え時の一覧への自動フォーカス, 矢印キーでの行
移動, `role="listbox"` + `tabIndex={-1}` を含む) をそのまま複製しています. 上部の件数表示は
「n本の文書」ではなく「n件の入出金」にしています (文書は「本」, 入出金の記録は「件」で数える
方が自然だろうという判断で, 明示的な依頼ではありません). さらに「"n件の入出金" のとなりに
"計: n円" としてフィルター後の金額を示してほしい」という依頼により, `totalAmount: number`
prop (`OrganizationBookSection` が `sorted` — 絞り込み後・ページ分割前の集合, `totalCount`
と同じ母集合 — の `amount` 合計として算出) を追加し, `.summary` (`.count`+`.totalAmount`
を並べる横並び) として表示しています. 収入-支出の純額のため負の値になり得ますが, 符号付きの
数値をそのまま表示するだけにしています (`-1200円` のように, JS の数値→文字列変換が自然に
付ける負符号にまかせ, 正の値には `+` を前置しません).

## `TransactionSortDropdown`

`DocumentSortDropdown` と同じ3種類の並び替え (最新編集日時/作成日/名称相当) ですが, `Title`
フィールドのラベルは「名称」ではなく「金額」にしています — `title` の中身が金額の整形済み
文字列であることを踏まえた, 表示ラベルだけの変更です (ソートの実装/フィールド構成自体は
`DocumentSortDropdown` と同一).

## `TransactionSearchBar`

`DocumentSearchBar` と同一構造で, プレースホルダーのみを「入出金を検索」にしています
(「文書を検索」のまま流用すると内容と食い違うため).

## モックデータ

`MOCK_ORGANIZATION_TRANSACTIONS` (`features/organization/mockData.ts`) は支出の理由
(`TRANSACTION_EXPENSE_REASONS`, 10種)/収入の理由 (`TRANSACTION_INCOME_REASONS`, 5種) を
それぞれ用意し, `index % 3 === 0` のときだけ収入 (それ以外は支出, 部活動は支出の方が多い
だろうという想定の比率) として50件を機械的に生成しています (`MOCK_ORGANIZATION_DOCUMENTS`
の300件より少なめですが, ページネーション (20件/ページで3ページ) の動作確認には十分な件数
です). 収入は3000〜30000円, 支出は500〜8500円程度の範囲にそれぞれ収まるよう振れ幅を持たせて
います.
