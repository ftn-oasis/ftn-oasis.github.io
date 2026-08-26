# 組織の構成員一覧 (`/orgs/:orgId/members`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`src/features/organization/components/OrganizationMembersSection.tsx` は
`/orgs/:orgId/members` ([`organization-profile.md`](organization-profile.md)) の本文です.
文書一覧/入出金一覧と同様「基本的な構造は文書一覧と同じで, そこからの変更点」という依頼文の
通り, `Document*` 系のコンポーネント一式を `Member*` として並行複製し, 以下の差分だけを
反映しています (レイアウトは `OrganizationBookSection` のような全幅の summary box を挟まない,
`OrganizationDocumentsSection` と同じ1段のグリッドです — 依頼に無いため追加していません).

## `type OrganizationMember` の拡張

元々 `OrganizationSidebar` (概要タブのアバター一覧) だけが使っていた `{ id: string; name:
string; }` という簡素な型に, 構成員一覧に必要な `organizationId`/`role`/`email`/`grade`
(学年, 1-3)/`class` (学級, "A"-"D") を追加する形で拡張しました — `OrganizationDocument`/
`OrganizationTransaction` のように別の型を新設しなかったのは, 「構成員」という同一の実体を
指しており, 概要タブ側は拡張後の型のうち `id`/`name` だけを引き続き使えば済む (構造的部分
型なのでそのままコンパイルが通る) ためです. `class` はフィールド名として (TypeScript の
予約語ですが, プロパティ名としては問題無く使えます) そのまま採用しています. フィルター
(子組織/参加状態など) はまだ実装しないため, 対応するフィールドは持たせていません.

## `MemberFilterSidebar`

依頼文で明示された3件 (`IconHome` 全て/`IconBinaryTree` 組織内のみ/`IconUserOff` 退出済
(`query: "参加: false"`)) だけを持ちます. 構造 (`useFixedSidebarPosition` によるスクロール
追従含む) は `DocumentFilterSidebar`/`TransactionFilterSidebar` と同一です.

## `MemberListRow`

「1つの項目を2行にする」という依頼のため, `DocumentListRow`/`TransactionListRow`
(横一列3列) とは構成が異なります — 先頭に `Avater size="medium"` (40px), 中央に名前
(`.title`, 太字)/役職 (`.description`) を縦に並べた `.info`, 右端に右揃えでメールアドレス/
学年学級を縦に並べた `.meta` を配置し, `.info`/`.meta` がそれぞれ2行になることで行全体が
2行の高さになります. アイコンは `IconMail` (メールアドレス) と `IconUserSquare` (学年学級.
当初 `IconChalkboardTeacher` でしたが依頼により変更) です. リンク先は `DocumentListRow`/
`TransactionListRow` (組織に紐付く独自の未実装ページ) とは異なり, 依頼により実在する
ユーザープロフィールページ (`/users/:userId`, `member.id` をそのまま `userId` として使う)
にしています — `currentUser.id` と一致しない構成員 (現状ほぼ全員) は「ユーザーが見つかりません」
になりますが, これは `/users/:userId` 自体の既存の仕様 (他ユーザーの実データが無い) による
もので, `MemberListRow` 側の実装は単純に `to={`/users/${member.id}`}` とするだけです.

## `MemberListBox`

`DocumentListBox`/`TransactionListBox` と全く同じ構造 (ページ切り替え時の自動フォーカス,
矢印キーでの行移動, `role="listbox"` + `tabIndex={-1}` を含む) です. 上部の件数表示は
「n人の構成員」にしています (`OrganizationHeaderBox` の「所属人数: n人」と同じ, 人を数える
単位).

## `MemberSortDropdown`

依頼文で明示された3種類, 学年/学級/名前 (`MemberSortField.Grade`/`Class`/`Name`) です —
`DocumentSortDropdown` の日付2種+名称という構成とは全く異なる (共通点が無い) ため, 型
(`MemberSortField`/`MemberSortDirection`) も含めて独立して定義しています. ソートの実装は
`field === Name` なら `localeCompare("ja")`, `field === Class` なら学級を
`localeCompare("ja")` (A<B<C<D の文字コード順で十分), それ以外 (`Grade`) は数値の引き算です.
**別フィールドを選び直した際の既定方向は昇順 (`Asc`) にしています** — `DocumentSortDropdown`/
`TransactionSortDropdown` は日付の「新しい順」が自然な既定だったため降順でしたが, 学年/学級/
名前は「1年→3年」「A→D」「あ→ん」のような昇順が自然な既定だろうという判断です (同じ
フィールドを選び直した場合に昇順/降順をトグルする挙動自体は同じです). 一覧の初期ソートも
同じ理由で学年昇順 (`MemberSortField.Grade`/`MemberSortDirection.Asc`) にしています.

## `MemberSearchBar`

`DocumentSearchBar` と同一構造で, プレースホルダーのみを「構成員を検索」にしています.

## モックデータ

「構成員」タブのバッジ (`MOCK_TAB_COUNTS.members`) が `MOCK_ORGANIZATION.memberCount`
と意図的に揃えてある (documents/book のバッジとは異なり, 実際の人数を表す値として扱われて
いる) 既存の設計方針を踏まえ, 文書/入出金のように件数を大きく水増しした別データセットは
作らず, 既存の `MOCK_MEMBERS` (12件, 元々 `OrganizationSidebar` 用) 自体を
`role`/`email`/`grade`/`class` を持つよう拡張して, 構成員一覧ページからも同じ配列をそのまま
使っています. 12件のみのためページネーションは (`showPagination = pageCount > 1` の判定に
より) 表示されません — これは「実際の所属人数と一致させる」ことを優先した結果で, ページ
ネーションの動作確認自体は文書一覧/入出金一覧の300件・50件で既に行っているため, ここで改めて
大きなダミーセットを作る必要は無いという判断です. 学年は `(index % 3) + 1`, 学級は
`["A","B","C","D"][index % 4]`, 役職は先頭2件を「委員長」「副委員長」, 残りを「委員」として
います.
