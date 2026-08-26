# 文書アップロードページ (`NewDocumentUploadPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md), [`new-document.md`](new-document.md)

`~/documents/new/upload` — `CreateButton` の「文書をアップロード」
(`/documents/new/upload`, 既存のリンク先) が指すページです. 「"文書を作成" の "通常の文書を
作成" (`StandardDocumentForm`) の内容を参考にしてほしい」という依頼のため, フィールドの見た目
(入力欄/エラー表示/確認画面/破棄確認/離脱ガード) は `StandardDocumentForm` と同じパターンを
踏襲しつつ, 「アップロードスペース→ファイルごとの情報入力を1件ずつ」という, 依頼文どおりの
2段階ウィザード形式で `NewDocumentUploadSection` (`src/features/organization/components/`)
として実装しています — `NewDocumentSection` (`~/documents/new`) が「通常の文書を作成」/
「議事録を作成」のモード切り替えなのに対し, こちらはアップロードという単一の目的の2ステップ
なので, モード選択のラジオボタンは持たず1コンポーネントで完結させています.

## 画面A (アップロード, `step: "upload"`)

`DocumentUploadDropzone` (新規実装, `ReceiptUploadField` を参考にしつつ, 受け付ける MIME
タイプを PDF/Markdown/テキスト/Word/画像 と証憑画像より広く設定 — 「機能ごとに似た構成でも
別コンポーネントとして持つ」既存の方針どおり `ReceiptUploadField` 自体は変更していません)
でドラッグ&ドロップ/クリック選択による複数ファイル選択欄を表示します. 選択済みの各ファイル
には個別の削除ボタン (`aria-label={`${file.name} のアップロードを取り消す`}`) を表示して
おり, 「ファイルのリスト...には...このファイルのアップロードを取り消すボタンを追加で表示して
ほしい」という依頼をこの画面でも満たしています. 「入力内容を破棄」/「次へ」の2ボタンで,
1件もファイルを選んでいない状態で「次へ」を押すとエラーになり進めません.

## 画面B (ファイルごとの情報入力, `step: "details"`)

選択したファイルを `DraftUploadedDocument` (`id`/`file`/`title`/`description`. 自由入力の
ため安定した ID を持たない `File` の代わりに `crypto.randomUUID()` で振った `id`
をキーにしています — `PurchaseItemsInput` ([`new-transaction.md`](new-transaction.md))
の `DraftPurchaseItem` と同じ考え方) の配列に変換し, 1件ずつ文書名/文書概要
(`StandardDocumentForm` と同じバリデーション: 文書名は必須+このアップロード内での重複禁止,
文書概要は16文字以上必須, カウンター表示も同様) を入力させます. 「一つ終わるごとに次へボタン
を押下して進める」という依頼どおり, 「次へ」で次のファイルへ進み, 最後のファイルでは代わりに
「確認する」を表示して全件分の要約を示す `RequestConfirmDialog` を開きます.

- **文書名の重複チェックは「このアップロードのバッチ内」に限定**しています —
  `StandardDocumentForm` は組織を選んだ上で組織内の重複をチェックしますが, このフォームには
  組織を選ぶ項目が (依頼文の構成に無いため) 存在しないため, 代わりに同じバッチ内の他ファイル
  の文書名とだけ比較しています (`isDraftValid` — `id` が異なる draft の中に trim 済みで
  完全一致する `title` が無いかを見るだけの, 組織非依存の単純な関数).
- **「確認する」への切り替えと送信の橋渡し**: `useRequestSubmitFlow`
  ([`../request-submit-flow.md`](../request-submit-flow.md)) の `handleSubmit`
  はそのまま渡すと毎回のファイル送信で確認画面を開こうとしてしまうため, 画面Bを実際の
  `<form onSubmit={handleDetailsSubmit}>` として, `handleDetailsSubmit` 内で
  `isLastFile` を見て分岐させています — 最後のファイルなら `useRequestSubmitFlow` 側の
  本来の `handleSubmit(event)` に委ね (全ファイル分 `allDraftsValid` なら確認画面を開く),
  それ以外なら `event.preventDefault()` した上で現在のファイルだけを検証し, 有効なら
  `currentIndex` を進めるだけの独自処理にしています. こうすることで, `useRequestSubmitFlow`
  の契約 (本物の `FormEvent` を渡す送信ハンドラ) を崩さずに, 「非最終ファイルでは単に次へ
  進むだけ」という違う挙動を同じ `<form>` の中で両立させています.
- **「このファイルのアップロードを取り消す」(`handleCancelCurrentFile`)**: このファイル
  だけをバッチ (`drafts`) から外します. 1件も残らなければ画面Aまで完全に戻し
  (`pendingFiles`/`drafts` ともに空にリセット), まだ残りがあれば `currentIndex` を
  `Math.min(index, remaining.length - 1)` にクランプするだけです — 末尾のファイルを取り
  消した場合, 新たに末尾になった (既に入力済みの) ファイルの画面がそのまま表示され, ユーザー
  は改めて入力し直すことなく「確認する」/「次へ」を押せば続けられます (当初は取り消した結果
  バッチの最後の1件になった場合に手製の `FormEvent` スタブで送信ハンドラを直接呼ぶ実装を
  試みましたが, 不格好だったためこのシンプルなクランプ方式に置き換えています).

## 確認画面/送信 UX

`RequestConfirmDialog`/`DiscardConfirmDialog`/`useRequestSubmitFlow` を再利用し, 見出しは
「この内容でアップロードしますか?」, 確認ボタンは「アップロードする」です. 確認画面の要約は
`文書 {n}: {文書名}` をファイル数分並べたものです. `isDirty` は「1件でもファイルを選んで
いれば true」(`pendingFiles.length > 0 || drafts.length > 0`) — 画面A/画面Bのどちらの
途中で離脱しようとしても離脱ガードが働きます.

## `CREATION_PAGE_PATHS` への登録漏れに関する既存の不具合を発見・修正

このページの実装にあたり `useNavigateBackPastCreationPages.ts`
([`../navigation-guard.md`](../navigation-guard.md)) を確認したところ, 直前のターンで
追加された `/orgs/new` がこの一覧に登録されておらず, その画面単体 (他の作成画面からの連続
遷移を経ない場合) から「入力内容を破棄」しても常にホームへフォールバックしてしまう不具合を
発見したため, 今回のページの登録と合わせて `/orgs/new` も追加しています — Playwright で
`/` → `/orgs/new` → 破棄, が正しく `/` に戻ることを確認済みです.
