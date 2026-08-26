# 404 ページ (`NotFoundPage`)

> 索引: [`../README.md`](../README.md)

`src/pages/NotFoundPage.tsx` は `App.tsx` の `path="*"` (最後の `<Route>`) に紐づく
catch-all です. `AppLayout` 配下なので `Header` (上部の1行) は表示されますが,
`HeaderBottomPortal` を使わないため下部ヘッダーのスロットは空のまま — 「上部ヘッダーのみを
残す」という要件はこの構造で自然に満たされます. 本文 (`NotFoundPage.module.css` の `.root`)
は `OverviewSection` と同様 `max-width: 1280px; padding: 24px 16px; margin: 0 auto;`,
中身は `text-align: center` の「404」(`.code`, `width: 100%` を明示) と説明文の2行だけです.

## パンくずの挙動

パンくずを空にする指示への対応として, `getBreadcrumb.ts` の最終フォールバック
(`SPECIAL_ROOT_LABELS` にも `currentUser`/`/users/:userId` パターンにも一致しない場合) を,
従来の `segments.slice(0, 2)` (生のパス文字列を最大2階層表示) から `[]` (何も表示しない)
に変更しました.

> **注意**: `SPECIAL_ROOT_LABELS` に登録済みのパス (`/issues`/`/documents` など) は,
> 対応する実ページがまだ無く実際には `NotFoundPage` が表示される場合でも, パンくず自体は
> 登録済みの日本語名 (「指摘事項」等) を引き続き表示します — 未登録の完全に未知なパスの
> ときだけパンくずが空になる, という判断です (`/:userId` がまだ分離されていなかった頃,
> 同様に「ユーザーが見つかりません」の裏でパンくずだけ表示され続けていたのと同じ考え方
> です. 詳細は [`../header.md`](../header.md) の「パンくず」も参照). 「`NotFoundPage`
> が表示されている間は常にパンくずを空にする」という, より厳格な解釈が必要であれば実装を
> 変更してください.
