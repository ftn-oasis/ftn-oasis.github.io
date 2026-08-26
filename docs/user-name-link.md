# ユーザー名/組織名のプロフィールへのリンク化 (`UserNameLink`/`OrgNameLink`)

> 索引: [`README.md`](README.md)

「ユーザー名が表示されているところは全て, そのユーザーのprofileへのリンクになるように
してほしい. 表示は変化させず, ホバーすると下線が現れるようにしてほしい」という依頼のため,
`ActivityCard`/`DocumentHeaderBox`/`DocumentOverviewSection`/`DocumentVersionTimeline`/
`TransactionHeaderBox`/`TransactionReceiptBox`/`TransactionProcedureTimeline`/
`MeetingAgendaList`/`IssueListRow`/`PullRequestListRow`/`MarkdownDocument` (議事録の議長/
記録/出席者/欠席者/発言者/`@mention`)/`ProfileSidebar` (自分自身の名前) にある名前の表示
箇所をプロフィールページ (`/users/:userId`) へのリンクに変更しています.

## `UserNameLink` (`src/components/ui/`)

ユーザー名表示を共通で扱う部品です. `userId`/`name`/`className`/`onClick`/`nested`
を受け取り, `userId` が無ければ (`resolveMemberId` が逆引きできなかった場合) リンクにせず
そのまま `name` を表示します.

**「表示は変化させず」を実現するため, `UserNameLink.module.css` の `.root` は `:where()`
で包んで詳細度を 0 にしています** — `<a>` は既定でブラウザ固有の色/下線を持つため, 呼び出し
側の見た目を変えないようにするにはそれらを打ち消して親から色/フォントを継承する必要が
ありますが, 単純にクラスとして定義すると, `ActivityCard` の `.actorName` や
`MarkdownDocument` の `.mention` (青文字) のような呼び出し側が独自に持つ色指定と詳細度が
同じになり, バンドル後の CSS の読み込み順によって勝敗が変わってしまいます. `:where()`
で詳細度を 0 にすることで, 呼び出し側の指定が (className を渡していても渡していなくても)
常に優先されます. `color: inherit; font: inherit; text-decoration: none; cursor:
pointer;` を基本とし, hover 時だけ `text-decoration: underline;` を追加しています.

## `resolveMemberId` (`src/features/organization/`)

`actorName`/`proposerName`/`authorName`/`uploaderName`/`submitterName`/`posterName`
など, id を持たない名前の文字列表示箇所から `userId` を逆引きするヘルパーです.
`currentUser.name` との完全一致, または `MOCK_MEMBERS` の名前との完全一致でのみ解決でき,
どちらにも一致しない場合 (`NotificationListRow` の `senderName` = 組織名など, そもそも
個人を指さない文字列) は `undefined` を返し, `UserNameLink` はリンクにせずそのまま表示
します — このため `NotificationListRow` は意図的に変更対象から外しています (組織名を
ユーザーとして解決しようとしても常に `undefined` になるだけで無意味なため). `Organization
Member` を直接持っているフィールド (`DocumentVersion.editor` など) は `resolveMemberId`
を経由せず, `editor.id` をそのまま使っています.

## `nested` prop と `<a>` の入れ子問題

`IssueListRow`/`PullRequestListRow` は行全体が既に1つの `<Link>` (`<a>`) のため,
`posterName` をそのまま `<Link>` にすると `<a>` の中に `<a>` を入れ子にすることになります.
これは無効な DOM で, 実際に React が開発コンソールへ `In HTML, <a> cannot be a descendant
of <a>. This will cause a hydration error.` という警告を出すことを Playwright で確認
しました (`stopPropagation` だけでは解決しません — 詳細は後述). `UserNameLink` の
`nested: boolean` prop はこれを避けるため, `<a>` の代わりに `role="link"` + `tabIndex={0}`
の `<span>` と `useNavigate()` (react-router) による命令的な遷移で同等の挙動を実現します
(biome の `lint/a11y/useSemanticElements` は `biome-ignore` コメントで抑制 — 親が `<a>`
のため `<a>` を使えない事情をコメントに明記).

クリックハンドラでは **`event.preventDefault()` と `event.stopPropagation()` の両方を
呼ぶ必要があります** — `stopPropagation()` だけでは親の `<a>` 自身のクリック時デフォルト
動作 (`href` への遷移) を止められないためです (デフォルト動作の抑制には `preventDefault`
が必要で, これは `stopPropagation` とは独立した仕組み ―― `<span>` (それ自身は既定の動作を
持たない) 上でクリックが発生しても, そのクリックイベントが `preventDefault` されないまま
伝播し終えると, 親の最も近い `<a>` 祖先の既定動作 (遷移) が実行されてしまいます. 実装当初
`stopPropagation` だけを呼んでいたところ, 名前をクリックしても行全体のリンク先に遷移して
しまう不具合を Playwright で実際に踏んで修正した経緯です).

一方, **`DocumentVersionTimeline` (`<button>` の中に版の編集者名の `<Link>` を置く) では,
この入れ子は React の DOM 検証エラーにはならないことを確認済みです** (`<button>` は `<a>`
と異なり React の `validateDOMNesting` の特別扱い対象ではなく, また `<button>` 自身の
`onClick` はブラウザの既定動作ではなく単なる JS のイベントリスナーのため,
`event.stopPropagation()` だけで版の選択操作への伝播を止められます) — そのため
`DocumentVersionTimeline` は `nested` を使わず, 通常の `<a>` (`UserNameLink` の既定) +
`onClick={(event) => event.stopPropagation()}` のままにしています. 同様の「既にリンク/
ボタンの中にユーザー名を置く」ケースが増えたら, 親要素が `<a>` かどうかで `nested`
の要否を判断してください.

## `OrgNameLink` (`src/components/ui/`)

組織名版. `UserNameLink` と全く同じ構造 (`:where()` による詳細度0, `nested` prop,
`resolveOrganizationId` @`features/organization/` による名前→id逆引き) です.

## 見切れた文言をホバーで全体表示 (`title` 属性)

「全てのページにおいて, 3点リーダーが表示されている文言にカーソルを当てると全体が見える
ようにしてほしい」という依頼のため, `UserNameLink`/`OrgNameLink` はどちらも `userId`/
`organizationId` が無い (プレーンテキストのまま表示する) 場合も含め, 内部で常に
`title={name}` をレンダリングします (「表示は変化させず」の方針どおり見た目には影響しません
— ブラウザ標準のホバーツールチップが増えるだけです). この2つ以外にも, `text-overflow:
ellipsis` を使っている箇所 (一覧行のタイトル/概要, `PurchaseItemsInput` の名称/概要セル,
`Breadcrumb`, `MarkdownFileViewer` の文書名など, サイト全体で20箇所以上) には同様に呼び出し
側で `title={表示している文字列そのもの}` を付けています — **新しく `text-overflow:
ellipsis` を使う要素を追加する際は, 同じように `title` を付けるのが既定の方針です**
(例外は `MeetingCalendarCard` の `.cardLabel` — 見切れた場合はホバーで `.popover`
という, 単なる `title` より詳しい情報 (ラベル/議題/日時/教室) を表示する独自の仕組みが
既にあるため, 二重にツールチップが出ないよう意図的に `title` を付けていません.
[`pages/organization-meetings.md`](pages/organization-meetings.md) を参照).
