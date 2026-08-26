# 「問題を報告」モーダル (`ReportIssueModal`)

> 索引: [`../README.md`](../README.md) / 関連: [`../ui-common-patterns.md`](../ui-common-patterns.md)

`CreateButton` の「問題を報告」(元は「サイトの問題点を指摘」というリンク無しの
ボタンでしたが, 今回の依頼で改称+実装しました) と, `NavDrawer` の「問題を報告」
(元々ボタンはあったものの `onClick` が未設定でした) の, どちらを押しても同じ
サイトの問題点を報告するモーダルが開きます.

## 開閉状態の持ち方 (`ReportIssueModalContext`)

`CreateButton` (グローバルヘッダー内) と `NavDrawer` はツリー上の共通の祖先が
離れているため, 同じモーダルをどちらからでも開けるようにするには, 開閉状態を
どこかグローバルに持つ必要があります. `ToastContext`
([`../ui-common-patterns.md`](../ui-common-patterns.md) 等を参照) と同じ考え方
(「ページ遷移をまたいでも表示され続ける」ではなく「離れた場所の複数のトリガーから
同じ1つを開けるようにする」という要件) で, `src/contexts/ReportIssueModalContext.tsx`
にグローバルな Provider として実装しています. `openReportIssueModal()`
だけを公開し (`close` は呼び出し元へは公開せず, モーダル自身が `onClose`
経由で自分を閉じます), `isOpen` のときだけ `ReportIssueModal` を描画します.
`AppProviders.tsx` では `ToastProvider` の内側に配置しています — 中で描画する
`ReportIssueModal` が `useToast()` を使うためです.

## モーダルの中身 (`ReportIssueModal`)

会計申請作成フォームなどの「専用ページ + `useRequestSubmitFlow`
([`../request-submit-flow.md`](../request-submit-flow.md), 離脱ガード付き)」とは
異なり, どのページからでも開けるグローバルなモーダルという性質のため,
ページ遷移を前提にした `useRequestSubmitFlow`/`useNavigateBackPastCreationPages`
は使わず, このコンポーネント単体で完結する軽量な実装にしています. `useToast`
(`showToast`/`resolveToast`) だけを直接使い, 見た目の土台は `Dialog`
(`components/ui/`) をそのまま使っています.

- **入力項目は依頼された2つのみ**: 「1. 問題の具体的な説明」(必須, `<textarea>`.
  `requestFormBase.module.css` の `.field`/`.label`/`.textarea`/`.error`
  を他の作成フォームと同じくそのまま再利用しています) と「2. ファイルの
  アップロード (任意)」(`ReportIssueFileUploadField`, 下記).
- **ボタンは依頼どおり「入力内容を破棄」/「送信する」の2つのみ**です —
  他の作成フォームのような確認画面 (`RequestConfirmDialog`) や破棄確認
  (`DiscardConfirmDialog`) の2段階は挟んでいません. 依頼文がこの2ボタンだけを
  明示していたため, 意図的に単純な構成にしています. これに伴い, オーバーレイの
  クリック/Escape (`Dialog` の `onClose`) も「入力内容を破棄」と同じ
  `handleDiscard` に割り当てています (安全側の「編集に戻る」相当の動作が
  無いシンプルなモーダルのため). 離脱ガードが無いため, タブを閉じる/
  リロードする場合の `beforeunload` 確認もありません.
- **送信**: 「入力内容を確認して送信された場合はモーダルを隠して元の画面を
  表示する」という依頼どおり, 送信 (ダミー) を開始した時点で即座に `onClose()`
  を呼んでモーダルを閉じます (ページ遷移は発生しないモーダルのため, 閉じる
  ことがそのまま「元の画面を表示する」になります). 実際の送信処理 (API
  呼び出し) はまだ無いため, 他の作成フォームと同じダミーの遅延
  (`SUBMIT_DELAY_MS`, `useRequestSubmitFlow.ts` の同名の定数と同じ値) の後に
  トーストを成功表示へ切り替えるだけに留めています.
- **フィールドのインデックス**: 他の「◯◯を作成/依頼/申請」画面
  ([`new-print-request.md`](new-print-request.md)/[`new-equipment-loan.md`](new-equipment-loan.md)
  等を参照) で確立した「各項目に番号を前置する」表記を, 一貫性のため
  このモーダルの2項目にも適用しています.

## `ReportIssueFileUploadField`

`ReceiptUploadField` (証憑画像アップロード欄, [`new-transaction.md`](new-transaction.md))
と同じ構造 (ドラッグ&ドロップ+クリックの両方に対応したアップロード欄+選択済み
ファイルの一覧) ですが, 受け付ける形式・用途が異なるため, 「機能ごとに似た構成
でも別コンポーネントとして持つ」既存の方針どおり新規実装しています. 受け付ける
形式はスクリーンショット向けの画像形式一式 + PDF (ログの書き出しなどを想定)
です. バックエンドが無いため実際のアップロードは行わず, 選択したファイルを
一覧表示するだけです.
