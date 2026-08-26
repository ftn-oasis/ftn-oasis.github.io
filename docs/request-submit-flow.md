# 作成フォームの送信/キャンセル UX (`useRequestSubmitFlow`)

> 索引: [`README.md`](README.md) / 利用箇所: [`pages/new-transaction.md`](pages/new-transaction.md),
> [`pages/new-document.md`](pages/new-document.md), [`pages/new-organization.md`](pages/new-organization.md)

支出/予算執行/寄付の3フォーム, および通常の文書/議事録の2フォーム — 計5つの作成フォーム
すべてが共有する, 送信ボタン押下からの一連の画面遷移です (`useRequestSubmitFlow`,
`features/organization/`).

## 画面遷移

1. 送信ボタン押下 → バリデーション NG ならエラー表示のみ (`submitAttempted` を立てて全項目
   のエラーを一斉表示). OK なら `RequestConfirmDialog` (確認画面) を表示.
2. 確認画面の「送信する」→ 画面を入力画面の前に開いていた画面に戻し
   (`navigateBackPastCreationPages()` — 単純に1つ前の画面に戻るだけなら `navigate(-1)`
   と同じ結果になりますが, 詳細は [`navigation-guard.md`](navigation-guard.md) を参照),
   右上にトーストで「送信しています…」を表示. 実際の送信処理 (API 呼び出し) はまだ無いため,
   ダミーの遅延 (`setTimeout`, 1500ms) の後にトーストの表示を緑のチェックマーク+「送信が
   完了しました」に切り替えます (4秒後に自動で消えます — トースト自体の仕組みは
   `src/contexts/ToastContext.tsx` を参照).
3. 確認画面の「修正する」→ 確認画面を閉じて入力画面に戻るだけ (入力内容はそのまま).
   オーバーレイのクリック/Escape もこちらと同じ扱いです.
4. 入力画面の「入力内容を破棄」(元は「キャンセル」— 依頼により改称. 確認画面側の同名ボタン
   は削除済みのため, 明示的なボタン経由の入口はここだけです — 別ページへのナビゲーションが
   ブロックされた場合にも同じ `DiscardConfirmDialog` が開きます. 詳細は
   [`navigation-guard.md`](navigation-guard.md) を参照) → `DiscardConfirmDialog`
   (破棄確認) を表示. 確認画面は (もし開いていれば) 閉じておきます.
5. 破棄確認の「入力画面に戻る」→ 破棄確認を閉じるだけ (常に入力画面へ戻る — 確認画面を
   経由していた場合でも確認画面へは戻さず, 素の入力画面まで戻します. ブロックされたナビ
   ゲーション経由で開いていた場合は, そのナビゲーション自体も取り消します).
6. 破棄確認の「入力内容を破棄する」→ 送信完了時と同じく `navigateBackPastCreationPages()`
   で画面遷移しますが, 実際には何も送信していないためトーストは (成功アイコンではなく)
   「キャンセルしました」を即座に表示するだけです (`showToast` を経由せず `resolveToast`
   を直接呼んでいます — 破棄は待つ処理の無い即時完了の操作のため).

## `useRequestSubmitFlow` フックの役割

`confirmOpen`/`discardConfirmOpen`/`submitAttempted` の3つの state と, それぞれの操作に
対応するハンドラをまとめたフックです. `isValid`/トースト文言 (`pendingMessage`/
`successMessage`, フォームごとに「会計申請」/「予算執行申請」/「寄付申請」と変える) だけを
フォーム側から渡します. `isDirty` (離脱ガード用. [`navigation-guard.md`](navigation-guard.md)
を参照) も呼び出し側が渡す必須オプションです.
