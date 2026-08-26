# 備品貸出状況ページ (`EquipmentLoansPage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-members.md`](organization-members.md)

`~/equipment-loans` — NavDrawer の「備品貸出状況」/`CreateButton` の「備品貸出を申請」の
状況確認先が指す, 組織/文書に紐付かないグローバルな一覧ページです. 「`~/orgs/:orgId/
members` (`OrganizationMembersSection`) を参考にしてほしい」という依頼のため, 検索バー+
フィルターサイドバー+ソート+ページネーション付き一覧 Box の構造は踏襲していますが, 依頼
された一覧の項目 (備品名/ラベル/個数) が構成員 (アバター+名前/役職+メール+学年学級) とは
全く異なるため, 専用の新規コンポーネント一式 (`Equipment*`) として実装しています. 組織にも
ドキュメント一覧にも依存しないため, 新しい feature `features/equipmentLoans/`
(`types.ts`/`mockData.ts`/`equipmentFilters.ts`/`components/`) として独立させています.

- **サイドバーのフィルター**: 依頼文で明示された全て (`IconHome`)/貸出可
  (`IconPackageExport`, 依頼にアイコン指定が無かったため判断で補いました) の2件だけです
  — 構成員一覧の「子組織を含む」(組織のスコープという概念が無い)/「退出済」に相当する
  フィルターはありません.
- **`type EquipmentItem`** (`types.ts`) — `id`/`name` (備品名)/`availability`
  (`EquipmentAvailability`, 貸出可/貸出中の2値)/`quantity` (個数) だけの単純な型です.
  構成員 (`OrganizationMember`) のような役職/学年学級/メールアドレスに相当する概念は無い
  ため, 独立して新規定義しています.
- **`EquipmentListRow`**: 依頼された3項目 (備品名/ラベル/個数) だけを横一列に並べた単純な
  1行構成です — `MemberListRow` (アバター+2行) とは行の複雑さが大きく異なるため, そのまま
  の流用ではなく新規実装にしています. 対応する詳細ページもまだ無いため, 新館予約状況
  ページの `RoomReservationListRow` ([`room-reservations.md`](room-reservations.md))
  と同じ判断で行全体をリンクにせず (`<div>`), 一覧のコンテナも同じく非対話的な `<ul>`/
  `<li>` です.
- **`Label` の `color` に `"red"` を追加しました** (`components/ui/Label.tsx`/
  `Label.module.css`, `--color-label-red` を `theme.css` の light/dark 両ブロックに
  追加 — 既存の `--ctp-latte-red`/`--ctp-mocha-red` をそのまま参照するだけで済みました)
  — 「貸出中」ラベルに赤が必要でしたが, 既存の `sky`/`mauve`/`green`/`peach` のいずれも
  赤系ではなかったため, [`../ui-common-patterns.md`](../ui-common-patterns.md) で以前
  から案内していた拡張手順 (既存の `--ctp-*` パレットから同様に `--color-label-*`
  を追加する) にそのまま従っています. 「貸出可」は既存の `green` をそのまま使っています
  (green 自体はこれまで実際に使われていなかった色でしたが, 定義済みだったためこちらも
  新規追加は不要でした).
- **モックデータ**: `MOCK_EQUIPMENT_ITEMS` (30件) は備品名15種を2巡させ, 3件に1件を貸出中
  (それ以外は貸出可 — 貸出可のほうが多いだろうという想定の比率,
  `MOCK_ORGANIZATION_TRANSACTIONS` の支出/収入比率と同じ考え方) にしています. 個数は
  1〜19の範囲で index からずらして機械的に生成しています. 備品は特定の組織に貸し出される
  ものではなく学校全体の在庫という想定のため, 印刷状況/新館予約状況のような
  `organizationId` フィールドは持たせていません.
