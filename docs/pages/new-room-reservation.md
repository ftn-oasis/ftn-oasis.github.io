# 新館予約申請ページ (`NewRoomReservationPage`)

> 索引: [`../README.md`](../README.md) / 関連: [`../request-submit-flow.md`](../request-submit-flow.md), [`../navigation-guard.md`](../navigation-guard.md), [`room-reservations.md`](room-reservations.md)

`~/room-reservations/new` — `CreateButton` の「新館の使用を申請」(元は動作未実装の
ボタンでしたが, 今回このページの実装にあわせて `/room-reservations/new` への
リンクに変更しています) が指すページです. 「基本的には `~/meetings/new` と同じで」
という依頼のため, `NewMeetingSection` ([`new-meeting.md`](new-meeting.md) がまだ無い
場合は `src/features/organization/components/NewMeetingSection.tsx` を直接参照)
と同じ構成 (単一カラムのフォーム, `useRequestSubmitFlow` による確認画面/破棄確認/
離脱ガード, 日付/時間フィールドは `MeetingDatePicker`/`type="time"` をそのまま
再利用) を `NewRoomReservationSection` (`src/features/roomReservations/components/`)
として実装しています. 新館予約は組織/文書に紐付かないグローバルな概念のため,
`~/room-reservations` (`RoomReservationsSection`) と同じく `features/roomReservations/`
に配置しています.

## 依頼文には無かった「予約する部屋」欄について

依頼文の4項目 (個人･組織/名目/日付/時間) には, `NewMeetingSection` の「会議場所」に
相当する「どの部屋を予約するか」の選択欄が含まれていませんでした. 新館予約を作る
ページとして必須の項目と判断し, ユーザーに確認のうえ追加しています — 「予約する
部屋」として, 依頼された4項目の2番目 (予約の名目) と3番目 (予約する日付) の間に
挿入しました (`NewMeetingSection` の「会議名」→「会議場所」の並びと同じ位置関係).
選択肢は既存の新館の部屋一覧 (`ROOM_NAMES`, `features/roomReservations/mockData.ts`
— この実装にあわせて新規に export しています) で, `MeetingLocationSelectField`
をそのまま再利用しています. ただし `MeetingLocationSelectField` の「会議場所」
での用途とは異なり, `allowCustom` は付けていません — 新館の部屋は固定の物理的な
設備一覧であり (会議場所の「オンライン」のような自由記述が必要な選択肢が無い),
自由入力の必要が無いと判断したためです.

## 1. 予約する個人･組織 (`ReservationRequesterSelectField`)

「入力式のドロップダウンで選択. 組織は自身が所属するもののみを表示」という依頼の
ため, 既存の `selectFieldBase` 系ドロップダウン (トリガーが押すだけの `<button>`)
とは異なる, **社内初の「入力しながら候補を絞り込めるコンボボックス」** を新規実装
しています (`MemberSelectField` 等の既存ドロップダウンはいずれも絞り込み無しの
単純な一覧のため, そのまま流用できませんでした).

- **選択肢**: ユーザーに確認のうえ, 「自分自身 (本人) + 所属組織のみ」に絞った
  小さな一覧にしています — 「組織は自身が所属するもののみ」という制約と対称的に,
  個人側も他人を代わりに指定する想定はしていません. `currentUser`
  (`src/lib/currentUser.ts`) を「本人 ({name})」として, `features/user/mockData.ts`
  の `MOCK_ORGANIZATIONS` (`StandardDocumentForm`/`NewMeetingSection` と同じ,
  currentUser が実際に所属する組織一覧) をそのまま組織側の選択肢にしています.
  `id` は `individual:`/`organization:` を前置し, 実体の種類を判定できるように
  しています (現状は表示ラベルの組み立てに使っているだけで, 他に種類分岐は
  していません).
- **「一覧に一致しない入力は自由文字列として確定できない」** という仕様のため
  (ユーザーに確認済み), blur/Escape で閉じたときは常に選択済みの値のラベルへ
  表示を戻します. 選択自体は各候補のクリックでのみ行います.
- **実装の要点**:
  - トリガーは `<button>` ではなく `<input type="text">` で, `useDismissablePopover`
    ([`../ui-common-patterns.md`](../ui-common-patterns.md)) の `open`/`wrapperRef`/
    `toggle`/`close` はそのまま流用し, `onFocus`/`onChange` 側から `toggle()`
    を呼んで開閉する形にしています (クリックで `toggle()` する既存の使い方と
    構造は同じで, トリガー要素の種類だけが違います).
  - フォーカス時に入力欄をいったん空にし, 一覧全体を見せます. 以降の入力は
    `option.label.includes(...)` (部分一致) で候補を絞り込みます.
  - **選択のクリックは `onClick` ではなく `onMouseDown` + `event.preventDefault()`**
    で処理しています — `<button>` を `onClick` で処理すると, クリックの
    `mousedown` の時点で入力欄が blur してしまい (先に blur ハンドラが未確定の
    入力文字列を選択済みラベルへ巻き戻してしまう), 実際の選択確定
    (`onClick`) より先に表示が意図しない状態に戻ってしまいます.
    `mousedown` で `preventDefault()` するとブラウザは入力欄からフォーカスを
    奪わないため, blur 自体が起きないままボタン側の選択処理だけを確定できます
    (一般的なコンボボックス実装のイディオムです).
  - `<form>` 内の `<input>` は Enter キーで既定のフォーム送信が走ってしまうため,
    このコンボボックスの `onKeyDown` で `Enter` を `preventDefault()` しています
    (選択自体は一覧のクリックでのみ行うため, Enter による確定は実装していません).
  - 見た目は `selectFieldBase.module.css` の `.wrapper`/`.menu` をそのまま
    再利用しつつ, トリガー用に `requestFormBase.module.css` の `.input` 相当の
    見た目を `<input>` 向けに書き直した専用 CSS
    (`ReservationRequesterSelectField.module.css` の `.triggerInput`) を追加
    しています — `<button>` と違い `<input>` は子要素の caret アイコンを
    持てないため, アイコンは `wrapper` (`position: relative`) を基準に絶対
    配置で重ねています.

## 2〜5. 予約の名目/予約する部屋/予約する日付/予約する時間

`NewMeetingSection` の「会議名」/「会議場所」/「日付」/「時間」とそれぞれ同じ実装
(バリデーション/エラー表示/確認画面の要約項目まで含め) です — 「参加者」に相当する
項目は依頼文に無いため実装していません (`NewMeetingSection` の `ADDABLE_MEMBERS`/
`MemberSelectField` 関連は一切使っていません).

## `CREATION_PAGE_PATHS` への登録

他の作成画面と同じく, `/room-reservations/new` を `useNavigateBackPastCreationPages.ts`
([`../navigation-guard.md`](../navigation-guard.md)) の `CREATION_PAGE_PATHS`
に登録しています.
