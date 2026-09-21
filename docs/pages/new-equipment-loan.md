# 備品貸出申請ページ (`NewEquipmentLoanPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md), [`new-transaction.md`](new-transaction.md), [`equipment-loans.md`](equipment-loans.md)

`~/equipment-loans/new` — `CreateButton` の「備品貸出を申請」(元は動作未実装のボタンでしたが,
今回このページの実装にあわせて `/equipment-loans/new` へのリンクに変更しています) が指す
ページです. 依頼された4項目を, `ExpenseRequestForm`/`NewOrganizationSection`/
`NewMeetingSection` と同じ単一画面のフォーム (`useRequestSubmitFlow` による確認画面/
破棄確認/離脱ガード) として `NewEquipmentLoanSection`
(`src/features/equipmentLoans/components/`) に実装しています. 備品貸出は組織/文書に
紐付かないグローバルな概念のため, `~/equipment-loans` (`EquipmentLoansSection`) と同じく
`features/equipmentLoans/` に配置しています.

## 1. 借りる備品とその個数 (`EquipmentLoanItemsInput`)

「`~/book/new` の購入品目のリストを参考に作成してほしい」という依頼のため,
`PurchaseItemsInput` ([`new-transaction.md`](new-transaction.md)) と同じ「常に末尾に
空白行を保ち, いずれかのフィールドに値が入った瞬間に新しい空白行を追加する」編集可能な表の
構成を踏襲しています. ただし列は備品名/個数の2つだけです (金額/概要/計に相当する概念が
無いため). **備品名は自由入力ではなく, 既存の備品一覧
(`EquipmentItem`, [`equipment-loans.md`](equipment-loans.md)) からドロップダウンで選ぶ
形にしています** — `~/equipment-loans` の一覧データが既に実在するため, それと連動しない
自由入力にするより実際の貸出リクエストらしい振る舞いになると判断しました (ユーザーに確認済み).

- **`EquipmentItemSelectField`** — `MeetingSelectField` と同じ土台
  (`selectFieldBase.module.css`) の単純な一覧ドロップダウンです. 未選択時は「選択...」を
  プレースホルダー表示します.
- **貸出中の備品は選択肢から除外**します (`EquipmentAvailability.Available` のみ).
- **他の行で既に選ばれている備品も, その行の選択肢からは除外**します (同じ備品エントリを
  複数行で重複して選べないようにするため) — `MeetingMinutesDocumentForm` の
  `addableMembers` (追加済みメンバーを候補から除外) と同じ考え方です.
- バリデーションは「1件以上の非空白行」のみです (`PurchaseItemsInput`/`ExpenseRequestForm`
  の `itemsError` と同じ粒度 — 個々の行が備品名/個数の両方とも揃っているかまでは検証して
  いません).

## 2. 借りる期間 (`EquipmentDateRangePicker`)

「ミニカレンダーに枠を表示し, それをドラッグすることで選択範囲を調節してほしい」という
依頼のため, `MeetingDatePicker` (単一の日をクリックで選ぶだけ) を参考にしつつ新規実装した,
このページ専用のドラッグ操作可能な期間選択カレンダーです (`calendarUtils`/
`calendarNavGroup.module.css` は `features/organization/` のものをそのまま再利用 —
`RoomReservationsPage` と同じ理由で, これらはドメインに依存しない汎用の日付計算/UI の
ため). 選択中の期間 (`startDate`〜`endDate`) を表す帯を各日セルの背景として常時表示し,
次の3種類のドラッグで調節します (ユーザーに確認済みの挙動):

- **開始日セルの左端の取っ手をドラッグ** — 開始日だけを変更します (終了日を超えて右には
  動かせません).
- **終了日セルの右端の取っ手をドラッグ** — 終了日だけを変更します (開始日を下回って左には
  動かせません).
- **選択範囲内 (取っ手以外) をドラッグ** — 期間の長さを保ったまま範囲全体を移動します.

- **実装方式**: HTML5 Drag and Drop API ではなく, 各日セルの `mousedown` で開始し,
  経由したセルの `mouseenter` で追跡し, `window` の `mouseup` で終了する素朴な mouse
  イベントの組み合わせです — この種のグリッド上のドラッグ選択に対して HTML5 DnD は
  ドラッグ中のプレビュー画像/ドロップ判定など本来オーバースペックな機能が多いため
  採用していません.
- **「範囲全体を移動」の基準点**: ドラッグ開始時点の (経由日, 開始日, 終了日) を
  `dragOriginRef` に保持し, 以降は「開始時点からの差分日数」を開始日/終了日の両方に
  そのまま適用します — 毎 `mouseenter` で日付を直接書き換える方式だと, 移動量の基準が
  徐々にずれて期間の長さが変わってしまうため, 常にドラッグ開始時点を基準にしています.
- **枠の見た目**: 各セルの全面を塗り潰した上で, 開始日セルの左半分/終了日セルの右半分
  だけを丸めることで, セル同士が隙間なく繋がった1本のピル型の帯に見えるようにしています
  (期間が1日だけの場合は開始日=終了日の同じセルに両方のクラスが乗り, 4隅すべてが丸まって
  完全な円になります — `border-radius` のショートハンドではなく角ごとのプロパティ
  (`border-top-left-radius` 等) を使っているのは, 2つのクラスが同時に乗ったときに
  一方がもう一方を上書きしてしまわないようにするためです).
- **日付の大小比較は `dateKey` (年月日の文字列) で行う**: 開始日/終了日側のクランプ判定を
  `Date` 同士の生の大小比較にすると, 呼び出し元の初期値次第で `startDate`/`endDate` に
  0 以外の時刻が乗っていた場合, 同じ暦日への操作が誤って弾かれることがあります (詳細は
  コンポーネント内のコメントを参照).
- **既知の制約**: ドラッグのみの操作のため, キーボードだけでの期間調整には対応していません
  (`MiniCalendar`/`MeetingDatePicker` の日/週クリックはキーボードでも操作可能ですが,
  こちらはドラッグという操作の性質上, 等価なキーボード操作を用意していません).
- カレンダーの下に「{開始日} 〜 {終了日} ({n}日間)」の読み上げ用の文字列を常時表示し,
  ドラッグ結果を数値でも確認できるようにしています.

## 3. 借り方 / 4. 借りる組織

「組織として借りるか個人として借りるかを選択するラジオボタン」は `DonationRequestForm`
の支払方法と同じ, シンプルな2択ラジオ (`requestFormBase.module.css` の
`paymentMethodOptions`/`paymentMethodOption`) です. 「組織として借りる」が選ばれた
場合だけ, 4番目の項目として「借りる組織」ドロップダウン (`OrganizationSelectField`,
`features/user/mockData.ts` の `MOCK_ORGANIZATIONS` — `StandardDocumentForm`/
`NewMeetingSection` と同じ, currentUser が実際に所属する組織一覧) を表示します —
`ExpenseRequestForm` の「5. 証憑画像」(立替選択時のみ表示だが番号は常に5のまま) と
同じく, 表示/非表示に関わらずインデックス番号は常に4番のまま固定しています.

## データモデリング

このフォームの下書き型 (`DraftEquipmentLoanItem`, `EquipmentLoanOwnerType`) は
`~/equipment-loans` 一覧が扱う `PrintRequest` 相当の型とは連動しない, 送信専用の
概念です (`NewDocumentUploadSection` の `DraftUploadedDocument` と同じ考え方) —
実際の送信処理が無いため実害はありません. `DraftEquipmentLoanItem`
(`id`/`equipmentItemId`/`quantity`) は複数コンポーネント (`EquipmentLoanItemsInput`/
`NewEquipmentLoanSection`) から使うため, `purchaseItemDraft.ts` と同じ理由で
`equipmentLoanItemDraft.ts` に独立して置いています. 個数の入力検証は
`purchaseItemDraft.ts` の `isValidNaturalNumberInput` をそのまま再利用しています
(自然数のみ, 0始まり禁止).

## `CREATION_PAGE_PATHS` への登録

他の作成画面と同じく, `/equipment-loans/new` を `useNavigateBackPastCreationPages.ts`
([`../navigation-guard.md`](../navigation-guard.md)) の `CREATION_PAGE_PATHS`
に登録しています.
