# 組織の会議一覧 (`/orgs/:orgId/meetings`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`src/features/organization/components/OrganizationMeetingsSection.tsx` は
`/orgs/:orgId/meetings` ([`organization-profile.md`](organization-profile.md)) の本文です.
他の一覧と同様「基本的な構造は文書一覧と同じで, そこからの変更点」という依頼文の通り
`Document*` 系を `Meeting*` として並行複製していますが, 依頼内容自体がリスト/カレンダー
モードの切り替えという大きな追加機能を含むため, 他の一覧より新規コンポーネントが多くなって
います.

以下は最終的な仕様のみを記載しています (この機能は依頼が何度も細かく往復した経緯があります
— 試行錯誤の過程は git 履歴を参照してください).

## 型 (`types.ts`)

`type OrganizationMeeting`/`MeetingStatus` — `status` (`Normal`/`Postponed` (延会)/
`Canceled` (流会)) を持ちます. 日付は `startsAt` (開催日時)/`scheduledAt` (登録日時, ソート
用の2本目の日付として `DocumentSortField` の `editedAt`/`createdAt` に相当) をどちらも
ISO 形式 (`"YYYY-MM-DDTHH:mm"`, タイムゾーン無し — ローカルタイムとして `new Date(...)`
でそのまま解釈させるため) の文字列で持たせています. `MeetingSortField`
(`StartsAt`/`ScheduledAt`/`Title`, ラベルは「開催日時」/「予定日時」/「会議名」) も他と同じ
3フィールド構成です. (会議詳細ページとの型拡張 — `attendees`/`materials`/`minutes`
の追加 — は [`meeting-detail.md`](meeting-detail.md) を参照.)

## `src/features/organization/calendarUtils.ts`

カレンダー表示 (ミニカレンダー/2週間カレンダー) で共通して使う日付計算をまとめた, feature
直下のユーティリティです (ドメインにもコンポーネントにも依存しない汎用処理ですが, この
カレンダー機能でしか使わないため `src/lib/` ではなくここに置いています). 週の始まりは
日曜日で統一.

> **`dateKey(date)` (年月日から `"YYYY-MM-DD"` を組み立てる, カレンダーの日付グルーピング用の
> キー) は `Date.toISOString().slice(0, 10)` を使わないよう注意してください** —
> `toISOString()` は UTC 変換を伴うため, ローカルタイムゾーンが UTC からずれていると
> `getDate()` 等 (ローカル基準) ベースの表示日と1日ずれる不具合になります (実装中に実際に
> 発生し, `MeetingCalendarView` の日付セルとその中の会議カードの日付が食い違うというかたちで
> 表面化しました). ローカルの年月日 (`getFullYear()`/`getMonth()`/`getDate()`)
> から文字列を組み立てる形にしています.

なお `roomReservations` 機能もこのユーティリティをそのまま再利用しています —
[`room-reservations.md`](room-reservations.md) を参照.

## `MiniCalendar`

`MeetingFilterSidebar` の下部, 分割線 (`Divider`, 横線) の下に表示する, macOS の
カレンダーアプリ左下のような月表示です. `.calendarSection` (`MeetingFilterSidebar.module.css`,
`Divider`+`MiniCalendar` をまとめた `margin-top: auto` の `<div>`) に包まれており, サイドバー
(`MeetingFilterSidebar` の `.root`, 高さの決め方は後述) の**最下部に貼り付きます**.

- `highlightWeekStart: Date` prop に `MeetingCalendarView` の `weekStart` state をそのまま
  渡し (`OrganizationMeetingsSection` → `MeetingFilterSidebar` → `MiniCalendar` のバケツ
  リレー), その週から `HIGHLIGHT_WEEK_COUNT` (= 2, `MeetingCalendarView.tsx` の
  `WEEK_COUNT` と同じ数を維持する定数) 週分を青枠で囲んでメイン側と連動していることを示します.
  `showHighlight: boolean` prop (`viewMode === ViewMode.Calendar`) が偽のとき (リスト表示中)
  はこの枠を非表示にします.
- 自身の表示月は独立した `useState<Date>` (`monthAnchor`, 既定は今日を含む月) で管理し,
  ヘッダーの `<IconChevronLeft/Right>` (1回で1か月移動) と「今日」ボタンで手動でも移動
  できますが, `highlightWeekStart` が変わったタイミングでレンダー中に `monthAnchor`
  を追従させます ([React 公式の "props に応じて state を調整する" パターン](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  — `useEffect` + `setState` だとカスケードする再レンダーになるため, 前回の
  `highlightWeekStart` を保持した `useState` と比較し, 変化していたらレンダー中に直接
  `setMonthAnchor` する形にしています) — 手動で別の月に移動していても, メイン側の週が
  変わった時点でそちらが優先されます.
- **`resolveHighlightMonthAnchor(highlightWeekStart)`**: `highlightWeekStart` が属する月を
  そのまま使うと, ハイライトする2週間の末尾が6行グリッドの6行目にかかって見切れることが
  あります (例: 月末最終週の日曜が起点になる場合). **7行目を追加して回避するのではなく,
  その場合は翌月を返します** — 月末に近い週は翌月グリッドの1行目 (前月末の前詰め) として
  必ず収まるため, これだけで確実に回避できます. **この回避処理は自動追従のときだけ**適用
  され, 手動の前月/翌月ボタンは単純な±1か月のままです — 手動ボタンにも適用すると, 見切れる
  月に向かって「前月」を押したときに翌月へ弾かれ, その方向にはそれ以上進めなくなるためです.
- ヘッダー行 (`.header`) は年月ラベル (0.9rem, サイドバーの他の文字と同じ大きさ) を左に,
  `[<][今日][>]` を右寄せで並べます. この `[<][今日][>]` (`MeetingCalendarView` のメイン側
  ナビゲーションも同様) は3つの `<button>` がそれぞれ個別の border を持つのではなく,
  **`calendarNavGroup.module.css` (`.root`: 外枠の border+border-radius, `.item`:
  隣接ボタンとの間の `border-left`) という共有 CSS Module** で「1つの罫線付きボックスの中に
  区切り線で仕切られた3ボタン」という見た目を実現しています. `.root` は `overflow: hidden`
  を使わず, 最初/最後の子要素にだけ `:first-child`/`:last-child` で角丸を個別指定しています
  — サイドバーの `<`/`>` に付けた `.tooltip` (`content: attr(aria-label)` の CSS のみの
  ホバー時ツールチップ, `controlBase.module.css` と同じ仕組み) が `position: absolute;
  top: 100%;` で下にはみ出すため, `overflow: hidden` があるとそれごと切り取られてしまう
  ためです. **`.navButton`/`.todayButton` 自身に `border: none;` を書かないよう注意して
  ください** — import 順序の都合で `.item` の `border-left` (区切り線) を上書きして
  しまいます (button の border は `src/index.css` のグローバルなベースラインで既に none
  のため, 再指定は不要かつ有害です).
- 週の行は `<div>` ではなく **`<button type="button">`** です — `onWeekSelect:
  (weekStart: Date) => void` prop (クリックした行の先頭日曜日を渡す) で行全体をクリック
  可能にしています. 実際に何をするか (メインの週を切り替えるか, 検索欄に期間を入力するか)
  は呼び出し元 (`OrganizationMeetingsSection`, 後述) が判断します. **`border-radius` は
  `:hover` に付けていません** — `.weekHighlightTop`/`.weekHighlightBottom` (角だけを丸める
  指定) と衝突し, ハイライト中の行をホバーした際に四隅すべてが丸まってしまうためです.
- 日付セルは「外側 `.day` (33px 四方) が内側 `.dayInner` (24px の円) を中央に包む」二重構造
  です — 円の半径を枠 (行の `border`) より一回り小さくして接触を避けています.
  `.weekdayRow`/`.weeks` は `align-self: center;` で内容の幅ぴったりに収めた上で中央寄せに
  しています — これが無いと (幅いっぱいに引き伸ばされてしまい) 週の枠線
  (`.weekHighlighted`) がサイドバーの余白領域まで囲んでしまいます. 今日は `.dayInner` に
  `--color-link` の背景+白文字+`font-weight: 700` を適用します.

## `MeetingFilterSidebar`

依頼文で明示された7件 (`IconHome` 全て/`IconBinaryTree` 組織内のみ/`IconCalendarEvent`
開催予定/`IconUsers` 要参加/`IconCalendarRepeat` 延会/`IconCalendarOff` 流会/`IconArchive`
過去の会議) + `.calendarSection` (`Divider` + `MiniCalendar`, 上記) という構成です.
フィルター一覧自体の構造 (menuItemBase ベース) は他と同一です. `viewMode`/`onWeekSelect`
を受け取り, そのまま `MiniCalendar` に渡すだけの中継点です.

**サイドバーの縦幅**: 他3つのサイドバーと同じ `useFixedSidebarPosition`
(`position: fixed` + プレースホルダー, 詳細は [`organization-documents.md`](organization-documents.md))
を使い, `top`/`left`/`width` はフックの戻り値をそのまま適用しています. それに加えて
**`height` だけ, フックが返す `top` と `div#root` (`index.html` の React マウント先)
の下端から `MeetingFilterSidebar.tsx` 側で追加で算出**しています
(`Math.max(0, rootBottom - position.top)`) — 「ミニカレンダーの最下部は, windowの最下部
ではなくdiv#rootの最下部に合わせてほしい」という依頼のため (当初は `window.innerHeight`
を使っていました). `#root` の下端は `document.getElementById("root")!
.getBoundingClientRect().bottom` で, `document.body.getBoundingClientRect().bottom`
と同様 `position: fixed` な子孫 (このサイドバー自身を含む) の分だけ膨張しないため, 自分
自身の高さの算出に使っても循環参照にはなりません. `window.innerHeight` (常に一定) と異なり
`#root` の下端は viewport 相対の位置が scroll のたびに変わるため, レンダーのたびに都度実測
しています — `position` (`useFixedSidebarPosition` が scroll のたびに再計算して返す state)
が変わるたびにこのコンポーネントも再描画されるため, scroll/resize に対しては専用のリスナーを
別途持たなくても追従できます. ただし `#root` の高さは `MeetingCalendarView` 側の JS
(マウント後の `requestAnimationFrame` で高さを実測・確定する非同期処理) によっても変わる
ため, **`ResizeObserver` で `#root` 自体のサイズ変化も別途検知して再描画しています** —
これが無いと, サイドバーが自身の position/height を最初に計算した時点ではまだメイン側の
高さが確定しておらず, 古い `#root` の下端を元にした高さのまま取り残される不具合になって
いました (実装中に実際に発生し, Playwright で `sidebarBottom` と `rootBottom` の実測値が
ずれることで確認しました). **`MeetingCalendarView` (カレンダーモードのメイン側) の高さも
この `#root` の下端と一致させる必要がありますが, それは `MeetingCalendarView` 自身が別途
JS で実測しています** (詳細は下記) — サイドバーが `position: fixed` になったことで CSS
Grid の行の高さ計算に一切寄与しなくなったため, 「メイン側がサイドバーの高さに `flex`
で便乗する」という以前の方式は使えなくなっています.

## `ViewModeToggle`

検索バーの隣に配置する, リスト/カレンダー表示の切り替えトグルです. 常に両方のアイコン
(`IconCalendarWeek`/`IconMenu2`) を表示したまま, 選択中を示す `.indicator` を
`transform: translateX()` でスライドさせます. **既定はカレンダー表示**
(`ViewMode.Calendar` — 「カレンダー表示が標準になるようにしてほしい」という依頼のため.
当初はリスト表示が既定でした). `.indicator` は独立した `border`/
`background: var(--color-background)`/`box-shadow` を持つ「トラック (`.root`,
`--color-surface0` の少し沈んだ背景) の上に浮いたボタン」に見えるようにしています
(`z-index: 1` の `.indicator` の上に `z-index: 2` の `<button>` が重なる2層構成). ボタン間
の区切り線 (`.divider`) は indicator と重なって見づらかったため削除しています.
**ツールチップ**: `aria-label` (「週間表示に切り替え」/「リスト表示に切り替え」) を
`calendarNavGroup` と同じ `content: attr(aria-label)` ベースの CSS で `.button` に直接
表示します (両方のボタンが対象なので `calendarNavGroup` の `.tooltip` のような opt-in
クラスに分ける必要はありません).

## `MeetingListRow`

`MemberListRow` と同じ2行構成ですが, 先頭がアバターではなく (会議に写真は無いため) 直接
テキストから始まります — タイトル行に会議名 (太字) + 状態に応じた `Label` (`Postponed`
→ `color="mauve"` の「延会」, `Canceled` → `color="sky"` の「流会」, `Normal` は何も
表示しない), 概要行に議題をコンマ区切りにした文字列を表示します. 右詰め2段は
`IconCalendarTime` + 開催日時 (`YYYY/MM/DD HH:mm`)/`IconDoor` + 教室名です.

## `MeetingListBox`/`MeetingSortDropdown`/`MeetingSearchBar`

他の一覧 (特に `MemberListBox` — ページ切り替え時の自動フォーカス, 矢印キーでの行移動,
`role="listbox"` + `tabIndex={-1}` を含む) と同一構造の複製です. 件数表示は「n件の会議」,
検索欄のプレースホルダーは「会議を検索」.

## 週選択時の挙動の切り替え (`OrganizationMeetingsSection`)

`MiniCalendar` の週ボタンをクリックしたときの実際の挙動は, 状態を一元管理する
`OrganizationMeetingsSection` の `handleCalendarWeekSelect` が `viewMode` を見て判断します
— **カレンダーモードならその週を `calendarWeekStart` (= メインの表示期間の先頭) にする**,
**リストモードなら**他のサイドバーフィルターと同じ「ラベル: 値」形式 (`` `期間:
${formatDate(weekStart)}-${formatDate(weekEnd)}` ``, 例: `期間: 2026/08/09-2026/08/15`)
の文字列を検索欄に入れます (フィルター自体はまだ実装しないため, 他のフィルターと同様に
実際には一覧は絞り込まれません).

## `MeetingCalendarView`

カレンダーモードのメイン表示です. リストモードのページネーションと同じ位置に, 見出し +
`[<][今日][>]` のナビゲーション (`calendarNavGroup`, 上記) を表示します. 本体は7列×2行の
`display: grid` で, `WEEK_COUNT = 2` (`MiniCalendar` の `HIGHLIGHT_WEEK_COUNT` と揃える
定数) 週分, `calendarUtils.getWeeksGridDays(weekStart, WEEK_COUNT)` が返す14日分を並べて
います. **グリッドに `overflow: hidden` を使っていません** — 角丸の見た目のためだけに
付けると, 日付セル内のカードのホバーポップオーバー (セルの外, 隣接する行にまではみ出して
表示される) まで一緒に切り取られてしまうため, 4隅のセルだけ `:nth-child(1)`/
`:nth-child(7)`/`:nth-child(8)`/`:nth-child(14)` で個別に `border-*-radius`
を指定しています.

- **上段 (今週) は下段 (次週) の2倍程度の高さ**: `grid-template-rows: 2fr 1fr;` に加え,
  `.dayCellTopRow { min-height: 200px; }`/`.dayCellBottomRow { min-height: 100px; }`
  で表現しています. 上段の日付 (`index < 7`) だけ `MeetingCalendarCard` に `expanded`
  prop を渡します (下記).
- **ナビゲーションは上下矢印 (`IconChevronUp`/`IconChevronDown`) で, 1週間ずつ**移動します
  (`addDays(weekStart, ±7)`) — 表示している週数 (`WEEK_COUNT` = 2週間分) とナビゲーション
  の移動量 (1週間) は独立しており, 矢印を押すたびに表示がスライドウィンドウのように1週ずつ
  ずれます.
- **見出しの年月は「表示中の2週間のうち日数の多い方の月」**: `calendarUtils.
  getDominantMonthAnchor(weekStart, days)` が, 14日分を月ごとに集計し最多の月を返します
  (同数の場合は `weekStart` — 上段の週 — の月を優先. 実装は `topWeekKey` の集計数を初期値
  にして, より多い月が見つかったときだけ上書きする形でこの優先順位を表現しています).
- **見出しの月と異なる日付は `MM/DD` 表示**: 各日付セルの数字は, `isSameMonth(day,
  displayMonthAnchor)` が偽の場合 `calendarUtils.formatMonthDay(day)` (`"MM/DD"`) を,
  真の場合は `day.getDate()` を表示します. `.dayNumber` は `MM/DD` (5文字) も収まるよう
  `min-width: 24px; padding: 0 6px; border-radius: 999px;` のピル形状です (1-2桁の通常の
  日付は実質的に円に見えます).
- 休日 (土日) の欄は `.dayCellWeekend { background: var(--color-secondary1); }`
  (Catppuccin `mantle`) で背景のトーンを落としています. 今日の日付 (`.dayNumberToday`)
  は `font-weight: 700` です.
- **縦幅は window の下端に一致するよう JS で実測しています** — 「メインがカレンダー表示の
  場合には, その最下部がミニカレンダーの最下部に来るようにしてほしい」という依頼のため.
  `.grid` の `getBoundingClientRect().top` から `window.innerHeight - top` を計算し,
  `.grid` に inline style として直接適用しています (`MIN_GRID_HEIGHT = 300` を下限として
  フォールバックします. マウント直後の1回だけだと window の実際のビューポートが確定しきって
  おらず, わずかにずれた高さで測ってしまうことがあったため, 次のフレームでもう一度測り
  直しています — `MeetingFilterSidebar` の高さ計測で確認済みの不具合と同種です).
  **意図的に `window.innerHeight` を使い続けており, `MeetingFilterSidebar` のように
  `div#root` の下端は使っていません** — `.grid` は通常のフロー上の要素のため, その高さ
  自体が `#root` の下端を決める側の要因の1つです. もし `.grid` の高さの目標を `#root`
  の下端から逆算すると, 「今の高さを反映した `#root` の下端」を目標にして次の高さを決め,
  それがまた `#root` の下端を押し広げ…という循環 (実測するたびに
  `OrganizationMeetingsSection` の `.root` の `padding-bottom` (24px) 分だけ際限なく
  伸び続けてしまう不具合) になるため, ここだけは `.grid` 自身の高さに依存しない
  `window.innerHeight` を目標にする必要があります. 一方 `MeetingFilterSidebar` は
  `position: fixed` で通常のフローから外れており `#root` の下端の算出に一切寄与しない
  ため, 同じ問題が起きず `#root` の下端をそのまま目標にできます. **この結果, `.grid`
  の下端は `MeetingFilterSidebar`/ミニカレンダーの下端より `padding-bottom` の分 (24px)
  だけ浅い位置で止まります** — 「メイン最下部とミニカレンダー最下部を一致させる」という
  当初の依頼に対しては厳密には一致しなくなりましたが, 上記の循環を避けるための意図的な
  トレードオフです. ページ全体は依然として window よりわずかに (24px) 高くなり縦スクロール
  バーが出ます — これは, サイドバー側が `position: fixed` で常にこの高さちょうどに固定
  されているのに対し, メイン側 (`.main`) は通常のフロー上の要素のままである, という非対称な
  構造上避けられないトレードオフです. **当初は親の `.main` が CSS Grid の行の高さとして
  サイドバーと揃って伸びるのに便乗する (`flex: 1 1 auto`) 方式でしたが, サイドバーを
  `position: fixed` にしたことでサイドバーがグリッドの行の高さ計算に一切寄与しなくなり,
  この便乗方式が効かなくなったため**, 上記の JS 実測方式に戻しています.
- **土日の列で会議が無ければ幅を70%に圧縮**: `.grid`/`.weekdayRow` の
  `grid-template-columns` は CSS 上は `repeat(7, 1fr)` のままですが, 実際には JS が計算した
  文字列を inline style で上書きします. 列 (0=日曜/6=土曜) について, 上段・下段どちらの日にも
  会議が無ければその列だけ `"0.7fr"`, それ以外は `"1fr"` として結合し, `.grid` と
  `.weekdayRow` の**両方に同じ値**を適用しています (fr 単位のため圧縮した分の余白は他の列に
  自動的に再分配されます. `.weekdayRow` にも同じ列幅を渡すことで, 曜日ラベルが圧縮後の列の
  中央からずれないようにしています).
- **`.dayCell` に `min-width: 0`** を指定しています — CSS Grid の既定 (グリッドアイテムの
  自動最小サイズは中身の min-content 幅) により, これが無いとカード内の長い文字列がその日の
  列を押し広げてしまいます.

## `MeetingCalendarCard`

日付セル内のカードで, `expanded: boolean` prop (上記の通り上段の週だけ true) によって2つの
見た目に分かれます.

- **`expanded: false` (下段の週, 既定)**: 「HH:mm 会議タイトル」のみを `.cardLabel` (1行,
  省略記号) として表示し, ホバー (または `:focus-visible`) すると, リスト行と同じ情報
  (ラベル/議題/開催日時/教室) を JS を使わない CSS のみのポップオーバー (`opacity`/
  `pointer-events` を `:hover`/`:focus-visible` で切り替えるだけ) で表示します.
- **`expanded: true` (上段の週)**: ポップオーバーを使わず, 同じ情報をカード自身に常時表示
  します — タイトル行「HH:mm タイトル」(`.expandedTime` + `.expandedTitle`, 時刻はアイコン
  無しでタイトルの左横. `.expandedTime` は固定色ではなく `opacity: 0.75` — 固定色にすると
  `.card:hover` で背景色が反転した際 `color: inherit` を経由しないぶん読みにくくなり得る
  ためです), 議題 (`.expandedAgenda`, 2行で省略), 教室 (`.expandedMeta` + `IconDoor`)
  の順です. **延会/流会の `Label` (状態タグ) は expanded カードには表示しません** —
  `statusLabel` 自体は compact 版のポップオーバーでは引き続き使っています. `.expandedTitle`
  には**ネイティブの `title` 属性**が付いています — 会議名が省略記号になった場合にホバー
  で全体を見せるためで, 可変長の実データにはブラウザ標準の `title` の方が単純だと判断しました
  (詳細は [`../user-name-link.md`](../user-name-link.md) の「見切れた文言をホバーで全体
  表示」).

どちらの見た目でも, **カード自身に `overflow: hidden` を付けないよう注意してください** —
テキストの省略記号は内側の要素 (`.cardLabel`/`.expandedTitle`) だけに付けており, カード自身
(ポップオーバーの `position: absolute` の基準/containing block) に `overflow: hidden`
を付けると, カードからはみ出て表示されるはずのポップオーバーごと切り取られてしまいます
(実装中に実際に踏んだ不具合です — 「ホバーしても何も表示されない」ように見えたため, 一見
`opacity`/`pointer-events`/`z-index` の設定ミスを疑いましたが, 原因は祖先要素の
`overflow: hidden` によるクリップでした).

**ポップオーバーの左右寄せ** (compact 版のみ): 既定は左揃え (`left: 0`) ですが, グリッド
右寄りの列 (木/金/土, `MeetingCalendarView` が `columnIndex % 7 >= 4` で判定し
`popoverAlign="right"` を渡す) では右揃え (`right: 0; left: auto;`) に切り替え, ポップ
オーバーが画面右にはみ出して横スクロールバーが出てしまう不具合を避けています
(`useTooltipAlign` のような実測ベースの動的判定ではなく, 列位置による静的な判定です —
このカレンダーは列数・列幅が固定のため, この簡易な方法で十分と判断しました).

## `Label` の `color` prop

延会 (mauve)/流会 (sky) のラベル表示のため `Label` に色指定を追加しました. 詳細は
[`../ui-common-patterns.md`](../ui-common-patterns.md) を参照してください.

## モックデータ

`MOCK_ORGANIZATION_MEETINGS` (`features/organization/mockData.ts`) は今日を基準に -10日〜
+9日の20日間, 1日2件ずつ (カレンダーモードで1つの日付セルに複数件が積み上がる見た目も
確認できるように) 40件を機械的に生成しています. `MEETING_ANCHOR` はモジュール読み込み時の
`new Date()` (時刻は 0:00 にリセット) を基準にしているため, **モックデータの日付範囲は
実行時の実際の日付に追従します** (documents/book/members のような固定の過去日付起点では
ありません — カレンダーの「今日」との位置関係を常に確認できるようにするための意図的な設計
です). 9件に1件を延会, 11件に1件を流会 (両方に該当する場合は延会が優先されます) にして
います.
