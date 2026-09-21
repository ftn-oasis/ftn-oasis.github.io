# 会計申請作成ページ (`NewTransactionSection`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md)

`~/book/new` — `CreateButton` の「会計申請を作成」が指すページです. 当初は「支出」
(仮払/立替) 専用の単一フォームでしたが, 「申請の最上部に "支出の申請" "予算執行の申請"
"寄付の申請" というラジオボタンを3つ横並びに配置し, それぞれ別の入力画面を表示してほしい」
という依頼で, `NewTransactionSection.tsx` 自体は3つのモードを切り替えるだけの薄い
ディスパッチャに変わり, 実際の入力画面は `ExpenseRequestForm`/`BudgetExecutionRequestForm`/
`DonationRequestForm` (いずれも `src/features/organization/components/`) の3コンポーネント
に分割されています. 3フォームとも「送信ボタン押下→確認画面→(送信 or キャンセルして破棄
確認→破棄)」という同じ UX ([`../request-submit-flow.md`](../request-submit-flow.md))
を踏むため, 重複を避けて以下の要素を共通化しています:

## 共通の下回り

- **`requestFormBase.module.css`** (`features/organization/components/`) — 3フォーム+
  モード選択 (`NewTransactionSection`) が共通で使うフィールドの見た目 (`.root`/`.field`/
  `.label`/`.required`/`.input`/`.select`/`.textarea`/`.error`/`.hints`/
  `.requestTypeOptions` (縦積みのラジオ選択肢)/`.modeOptions` (横並び版, 後述)/`.radio`/
  `.formActions`/`.amountFieldWrapper`+`.currencySuffix` (金額入力欄+右の「円」)/
  `.paymentMethodOptions`+`.paymentMethodOption` (支払方法の横並びラジオ) など) をまとめた
  CSS Module です. 元は支出の申請専用の `NewTransactionSection.module.css` でしたが,
  予算執行/寄付の申請が追加されたタイミングでこの汎用名に切り出しました (中身は「フィールド
  の見た目」であって「購入」固有ではなかったため, リネームだけで転用できました).
- **`RequestConfirmDialog`** (`features/organization/components/`) — 送信ボタン押下時の
  確認モーダルです. `items: { label: string; value: string }[]` を受け取り, ラベル+値の
  並びをそのまま `<dl>` で表示するだけの汎用コンポーネントにしています (元は支出専用の
  `TransactionConfirmDialog` でしたが, 予算執行/寄付それぞれの要約内容 (対象組織/対象予算
  項目/支払方法/支払先/購入品目, など) が異なるため, 固定 props ではなく `items` 配列に
  一般化しました). 送信する (緑)/修正する (背景透過) を**縦に**並べます (元は「送信する/
  修正する/キャンセル」の3ボタンでしたが, 「送信の確認モーダルからキャンセルボタンをなくして
  ほしい」という依頼によりキャンセルボタン (`onCancel` prop ごと) を削除しています — 入力
  内容を破棄したい場合は「修正する」(またはオーバーレイ/Escape, どちらも同じ `onEdit`
  に割り当て) でいったん入力画面に戻ってから, 入力画面側の「入力内容を破棄」ボタンを使う
  想定です). 見た目の土台 (オーバーレイ+画面中央のパネル) は `src/components/ui/Dialog.tsx`
  (`onClose`+`labelledBy`+`children` を受け取るだけの汎用シェル. `RequestConfirmDialog`/
  `DiscardConfirmDialog` の両方がここから切り出されています) を使っています.
- **`DiscardConfirmDialog`** (`features/organization/components/`) — 「キャンセルボタンが
  押下された場合は, 確認モーダルでも入力画面でも『入力内容が破棄されるが本当にキャンセルする
  か』を訊くモーダルを作成してほしい」という依頼で追加した, 破棄確認の第2段モーダルです
  (当時は確認画面側にも「キャンセル」ボタンがありましたが, 上記のとおり削除済みのため, 現在
  この確認は入力画面の「入力内容を破棄」ボタンからのみ経由します). 「本当にキャンセルします
  か?」の下に, 右側に青で「入力画面に戻る」, 左側に背景透過で「入力内容を破棄する」を配置
  しています (安全な側の操作を右+強調色, 破壊的な操作を左+控えめな見た目にする, という判断.
  オーバーレイのクリック/Escape も安全な側 = 「入力画面に戻る」に割り当てています).
- **`useRequestSubmitFlow`** (`features/organization/`) — 送信/確認/キャンセル/破棄の一連
  の状態遷移をまとめたフックです. 詳細は [`../request-submit-flow.md`](../request-submit-flow.md)
  を参照してください.
- **`SELECTABLE_ORGANIZATIONS`** (`features/organization/selectableOrganizations.ts`) —
  「組織から有志は選択できないようにしてほしい」という依頼のため, `features/user/mockData.ts`
  の `MOCK_ORGANIZATIONS` (所属組織) から `OrganizationType.Volunteer` を除いたものを
  3フォーム共通の組織ドロップダウンの選択肢にしています. このフィルタのために
  `features/user/types.ts` の `Organization` に `type?: OrganizationType`
  (`features/organization/types.ts` からの再利用) と `hasBankAccount?: boolean`
  (後述の寄付/予算執行フォームの銀行口座選択肢の出し分け用) を追加しました —
  `MOCK_ORGANIZATIONS` (`features/user/mockData.ts`) の3件のうち `test-org`
  (文化祭実行委員会) だけ `hasBankAccount: true` にしています.
- **`isValidNaturalNumberInput`** (`features/organization/purchaseItemDraft.ts`) —
  「金額と個数について, 自然数のみを受けつけるようにし, 0始まりの数字も禁止してください」
  という依頼のため追加した検証関数です (`/^[1-9]\d*$/` にマッチするか空文字列かのみ許可).
  金額系の `<input>` は `type="number"` ではなく `type="text" inputMode="numeric"` にした
  上で, `onChange` でこの関数が false を返す入力はそもそも state に反映しない (= 不正な
  文字はそのまま弾かれ, 入力欄に現れない) ことでこの制約を実現しています.
  `PurchaseItemsInput` の金額/個数と, 寄付/予算執行フォームの金額入力欄すべてがこの関数を
  共有しています.

以下, モードごとの差分です.

## 支出の申請 (`ExpenseRequestForm`)

従来からある画面です. 組織/購入名目/種類 (仮払/立替のみ. 「寄付」は後述のとおりこの種類の
選択肢から削除し, 最上部のモード自体に格上げしました)/購入品目 (`PurchaseItemsInput`,
予算執行申請とも共有)/証憑画像 (立替のときだけ) という, 元々の `NewTransactionSection`
とほぼ同じ構成です.

### `PurchaseItemsInput` (`features/organization/components/`)

主な特徴: 名称/概要/金額/個数/計の5列の編集可能な表. 最下段に常に1件だけ空白行を保ち,
いずれかのフィールドに入力があった瞬間に新しい空白行を追加します. 金額/個数は上記の自然数
検証を使い, 金額の右には常に「円」を表示します (`.amountInputWrapper`/`.currencySuffix`).
金額/個数のどちらかが未入力の行の「計」は `0円` ではなく `"- 円"` と表示します (「なにも
入力されていない場合, 計はハイフン円となるようにしてほしい」という依頼のため). 「金額」
「個数」列は「計」列と同じ幅 (`<colgroup>` の `<col>` に `width` を指定) にして, 名称/概要
をより広く見せています. `isEstimate?: boolean` (仮払選択時に true) を渡すと「金額」→
「金額 (概算)」/「合計」→「合計 (概算)」に見出しが切り替わります (仮払は支払前の見込み額
であるため).

### `OrganizationSelectField` (`features/organization/components/`)

組織ドロップダウン. 「ヘッダーの作成ボタンと同じ形式にし, 組織名の左にアバターを表示して
ほしい」という依頼のため, ネイティブ `<select>` ではなく `useDismissablePopover` +
`menuItemBase` の構成 (`CreateButton` と同じパターン) のカスタムドロップダウンです. トリガー/
パネル内の各項目どちらもアバター (`Avater shape="square" size={20}`) を組織名の左に表示
します. 見た目の土台は `src/components/ui/selectFieldBase.module.css` (`.wrapper`/
`.trigger`/`.triggerContent`/`.triggerLabel`/`.menu`/`.group`/`.groupLabel`) — 元は
`OrganizationSelectField` 専用の CSS Module でしたが, 「予算項目のドロップダウンを組織の
ドロップダウンと同じ形式にしてほしい, 今後ドロップダウンを実装する場合もそうしてほしい」
という依頼を機に, `BudgetLineItemSelectField` (後述) とも共有する汎用の土台として
`components/ui/` へ切り出しました. 詳細は [`../ui-common-patterns.md`](../ui-common-patterns.md)
の「ポップオーバー/ドロップダウンの共通パターン」を参照してください. `.group`/`.groupLabel`
はグループ分けが要るドロップダウン (`BudgetLineItemSelectField` など) だけが使う, オプト
インのクラスです.

## 予算執行の申請 (`BudgetExecutionRequestForm`)

対象組織/対象予算項目/支払方法/支払先/購入品目の5項目です.

### 対象予算項目 (`BudgetLineItemSelectField`)

`features/organization/budgetMockData.ts` の `MOCK_BUDGET_LINE_ITEMS` (所管/組織/項の
3階層を持つダミーデータ) を「所管 - 組織」でグループ化して表示します. 当初はネイティブ
`<select>` + `<optgroup>` でしたが, 「予算項目のドロップダウンを組織のドロップダウン
(`OrganizationSelectField`) と同じ形式にしてほしい, 今後ドロップダウンを実装する場合も
そうしてほしい」という依頼により, `OrganizationSelectField` と同じ `useDismissablePopover`
+ `menuItemBase` のカスタムドロップダウンに置き換えています. 3階層の分類は, パネル内で
グループ見出し (`selectFieldBase.module.css` の `.group`/`.groupLabel`) の下に該当する項
を並べる形で表現しています — グループ見出し自体はクリックできず, 「項」の行だけが選択可能
です (ネイティブ `<optgroup>` と同じ役割分担). グループ化のロジック (所管→組織のキーで
`Map` に集約) は, 呼び出し元ではなくこの選択欄のコンポーネント自身が引数の `items`
から算出する形にしています — 以前はネイティブ select 版の実装当時,
`BudgetExecutionRequestForm` 側で `useMemo` していましたが, この関心事は選択欄の内部
実装なのでコンポーネントに閉じ込めました.

### 支払方法

「口座振込･払込票 (ゆうちょ銀行)･現金」の3択ラジオです (元は「銀行口座･振り込み用紙･現金」
という表示名でしたが依頼により改称 — コード上の識別子 `BudgetPaymentMethod.BankAccount`/
`TransferSlip`/`Cash` (`bank-account`/`transfer-slip`/`cash`) 自体は当時のまま変えて
いません). 実際に完了した会計処理の決済手段を表す `PaymentMethod`
([`organization-book.md`](organization-book.md). 現金/銀行振込/引き落し. 一覧/詳細ページ
側で使う型) の「引き落し」とは別概念 (「払込票」は用紙に記入して提出する方式) のため,
混同を避けてこのフォーム限定の型として独立させています.

### 支払先

支払方法に応じて表示する入力欄を出し分けます.

- **口座振込**: 銀行名/銀行コード (4桁)/支店名/支店番号 (3桁)/口座番号 (自然数, 桁数上限
  無し)/口座名義 (全角カタカナのみ) の6項目です (`.fieldRow`+`.subField`/`.subLabel`
  で2つずつ横並びに, 個々に小さな見出しを添えています). 銀行コード/支店番号/口座番号は
  数字のみ (先頭の "0" も許容 — `purchaseItemDraft.ts` の `isValidNaturalNumberInput`
  とは異なる検証のため, 専用の `isValidDigitsInput` を `BudgetExecutionRequestForm.tsx`
  内に定義), 口座名義は全角カタカナ (+空白) のみを `onChange` で弾く形で入力を制限して
  います (`isValidKatakanaInput`).
- **払込票 (ゆうちょ銀行)**: 口座記号番号 (記号5桁-検査数字1桁-番号最大8桁, 例:
  `12345-6-78901234`) + 加入者名の2項目です. 「それぞれの入力欄が5桁, 1桁, 8桁であること
  が判るよう, 入力欄を分割し, 桁の間に分割線を入れてほしい」という依頼のため, 1つの
  `<input>` ではなく3分割した `<input>` を `-` の区切り文字 (`.postalSeparator`) で繋いだ
  `.postalAccountRow` にしています (各欄の幅は `ch` 単位 (`calc(Nch + 24px)`, `.input`
  の左右 padding 分を加算) で桁数どおりに見た目でも判るようにしています). 番号欄 (最大8桁)
  だけは「左詰めで入力し, 1桁でも埋まっていればよい」という依頼のため, 他2つ (記号/検査
  数字, 桁数ちょうどでないと無効) と異なり1桁以上あれば有効です. 元は自由記述の `<textarea>`
  (「振り込み用紙」名義当時) でしたが, この依頼で置き換えています.
- **現金**: 支払先を書く `<input>` 1つです (ラベル「支払先」を明示的に表示 — 依頼を機に
  他の支払方法と同じ `.subField`/`.subLabel` の見た目に揃えています).
- 支払方法に関わらず, 末尾に「備考 (任意)」の `<textarea>` + 「参考となる画像 (任意)」の
  `ReceiptUploadField` (証憑画像アップロード欄と同じコンポーネントを再利用) を配置しています
  — 「参考画像の上に任意の備考欄を設けてほしい」という依頼で追加しました.

### 購入品目

「支出の申請のものと同じリスト」という依頼のとおり, `ExpenseRequestForm` と全く同じ
`PurchaseItemsInput` をそのまま再利用しています (`isEstimate` は渡していないため常に
「金額」「合計」の通常表記のままです — 予算執行に「概算」の概念は無いため).

## 寄付の申請 (`DonationRequestForm`)

対象組織/支払方法/金額の3項目だけの, 他の2つよりずっと単純なフォームです. 支払方法は現金/
銀行口座の2択ラジオで, 銀行口座は対象組織が `hasBankAccount: true`
(`SELECTABLE_ORGANIZATIONS`) の場合だけ選択肢に現れます (対象組織を切り替えて銀行口座を
持たない組織を選ぶと, 選択中だった支払方法が銀行口座でも自動的に現金へ差し戻します —
`effectivePaymentMethod` を参照). 金額欄は自然数のみ入力可能で, 右に「円」を表示します
(`ExpenseRequestForm` の金額入力欄と同じ `.amountFieldWrapper`/`.currencySuffix`).

当初「寄付」は支出の申請の「種類」(仮払/立替と並ぶ3つ目の選択肢, 選択中の枠線/ラジオボタン
の色を緑にし, 仮払・立替との間隔を広く取って別カテゴリだと分かるようにする) として実装され
ましたが, 後の依頼で最上部のモード自体に格上げされ, 「種類」からは削除されています —
「種類」欄の緑色/間隔を広くする実装 (`requestTypeOptionSelectedGreen`/
`requestTypeOptionSeparated`, `requestFormBase.module.css`) 自体は, 現在は最上部の3モード
のラジオ (`.modeOptions`, 横並びのため `.requestTypeOptionSeparated` は使っていません)
ではなく, 削除済みの旧実装の名残としてクラスだけ CSS に残っています — 寄付以外の用途で緑の
強調色/間隔を広げる選択肢が必要になったら再利用してください.
