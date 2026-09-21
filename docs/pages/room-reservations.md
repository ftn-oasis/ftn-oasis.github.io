# 新館予約状況ページ (`RoomReservationsPage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-meetings.md`](organization-meetings.md)

`~/room-reservations` — NavDrawer の「新館予約状況」/`CreateButton` の「新館の使用を申請」
の状況確認先が指す, 組織/文書に紐付かないグローバルな一覧ページです. 「`~/orgs/:orgId/
meetings` (`OrganizationMeetingsSection`) を参考にしてほしい」という依頼のため, リスト/
カレンダー表示切り替え・ミニカレンダー付きサイドバーを含めほぼ同じ構造を踏襲していますが,
印刷状況ページと同様に新館予約専用の新規コンポーネント一式 (`RoomReservation*`) として
実装しています. 組織にもドキュメント一覧にも依存しないため, 新しい feature
`features/roomReservations/` (`types.ts`/`mockData.ts`/`roomReservationFilters.ts`/
`components/`) として独立させています.

- **カレンダー関連の下回り (`calendarUtils.ts`/`useFixedSidebarPosition.ts`/
  `MiniCalendar`/`ViewModeToggle`/`calendarNavGroup.module.css`) は
  `features/organization/` のものをそのまま再利用しています** — これらは会議固有のデータに
  一切依存しない (`OrganizationMeeting` を直接参照しない) 汎用の日付計算/UI コンポーネント
  であることを確認した上での判断です (`NotificationFilterSidebar`
  [`notifications.md`](notifications.md) が `useFixedSidebarPosition` をあえて再利用
  しなかったのとは対照的な判断ですが, あちらはスクロール追従自体が依頼に無かったための判断
  で, こちらは「`~/orgs/:orgId/meetings` を参考に」という依頼でカレンダー表示自体が要件に
  含まれるため, 汎用的で実績のある実装をそのまま使うほうが素直です). 一方
  `OrganizationMeetingsSection`/`MeetingFilterSidebar`/`MeetingCalendarView`/
  `MeetingCalendarCard`/`MeetingListRow` 等の, `OrganizationMeeting` 型を直接扱う
  コンポーネントは「機能ごとに似た構成でも別コンポーネントとして持つ」という既存の方針
  どおり `RoomReservation*` として新規実装しています.
- **サイドバーのフィルター**: 依頼文で明示されたとおり, カレンダーモードは全て
  (`IconHome`)/要参加 (`IconUsers`) の2件, リストモードはそれに加えて使用予定
  (`IconCalendarEvent`)/過去の利用 (`IconArchive`) を含めた4件です.
  `roomReservationFilters.ts` の `ROOM_RESERVATION_FILTERS` (4件の単一配列) を,
  `MeetingFilterSidebar` の `DATE_RANGE_FILTER_KEYS` と全く同じ考え方で
  `RoomReservationFilterSidebar` がカレンダーモード中だけ `"upcoming"`/`"past"` の2キー
  を除外して表示することで実現しています — 会議一覧のような「子組織を含む」(新館予約には
  組織のスコープという概念が無い) や延会/流会相当のフィルターは無いため, 会議一覧 (7件)
  より少ない4件だけの一覧です.
- **`type RoomReservation`** (`types.ts`) — `OrganizationMeeting` を参考にした形ですが,
  延会/流会に相当する状態 (`MeetingStatus`) は概念自体が無いため持たせていません. 会議には
  無い `endsAt` (利用終了日時) を追加しています — 部屋の予約は時間帯の占有を表す概念のため,
  開始時刻だけの `OrganizationMeeting` とは異なり終了時刻も自然に必要と判断しました.
  `roomName` (予約した新館の部屋) が `OrganizationMeeting.location` に相当します.
- **対応する詳細ページはまだ無いため, `RoomReservationListRow`/`RoomReservationCalendarCard`
  は `MeetingListRow`/`MeetingCalendarCard` と違い行/カードをリンクにしていません**
  (印刷状況ページの `PrintRequestListRow` と同じ判断) — `RoomReservationListRow` は
  非対話的な `<div>`, 一覧のコンテナは `PrintRequestListBox` と同じく実際の `<ul>`/`<li>`
  です (「矢印キーでの行間移動」は対象のリンクが無いため省略していますが, ページ切り替え時
  に一覧へフォーカスする標準方針は踏襲しています). `RoomReservationCalendarCard` は
  `<Link>` の代わりに `tabIndex={0}` の `<div>` にすることで, ホバー時と全く同じ CSS
  (`:hover`/`:focus-visible`) の仕組みのままキーボードフォーカスでもポップオーバーが表示
  されるようにしています (`biome-ignore lint/a11y/noNoninteractiveTabindex` を付与
  — 対応するリンク先が無いことが理由です).
- **モックデータ**: `MOCK_ROOM_RESERVATIONS` (40件) は組織を全て `test-org` にし, 会議一覧
  の `MEETING_ANCHOR` と同じ考え方で実行時の実際の日付を起点に (1日2件ずつ, 前後10日程度
  に広げて) 生成しています. 参加者は `MOCK_MEMBERS` を index からずらして2〜4人選び, 今日
  利用予定の予約には `CURRENT_USER_AS_MEMBER` を追加して「要参加」フィルターの対象データが
  実際に存在するようにしています (`MOCK_ORGANIZATION_MEETINGS` が今日開催の会議に対して
  行っているのと同じ手法).
