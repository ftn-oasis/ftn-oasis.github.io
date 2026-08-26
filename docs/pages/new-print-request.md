# 印刷依頼ページ (`NewPrintRequestPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md), [`new-document-upload.md`](new-document-upload.md), [`print-queue.md`](print-queue.md)

`~/print-queue/new` — `CreateButton` の「印刷を依頼」(元は動作未実装のボタンでしたが,
今回このページの実装にあわせて `/print-queue/new` へのリンクに変更しています) が指す
ページです. 「`~/documents/new/upload` を参考にしてほしい」という依頼のため,
`NewDocumentUploadSection` ([`new-document-upload.md`](new-document-upload.md)) と同じ
2段階ウィザード形式 (アップロードスペース→ファイルごとの情報入力を1件ずつ) を
`NewPrintRequestSection` (`src/features/printQueue/components/`) として実装しています.
印刷依頼は組織/文書に紐付かないグローバルな概念のため, `~/print-queue`
(`PrintQueueSection`) と同じく `features/printQueue/` に配置しています — `Document*`/
`PrintRequest*` の関係と同様, `NewDocumentUploadSection` を直接流用せず並行複製する
「機能ごとに似た構成でも別コンポーネントとして持つ」既存の方針を踏襲しています.

## 画面A (アップロード, `step: "upload"`)

`PrintFileUploadDropzone` (新規実装, `DocumentUploadDropzone` を参考にしつつ, 受け付ける
MIME タイプを PDF/Word/画像に絞っています — Markdown/プレーンテキストは印刷物としては
あまり想定されないため対象外としました) でドラッグ&ドロップ/クリック選択による複数ファイル
選択欄を表示します. 選択済みの各ファイルには個別の削除ボタン (`aria-label={`${file.name}
を印刷対象から取り消す`}`) を表示しています. 「入力内容を破棄」/「次へ」の2ボタンで,
1件もファイルを選んでいない状態で「次へ」を押すとエラーになり進めません.

## 画面B (ファイルごとの情報入力, `step: "details"`)

選択したファイルを `DraftPrintRequestFile` (`id`/`file`/`copies`/`paperSize`/`remarks`.
`DraftUploadedDocument` と同じく `crypto.randomUUID()` で振った `id` をキーにしています)
の配列に変換し, 1件ずつ依頼文で明示された3項目を入力させます:

- **部数** — 自然数のみ (`purchaseItemDraft.ts` の `isValidNaturalNumberInput`
  ([`new-transaction.md`](new-transaction.md) の `PurchaseItemsInput` と同じ検証関数を
  再利用), 空欄は不可) の必須項目. 右に「部」を表示する `amountFieldWrapper`/
  `currencySuffix` と同じ考え方の `copiesFieldWrapper`/`copiesSuffix` です.
- **用紙寸法** — A3/A4/B5/B4 (依頼文の記載順) から選ぶ必須項目. ネイティブ `<select>`
  ではなく `selectFieldBase.module.css` ベースのカスタムドロップダウン
  (`PaperSizeSelectField`, `MeetingLocationSelectField`
  ([`meeting-detail.md`](meeting-detail.md) 等を参照) の `allowCustom` 無し版と同じ
  単純な固定選択肢一覧の構成) にしています — 「フォームにドロップダウンを追加する際は
  ネイティブ select ではなくこのパターンを検討する」という既定方針のためです. 既定値は
  一覧の先頭 (`A3`).
- **備考** — 自由記述の任意項目 (他の「(任意)」フィールドと同じ扱い, バリデーション無し).

「一つ終わるごとに次へボタンを押下して進める」という依頼どおり, 「次へ」で次のファイルへ
進み, 最後のファイルでは代わりに「確認する」を表示して全件分の要約を示す
`RequestConfirmDialog` を開きます (`handleDetailsSubmit`
での `isLastFile` 分岐は `NewDocumentUploadSection` と全く同じ構造です).

- **「この印刷依頼を取り消す」(`handleCancelCurrentFile`)**: `NewDocumentUploadSection`
  の「このファイルのアップロードを取り消す」と同じ挙動 (このファイルだけをバッチから外し,
  1件も残らなければ画面Aまで戻す, 末尾を取り消した場合は `currentIndex` をクランプする
  だけ) です.

## 確認画面/送信 UX

`RequestConfirmDialog`/`DiscardConfirmDialog`/`useRequestSubmitFlow`
([`../request-submit-flow.md`](../request-submit-flow.md)) を再利用し, 見出しは
「この内容で印刷を依頼しますか?」, 確認ボタンは「依頼する」です. 確認画面の要約は
`依頼 {n}: {ファイル名} — {部数}部 / {用紙寸法}` (`NewDocumentUploadSection` の
`文書 {n}: {文書名}` と同じく, 備考は要約に含めていません) をファイル数分並べたものです.
`isDirty` は「1件でもファイルを選んでいれば true」— 画面A/画面Bのどちらの途中で離脱
しようとしても離脱ガードが働きます.

## データモデリング

`PrintRequest` (`~/print-queue` 一覧が扱う型, [`print-queue.md`](print-queue.md) 参照)
は `copies`/`pages` を依頼1件全体の値として持つのに対し, このページは複数ファイルの
それぞれに部数/用紙寸法/備考を持たせる構成のため, 型を共有せず `DraftPrintRequestFile`
として独立させています (`NewDocumentUploadSection` の `DraftUploadedDocument` が
`OrganizationDocument` と型を共有していないのと同じ考え方) — 実際の送信処理が無いため
この不一致は実害がありません. 依頼文に組織の選択が含まれていなかったため,
`NewDocumentUploadSection` と同様こちらも組織選択欄を持ちません. `PaperSize`
(`erasableSyntaxOnly` 対応の const オブジェクト + union 型) と選択肢配列
`PAPER_SIZE_OPTIONS` は `PaperSizeSelectField` と両方から参照するため
`features/printQueue/types.ts` に追加しています.

## `CREATION_PAGE_PATHS` への登録

他の作成画面と同じく, `/print-queue/new` を `useNavigateBackPastCreationPages.ts`
([`../navigation-guard.md`](../navigation-guard.md)) の `CREATION_PAGE_PATHS`
に登録しています — 登録し忘れると, この画面単体から「入力内容を破棄」した際に常に
ホームへフォールバックしてしまう不具合になります (`/orgs/new` の実装時に実際に踏んだ
不具合, 詳細は [`new-document-upload.md`](new-document-upload.md) を参照).
