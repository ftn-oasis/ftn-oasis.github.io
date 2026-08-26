# 文書作成ページ (`NewDocumentPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md)

`~/documents/new` — `CreateButton` の「文書を作成」(`/documents/new`) が指すページです.
「GitHubのNew repositoryのページを参考とし, 組織/文書名/文書概要/公開範囲を入力できるように
してほしい」という依頼どおり, `NewDocumentSection` (`src/features/organization/components/`,
文書に関するデータを扱うため既存の `features/organization/` に配置) が単一カラムのフォーム
として実装しています. バックエンドが無いため送信後の実際の作成処理自体は行いませんが
(「動作はのちほど実装する」という既存のスタブと同じ扱い — `handleSubmit` 内にコメントで
明記), **依頼された各項目のバリデーション自体は実際に機能します**:

- **組織 (`<select>`)**: 「自身が所属している組織からドロップダウンで選択」という依頼のため,
  `features/organization/` 側の全組織一覧 (`MOCK_ORGANIZATIONS`, 28件) ではなく,
  **`features/user/mockData.ts` の `MOCK_ORGANIZATIONS`** (`Organization[]`,
  `id`/`name`/`role`. `ProfileSidebar` の「所属する組織」で使っているのと同じ, currentUser
  が実際に所属する3件 ——生徒会/新聞部/文化祭実行委員会——のリスト) を使っています. 同名の
  別のエクスポートが2つの feature に存在するため, import 時に `MOCK_ORGANIZATIONS as
  MOCK_MY_ORGANIZATIONS` としてエイリアスしています.
  - **「デフォルトで最近編集に参加した組織を入力」**: `useState` の初期値を
    `getDocumentsEditedByCurrentUser()[0]?.organizationId` (無ければ
    `MOCK_MY_ORGANIZATIONS[0].id` にフォールバック) にしています. **`getDocumentsEditedByCurrentUser`**
    (`features/organization/mockData.ts` で新規に export) は, ホーム画面の
    `MY_EDITED_DOCUMENTS` ([`home.md`](home.md)) が元々個別に実装していた「currentUser
    が editors に含まれる文書を編集日時の新しい順に返す」ロジックを, このページでも同じ形で
    必要としたため, 重複を避けて共通関数として `features/organization/mockData.ts`
    側に切り出したものです — `features/home/` はこの関数を呼ぶだけになり, 重複していた
    フィルタ/ソート処理は削除しています.
- **文書名**: 「文書IDではないので重複しても構わないが, 組織内で重複すると人間にとって
  ややこしいのでここでチェックを行う, 重複する場合は弾く」という依頼のため, 選択中の組織の
  `MOCK_ORGANIZATION_DOCUMENTS` (`organizationId` で絞り込み) の中に完全一致する `title`
  が無いかを `useMemo` でチェックしています (組織を跨いだ重複は許可 — 依頼どおりチェック
  対象外). 空文字列/重複のいずれかならエラーとして送信を弾きます. 実際にデータを持つのは
  `test-org` (文化祭実行委員会) だけのため, 重複判定が実際に機能する (弾かれる) のは組織に
  `test-org` を選んだ場合だけです — 他の2組織 (生徒会/新聞部) はまだ文書データが無いため,
  常に重複無し判定になります.
- **文書概要**: 「16文字以上・必須」のため, `description.length < 16` をエラー条件にして
  います. **`X/16文字` のカウンターは16文字未満の間だけ表示**します — 16文字を超えた後も
  そのまま表示し続けると (例: `37/16文字`) 上限を超過しているかのように誤解されるため,
  条件を満たした時点でカウンター自体を消し, ヒント文だけを残す形にしています (実装時に実際に
  見た目を確認して気付いた点で, 依頼には無い改善です).
- **公開範囲**: `DocumentVisibility.Public`/`Private` の2択をラジオボタンで提供し (GitHub
  の Public/Private の選択 UI を参考に, それぞれ短い説明文を添えています), 初期値は
  `Public` です.
- **エラー表示のタイミング**: 各項目は「一度フォーカスを外す (`onBlur`)」か「送信を試みる
  (`submitAttempted`)」までエラーを表示しません — 何も入力していない初期状態からいきなり
  赤枠/エラー文が出ないようにするためです. **送信ボタン (`Button`, 後述) はあえて
  `disabled` にしていません** — 無効化されたボタンはキーボード操作性/なぜ押せないかの説明
  という点で劣るため, 常に押せる状態にしたうえで, 無効な状態で押された場合は
  `submitAttempted` を立てて全項目のエラーを一斉に表示する (実際の送信処理はスキップする)
  という, 一般的なフォームの実装方針を採っています.

## `Button` (`src/components/ui/`)

塗りつぶしの主要アクションボタンです. README.md/CLAUDE.md の「UI コンポーネントの共通
パターン」では以前から `Button` の存在が前提として書かれていましたが実体が無かったため,
この文書作成フォームの送信ボタンの実装にあわせて新設しました. `type`/`disabled`/`onClick`/
`className` に加え, `color?: "blue" | "green"` (既定 `"blue"`, `--color-link`/文字
`--color-background`. [`organization-documents.md`](organization-documents.md) の
`Pagination` の選択中ページ番号と同じ配色) と `variant?: "filled" | "ghost"`
(既定 `"filled"`. `"ghost"` は背景透過+`--color-border` の枠線のみ) を受け取ります —
[`new-transaction.md`](new-transaction.md) (会計申請作成ページ) の確認/キャンセル系
ボタンで緑色/背景透過が必要になった際に追加した props です.
