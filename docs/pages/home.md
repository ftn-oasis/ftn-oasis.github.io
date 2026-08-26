# ホーム画面 (`HomePage`)

> 索引: [`../README.md`](../README.md)

`~` — NavDrawer の「ホーム」(`to="/"`) が指す, ルート直下のページです. 「左のサイドバー
には自身が編集に関わった文書を並べ, メインにはGitHubのダッシュボードのフィードのように組織
の文書の発表情報であったり, 全体向けのメッセージであったりを表示するようにしてほしい.
ヘッダー部分には「ホーム」と入れてほしい」という依頼どおりの構成です. 組織にもドキュメント
一覧にも依存しないため, 新しい feature `features/home/` (`types.ts`/`mockData.ts`/
`components/`, `features/notifications/` と同じ構成) として独立させています.

- **`getBreadcrumb.ts`**: `segments.length === 0` (= `/`) のときのフォールバックを, 従来の
  `[]` (何も表示しない) から **`["ホーム"]`** に変更しています — 「ヘッダー部分には
  「ホーム」と入れてほしい」という依頼を, 他の特殊パス (`SPECIAL_ROOT_LABELS`) と同じく
  パンくず1階層の表示名として実現しています.
- **`HomeSection`**: `OverviewSection` と同じ `1fr 3fr` (サイドバー:メイン) の列比率で,
  左に `HomeSidebar`, 右に `HomeFeed` を配置します.

## `HomeSidebar`

上から「進行中の会計処理」(下記)/`Divider`/「編集した文書」の順です. **「編集した文書」**:
`MY_EDITED_DOCUMENTS` (`mockData.ts`, 下記) を編集日時の新しい順に並べ, 0件のときは一覧の
代わりに「編集に関わった文書はまだありません.」を表示します. 各行 (`HomeEditedDocumentItem`)
は `OrganizationListItem` ([`user-profile.md`](user-profile.md)) と同じパターン
(`menuItemBase.root` を直接 `<Link to={`/orgs/${organizationId}/documents/${id}`}>`
に適用) で, 文書の組織アバター (`Avater shape="square" size={20}`, 当初は `IconFileText`
でしたが「組織のアバターに変更してほしい」という依頼で差し替え) + 文書名 (太字) + 最終編集
日時 (`editedAt` の `-` を `/` に置換して表示) の2行構成です.

## 「進行中の会計処理」(`HomeInProgressTransactionItem`)

「編集した文書」の上に配置する, 自身が起案した会計処理のうち完了/却下していないものの
一覧です. 0件のときはセクション自体 (見出し+`Divider` ごと) を表示しません.
`getInProgressTransactionsProposedByCurrentUser` (`features/organization/mockData.ts`,
`currentUser.name` を一部の `MOCK_ORGANIZATION_TRANSACTIONS` の `proposerName` に後付けで
割り当てる `CURRENT_USER_TRANSACTION_OVERRIDES` を参照) が実データを返します. 各行は名目
(`description`)/金額 (整形済みの `title`) + ラベルです. ラベルは承認待
(`TransactionStatus.ApprovalPending`) ならいつもの `TransactionStatusBadge`
([`transaction-detail.md`](transaction-detail.md), 青), 承認済 (支払待/清算待) なら
`getTransactionAvailabilityLabel` (`features/organization/transactionAvailability.ts`)
が返す「購入可」(立替)/「仮払可」(仮払) という teal (`--color-status-teal`, Catppuccin
teal を新規追加) のラベルに切り替わります. **この「可能」ラベルが付いた行が一覧の先頭に
来るよう, `getInProgressTransactionsProposedByCurrentUser` 側でソートしています**
(承認待より優先度が高い, という判断).

## `MY_EDITED_DOCUMENTS` の生成 (データモデリング)

「自身が編集に関わった文書」を表現するため, 実在する `MOCK_ORGANIZATION_DOCUMENTS`
(`features/organization/mockData.ts`) のうち `editors` に `currentUser` が含まれる文書
だけを抽出しています. **`currentUser` を一部の文書の `editors` に加える割り当て自体は,
`features/home/` 側ではなく `features/organization/mockData.ts` 側で行っています** —
`RESOLVABLE_AGENDA_ENTRIES` (文書詳細ページの議決情報) と同じ「生成後に一部だけ書き換える」
手法で, `CURRENT_USER_AS_MEMBER` (`currentUser` の `id`/`name`/`email` を使い,
`role`/`grade`/`class` は他の `MOCK_MEMBERS` と同様の値を仮に割り当てた
`OrganizationMember`) を30件に1件 (index % 30 === 0, 300件中10件) の文書の `editors`
に追加しています. `features/home/` 側で独自にモックを作らずこの実在データを参照している
ため, ホーム画面のサイドバーから遷移した文書の「編集者」タブを開いても実際に「テストユーザー」
が表示され, 矛盾しません (Playwright で確認済み).

## `HomeFeed`/`HomeFeedCard`

「GitHubのダッシュボードのフィードのように」という依頼のため, `IconActivity` + 「最新の
情報」見出しの下に `HomeFeedCard` (`ActivityCard`/`DocumentCard` と同じ外形 `border`/
`border-radius`/`padding: 16px` のボーダー付き Box) を並べます. `HomeFeedItem`
(`features/home/types.ts`) は `ActivityCard` と同じ考え方の discriminated union
(`HomeFeedItemType`) です:

- **`DocumentAnnouncementFeedItem`** (「組織の文書の発表情報」) — 実在する
  `MOCK_ORGANIZATION_DOCUMENTS` のうち公開済みで編集日時が新しい6件を「{組織名}が文書を
  公開しました」という体裁で参照します (`organizationId`/`documentId` を持ち, 文書名は
  実在の文書詳細ページへ, 組織名は実在の組織プロフィールページへ, それぞれ実際にリンク
  します). `occurredAt` は文書の `editedAt` (`"YYYY-MM-DD"`) を `toDisplayDateTime` で
  `"YYYY/MM/DD 09:00"` (時刻情報を持たないため固定の09:00を補う) に整形しています.
- **`BroadcastMessageFeedItem`** (「全体向けのメッセージ」) — 特定の文書/組織に紐付かない,
  学校全体からのお知らせ (生徒会本部/図書委員会/保健委員会/教務課/情報委員会などを送信元と
  する6件) です. こちらはリンクを持たず, `senderName` (太字, ヘッダー) + `title` (太字,
  本文見出し) + `body` (説明文) をそのまま表示します.
- 両方をあわせて `occurredAt` の新しい順にソートして `MOCK_HOME_FEED_ITEMS` として
  エクスポートしています.
- **カードヘッダーのアバター+バッジ (`HomeFeedCardAvatar`)**: 「カードの左上に組織のアバター
  を追加し, その右下に16x16px程の塗り潰し円を表示してアイコンと色を表示してほしい」という
  依頼で追加しました. `Avater shape="square" size={40}` (当初32pxでしたが「40x40にして
  ほしい」という依頼で拡大) の右下に, box-sizing: border-box+`border: 2px solid
  var(--color-background)` (カード自身は透過のため, ページ背景色) の円形バッジ (「枠線を
  含まない大きさが16x16pxになるように」という依頼のため, box-sizing は content-box,
  `width`/`height` を16pxに — 見た目の合計は16+2*2=20px) を重ねます. お知らせ
  (`BroadcastMessageFeedItem`) は青+`IconSpeakerphone`, 文書の発表
  (`DocumentAnnouncementFeedItem`) は緑+`IconFileTextFilled` です.
- **投稿者名 (`posterName`)**: 「カードのアバターの横に, 投稿者のユーザー名を載せてほしい」
  という依頼で, ヘッダー行のアバターの直後に `UserNameLink`+`resolveMemberId`
  ([`../user-name-link.md`](../user-name-link.md), 太字) を追加しました — 文書の発表
  なら `item.authorName` (文書の作成者, `DocumentAnnouncementFeedItem` に追加した
  フィールド), お知らせなら `item.senderName` (部署/委員会などの集団名のため,
  `resolveMemberId` は解決できず結局リンクなしのプレーンテキスト表示になります) です.
  元々ヘッダー行にあった「{組織名}が文書を公開しました」/`senderName` のテキストはそのまま
  残しているため, 文書の発表カードは「{投稿者名} {組織名}が文書を公開しました」という
  見た目になります.
