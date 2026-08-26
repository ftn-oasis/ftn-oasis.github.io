# 組織作成ページ (`NewOrganizationPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md)

`~/orgs/new` — `CreateButton` の「組織を作成」が指すページです (元は `/organizations/new`
という実在しないパスへのリンクでしたが, 依頼により `/orgs/new` へ変更しています).
「`~/documents/new` (文書作成ページ, [`new-document.md`](new-document.md)) を参考にして
ほしい」という依頼のため, `StandardDocumentForm` と同じ構成 (単一カラムのフォーム,
`useRequestSubmitFlow` による確認画面/破棄確認/離脱ガード) を `NewOrganizationSection`
(`src/features/organization/components/`) として実装しています — 文書作成フォームと違い
モードの選択肢 (「通常の文書を作成」/「議事録を作成」のような) が無いため,
`NewDocumentSection` に相当する外側のディスパッチャは無く, この1コンポーネントで完結させて
います. `/orgs/new` は `/orgs/:orgId` (`OrganizationLayout`, 「組織が見つかりません」判定を
行う) のネストしたルートには含めず, `/orgs` と同じ階層の兄弟ルートとして `App.tsx` に追加
しています — react-router は同じ階層では静的セグメント (`new`) を動的セグメント
(`:orgId`) より優先してマッチさせるため, 宣言順に関わらず `/orgs/new` が正しく
`NewOrganizationPage` に届きます. **`getBreadcrumb.ts` の `/orgs/:orgId` 分岐 (`second`
を組織 ID として名前解決する処理) は `second !== "new"` の条件を追加して対象外にしています**
— 追加しないと `/orgs/new` のパンくずが (存在しない組織 ID として) そのまま「new」と表示
されてしまうため, 代わりに `SPECIAL_ROOT_LABELS.orgs` (「組織」) に流しています.

## 入力項目

**要素は依頼文で明示された4つ**: 組織名 (テキスト入力)/親組織 (ドロップダウン)/組織種別
(ドロップダウン)/構成員 (追加/削除できる一覧) です. 組織名だけが必須項目で, 空欄, および
`MOCK_ORGANIZATIONS` (test-org を含む28件) 内の名前と完全一致する場合にエラーになります
(文書作成フォームの文書名重複チェックと同じ考え方). 親組織/組織種別/構成員はいずれも必須に
していません.

### 親組織 (`OrganizationSelectField` を再利用)

会計申請フォームの組織選択で使っている既存コンポーネント ([`new-transaction.md`](new-transaction.md))
をそのまま再利用しています — 引数の `organizations: { id, name }[]` が汎用的なため,
先頭に「なし (親組織を持たない)」という実在しない ID (空文字列) のダミー組織を合成した配列
(`PARENT_ORGANIZATION_OPTIONS`) を渡すだけで, 親組織を持たない組織 (有志など,
`OrganizationHeaderBox` のパンくず非表示条件, [`organization-profile.md`](organization-profile.md)
を参照) にも対応できています. 既定値はこの「なし」です.

### 組織種別 (`OrganizationTypeSelectField`, 新規実装)

`MeetingLocationSelectField` (グループ/アバターの無い単純な文字列一覧のドロップダウン) と
同じ構成の新規コンポーネントです. **依頼された8種類 (独立委員会/特別委員会/常設委員会/
特設委員会/事務局/部活動/同好会/有志) は, 組織一覧・組織ヘッダーの種別バッジで既に使われて
いる既存の `OrganizationType` (学級/執行機関/議決機関/独立委員会/クラブ/有志) と一致しな
かったため, ユーザーに確認のうえ `OrganizationCreationType`
(`features/organization/organizationCreationTypes.ts`) という別の独立した型として新設して
います** — 既存の一覧/ヘッダー表示のロジックやモックデータには一切手を加えていません.

> **`organizationCreationTypes.ts` 内に TODO コメントとして明記した通り, 将来的にはこの
> 2つの型 (`OrganizationCreationType`/`OrganizationType`) を統合する必要があります**
> — 「新しく作った組織の種別」と「一覧/ヘッダーで表示される既存組織の種別」が異なる語彙に
> なってしまっている状態のためです.

### 構成員 (「議事録を作成」モードの参加者入力欄を参考に再利用)

`MeetingMinutesDocumentForm` の参加者追加 UI (追加済みメンバーを削除ボタン付きのチップで
表示し, 下に `MemberSelectField` で追加候補から選ぶ) と全く同じ構造です. 追加候補は同フォーム
の `ADDABLE_MEMBERS` と同じ `[...MOCK_MEMBERS, CURRENT_USER_AS_MEMBER]` を独立して定義して
います. チップ関連の CSS (`.memberList`/`.memberChip`/`.memberName`/`.removeButton`/
`.emptyHint`) は `MeetingMinutesDocumentForm.module.css` と同じ見た目で
`NewOrganizationSection.module.css` に複製しています (「機能ごとに似た構成でも別コンポーネ
ントとして持つ」既存の方針を踏襲).

## 確認画面/送信 UX

`RequestConfirmDialog`/`DiscardConfirmDialog`/`useRequestSubmitFlow`
([`../request-submit-flow.md`](../request-submit-flow.md)) をそのまま再利用し, 見出し/
ボタン文言は `StandardDocumentForm` と同じ「この内容で作成しますか?」/「作成する」に上書き
しています. 確認画面の要約は組織名/親組織 (未選択なら「なし」のラベルがそのまま表示される)/
組織種別/構成員 (人数) の4項目です.
