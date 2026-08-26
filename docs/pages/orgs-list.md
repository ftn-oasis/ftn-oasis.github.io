# 組織一覧ページ (`OrgsPage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`~/orgs` — NavDrawer の「組織一覧」が指すページ. 「`./組織ID/documents`
(= `OrganizationDocumentsSection`) を参考にして, 組織のアイコン, 種類などを要素として持つ
リストを作成してほしい」という依頼のため, 新規コンポーネント (`OrgListRow`/`OrgListBox`/
`OrgFilterSidebar`/`OrgSearchBar`/`OrgSortDropdown`/`OrgsSection`) を
`OrganizationDocumentsSection` 一式と同じ構造 (検索バー+フィルターサイドバー+ソート+
ページネーション付き一覧 Box, グリッド比率 `1fr auto 3fr`, `.root` 自身が
`max-width: 1280px; margin: 0 auto;` を持つ独立ページ) で実装しています —
「組織を横断した一覧ページ」([`cross-org-lists.md`](cross-org-lists.md)) の5つとは異なり,
既存コンポーネントの再利用ではなく新規実装です (文書/入出金/会議/指摘事項/修正提案とは違い,
組織一覧はどの組織にも属さない別階層の一覧のため, 既存の `Organization*` 系コンポーネント
を流用できる形にはなっていません).

- **`OrgListRow`**: `MemberListRow` ([`organization-members.md`](organization-members.md))
  と同じ構成 (先頭にアバター, 中央に名前 (太字)+種別ラベル/概要, 右詰めで所属人数) —
  「アイコン」は `Avater` (`size="medium" shape="square"`, `OrganizationHeaderBox`
  と同じ形状. 実体は無く常に同じプレースホルダー画像) で表現し, 「種類」は
  `OrganizationHeaderBox` と同じ `Label`+`ORGANIZATION_TYPE_LABEL` (学級/執行機関/議決
  機関/独立委員会/クラブ/有志) です. リンク先は `/orgs/${organization.id}`
  (組織プロフィールページ, 実装済み).
- **`OrgFilterSidebar`**: 全て+`OrganizationType` の6種別, 計7件のフィルターです (他の
  フィルターと同じく実装はまだ無く, 選択すると検索欄に文字列を入れるだけ).
  `DocumentFilterSidebar` と同じ `useFixedSidebarPosition` を使います.
- **`OrgSortDropdown`**: 組織には文書/入出金のような一貫した日付フィールドが無いため,
  名前/所属人数の2種類です. 「1年→3年」のような強い既定が無いため, `MemberSortDropdown`
  と同じく別フィールドを選び直した際の既定方向は昇順にしています (`OrgSortField.Name`/
  `OrgSortDirection.Asc` が初期値).
- **`type OrgSortField`/`OrgSortDirection`** (`features/organization/types.ts`) —
  名前/所属人数の2種類. 既存の `DocumentSortField` 等と同じ形ですが, フィールド構成が
  異なる (組織固有) ため独立して定義しています.
- **モックデータ (`MOCK_ORGANIZATIONS`)**: 実データを持つのは `MOCK_ORGANIZATION`
  (`test-org`) の1件だけで, それ以外 (1〜3年A〜D組の12クラス, 生徒会執行部, 代表委員会,
  委員会4件, クラブ6件, 有志3件の計27件, あわせて28件) は一覧の見た目 (絞り込み/並び替え/
  ページネーション) を確認するためのダミーです — `MOCK_DOCUMENTS`
  (features/user/mockData.ts) と同じく, 一覧側とプロフィールページ側であえて別の ID 空間
  にする設計のため, `test-org` 以外の行をクリックすると「組織が見つかりません」になります.
