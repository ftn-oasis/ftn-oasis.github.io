# 作成画面の離脱ガード

> 索引: [`README.md`](README.md) / 関連: [`request-submit-flow.md`](request-submit-flow.md)

「どの作成画面 (会計申請や書類等) でも入力欄にユーザーが入力している場合は, そのまま別の
ページに移動しようとした際に, 入力内容を破棄して移動するかどうかを確認するダイアログを表示
してほしい. 入力内容が破棄された場合は元の画面に戻ってほしい (元の画面がさらに作成画面なら
その前まで戻る)」という依頼のため, `useRequestSubmitFlow` (支出/予算執行/寄付の3フォーム,
通常の文書/議事録の2フォーム, 組織作成 (`NewOrganizationSection`,
[`pages/new-organization.md`](pages/new-organization.md))/文書アップロード
(`NewDocumentUploadSection`, [`pages/new-document-upload.md`](pages/new-document-upload.md))
の2フォーム, 計7フォームすべてが使う共通フック, 詳細は
[`request-submit-flow.md`](request-submit-flow.md)) に, 既存の「入力内容を破棄」ボタンと
同じ `DiscardConfirmDialog` を使う離脱ガードを統合しています — 新しいダイアログは追加して
いません.

## `useBlocker` (react-router) — データルーターへの移行

`useBlocker` は宣言的な `<BrowserRouter>` では動作せず, データルーター
(`createBrowserRouter`/`RouterProvider`) の内部でしか呼べません. このためルーターの移行が
必要になりました — 詳細は [`architecture.md`](architecture.md) の「アプリの構成」を参照
してください.

## `isDirty: boolean`

`useRequestSubmitFlow` に追加した必須オプションで, 呼び出し側 (各フォームコンポーネント)
が「入力欄に何かしら入力されているか」を渡します. `useState` の初期値 (組織の先頭選択/公開
など, ページを開いた直後の既定値) からフィールドの値が変化しているかを比較する形で導出して
おり, 新しく state を増やしたり個々の `onChange` ハンドラに手を入れたりする必要はありません
(`ExpenseRequestForm`/`BudgetExecutionRequestForm`/`DonationRequestForm`/
`StandardDocumentForm` の4つはこの形. `MeetingMinutesDocumentForm` だけは参加者/議題/場所
が選択中の会議に応じて自動入力されるため, マウント時点の初期値 — 今日最初の会議, または
「新しい会議」 — からの変化を基準にしています. 会議の選択自体を変えることも「入力」に
含めています).

## `useBlocker` の shouldBlock 判定

`isDirty` かつ `currentLocation.pathname !== nextLocation.pathname` の間, react-router が
検知できるナビゲーション (`<Link>`/`<NavLink>` クリック, `navigate()` の呼び出し, ブラウザ
の戻る/進むボタンいずれも) を全てブロックします. ブロックされると `blocker.state ===
"blocked"` になり, これを検知して (`useEffect` で `setState` するのではなく, 派生値として)
「入力内容を破棄」ボタンと同じ `discardConfirmOpen` を true にします — 呼び出し元
(Link クリックかブラウザの戻るボタンか) を問わず, 同じ1つのダイアログ/状態に合流させる
ことで, ダイアログ自体は新設せずに済んでいます.

## 破棄時の遷移先

破棄が選ばれた場合の遷移先は, クリックしたリンクの遷移先ではなく**常に「元の画面」**です
— 「入力内容が破棄された場合は元の画面に戻ってほしい」という依頼どおり, ブロックされた
ナビゲーション (`blocker.location`) へは `blocker.proceed()` で進めず, `blocker.reset()`
でいったん取り消した上で, 「入力内容を破棄」ボタンと全く同じ `navigateBackPastCreationPages()`
(後述) を自前で呼び直しています.

## `leavingRef` (`useRef`)

送信/破棄が確定し, これから自分自身で離脱のナビゲーションを行う間だけ shouldBlock を無効化
するためのフラグです — 無ければ, その離脱ナビゲーション自体も「別ページへの遷移」として
再びブロックされてしまいます (`leavingRef.current = true` にした後はコンポーネントごと
画面遷移して消えるため, false へ戻す処理は不要です).

## `useNavigateBackPastCreationPages` (`features/organization/`)

「入力内容を破棄」ボタンと, ブロックされたナビゲーションからの破棄のどちらからも呼ばれる,
「元の画面に戻る」処理です. 単純に `navigate(-1)` するのではなく, **遡った先がさらに作成
画面 (`/documents/new`/`/documents/new/upload`/`/book/new`/`/orgs/new`,
`CREATION_PAGE_PATHS`) であれば, その前まで連続して遡ります** — ヘッダーの「作成」ドロップダウンから, ある作成画面 (まだ何も入力していない)
→ 別の作成画面, と連続して遷移した後に後者へ入力してから離脱するようなケースを想定して
います (未入力のままの作成画面同士の移動はそもそもブロックされないため, 実際に踏める経路
です). 遡る先が記録されていない (直接この URL を開いた場合など) 場合はホーム (`/`) へ
フォールバックします.

- **`useNavigationHistoryTracking`** (`src/lib/`, `AppLayout` から1度だけ呼び出し) が,
  SPA 内で遷移してきたパスの履歴を `sessionStorage` (`src/lib/navigationHistoryStack.ts`)
  へ追跡し続けています — ブラウザの実際の history スタックの中身は読み取れない (セキュリ
  ティ上の制約) ため自前で追跡する必要があり, `useNavigationType()` (`PUSH`/`REPLACE`/
  `POP`) に応じてスタックへの積み下ろしを行っています. `sessionStorage` を使うのはタブを
  閉じるまでは保持しつつ (リロードにも耐える) 他のタブとは共有しない (実際のブラウザ
  history もタブごとに独立している) ためです. 特定の機能に紐付かない汎用の下回りのため
  `src/lib/` に置き, 「作成画面」という具体的な概念を知る
  `isCreationPagePath`/`useNavigateBackPastCreationPages` は消費側の
  `features/organization/` に置く, という役割分担にしています.

## `beforeunload`

タブを閉じる/リロードする/直接別 URL を入力する, といった SPA の外側の離脱は `useBlocker`
では検知できないため, `isDirty` の間はブラウザ標準の確認ダイアログ (`beforeunload` +
`event.preventDefault()`) で別途カバーしています — こちらは文言をカスタマイズできない
ブラウザ既定のプロンプトになります.
