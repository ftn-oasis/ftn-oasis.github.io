import { Button } from "@src/components/ui/Button";
import { dateKey, formatDate } from "@src/features/organization/calendarUtils";
import { DiscardConfirmDialog } from "@src/features/organization/components/DiscardConfirmDialog";
import { MeetingDatePicker } from "@src/features/organization/components/MeetingDatePicker";
import { MeetingLocationSelectField } from "@src/features/organization/components/MeetingLocationSelectField";
import requestFormStyles from "@src/features/organization/components/requestFormBase.module.css";
import { RequestConfirmDialog } from "@src/features/organization/components/RequestConfirmDialog";
import { useRequestSubmitFlow } from "@src/features/organization/useRequestSubmitFlow";
import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";
import { currentUser } from "@src/lib/currentUser";
import clsx from "clsx";
import { useRef, useState } from "react";

import { ROOM_NAMES } from "../mockData";
import { ReservationRequesterSelectField } from "./ReservationRequesterSelectField";

import styles from "./NewRoomReservationSection.module.css";

// 「部屋を予約する個人･組織」の選択肢 — 「組織は自身が所属するもののみ表示」
// という依頼のため, 個人側も対称的に自分自身 (currentUser) の1件のみに
// 絞っています (他人に代わって予約する想定は無いため). id は "individual:"/
// "organization:" を前置し, 実体の種類を判定できるようにしています
const REQUESTER_OPTIONS = [
  { id: `individual:${currentUser.id}`, label: `本人 (${currentUser.name})` },
  ...MOCK_MY_ORGANIZATIONS.map((organization) => ({
    id: `organization:${organization.id}`,
    label: organization.name,
  })),
];
const DEFAULT_REQUESTER_ID = REQUESTER_OPTIONS[0]?.id ?? "";

const DEFAULT_ROOM = ROOM_NAMES[0] ?? "";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";
const DEFAULT_DURATION_MINUTES = 60;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// ~/room-reservations/new — CreateButton の「新館の使用を申請」が指すページ.
// 「基本的には ~/meetings/new と同じで」という依頼のため, NewMeetingSection
// と同じ構成 (単一カラムのフォーム, useRequestSubmitFlow による確認画面/
// 破棄確認/離脱ガード, 日付/時間フィールドは MeetingDatePicker/type="time"
// をそのまま再利用) です. 参加者フィールドに相当するものは依頼文に無いため
// 持たせていません. 依頼文には「予約する部屋」の選択欄が明記されていません
// でしたが, 新館予約を作るページとして必須と判断し (ユーザーに確認済み),
// NewMeetingSection の「会議場所」に相当する項目として追加しています —
// ただしこちらは新館の部屋という固定の物理的な設備一覧のため, 「会議場所」の
// ような自由入力 (allowCustom) は付けていません
function NewRoomReservationSection() {
  const [requesterId, setRequesterId] = useState(DEFAULT_REQUESTER_ID);

  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

  const [room, setRoom] = useState(DEFAULT_ROOM);

  const [reservationDate, setReservationDate] = useState(() => new Date());
  // isDirty 判定 (下記) のための, マウント時点の日付 (= 既定値) を保持するだけの
  // state (以後は更新しない) — NewMeetingSection の initialDate と同じ考え方
  const [initialDate] = useState(reservationDate);

  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  // 開始時刻の変更時に「予約時間の長さ」を保つために参照する — NewMeetingSection
  // の durationMinutesRef と同じ考え方
  const durationMinutesRef = useRef(DEFAULT_DURATION_MINUTES);

  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setEndTime(minutesToTime(timeToMinutes(nextStart) + durationMinutesRef.current));
  };

  const handleEndTimeChange = (nextEnd: string) => {
    setEndTime(nextEnd);
    const nextDuration = timeToMinutes(nextEnd) - timeToMinutes(startTime);
    if (nextDuration >= 0) {
      durationMinutesRef.current = nextDuration;
    }
  };

  const trimmedTitle = title.trim();
  const nameError = !trimmedTitle ? "予約の名目を入力してください." : undefined;
  const timeError =
    timeToMinutes(endTime) < timeToMinutes(startTime)
      ? "終了時刻は開始時刻より後に設定してください."
      : undefined;

  const isValid = !nameError && !timeError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (本人/先頭の部屋/今日/
  // 09:00-10:00) から変わっていない状態を「未入力」とみなす
  const isDirty =
    trimmedTitle !== "" ||
    requesterId !== DEFAULT_REQUESTER_ID ||
    room !== DEFAULT_ROOM ||
    dateKey(reservationDate) !== dateKey(initialDate) ||
    startTime !== DEFAULT_START_TIME ||
    endTime !== DEFAULT_END_TIME;

  const {
    submitAttempted,
    confirmOpen,
    discardConfirmOpen,
    handleSubmit,
    handleConfirmedSubmit,
    handleRequestCancel,
    handleDiscard,
    closeConfirm,
    closeDiscardConfirm,
  } = useRequestSubmitFlow({
    isValid,
    isDirty,
    pendingMessage: "新館の使用を申請しています…",
    successMessage: "新館の使用の申請が完了しました.",
  });

  const showTitleError = (titleTouched || submitAttempted) && nameError;
  const showTimeError = submitAttempted && timeError;

  const selectedRequester = REQUESTER_OPTIONS.find((option) => option.id === requesterId);

  return (
    <div className={requestFormStyles.root}>
      <h1 className={requestFormStyles.heading}>新館の使用を申請</h1>
      <p className={requestFormStyles.subtitle}>新しく新館の使用を申請します.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <label htmlFor="new-room-reservation-requester" className={requestFormStyles.label}>
            1. 予約する個人･組織<span className={requestFormStyles.required}>*</span>
          </label>
          <ReservationRequesterSelectField
            id="new-room-reservation-requester"
            options={REQUESTER_OPTIONS}
            value={requesterId}
            onChange={setRequesterId}
          />
        </div>

        <div className={requestFormStyles.field}>
          <label htmlFor="new-room-reservation-title" className={requestFormStyles.label}>
            2. 予約の名目<span className={requestFormStyles.required}>*</span>
          </label>
          <input
            id="new-room-reservation-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTitleTouched(true)}
            aria-invalid={Boolean(showTitleError)}
            className={clsx(
              requestFormStyles.input,
              showTitleError && requestFormStyles.inputError,
            )}
          />
          {showTitleError && <p className={requestFormStyles.error}>{nameError}</p>}
        </div>

        <div className={requestFormStyles.field}>
          <label htmlFor="new-room-reservation-room" className={requestFormStyles.label}>
            3. 予約する部屋<span className={requestFormStyles.required}>*</span>
          </label>
          <MeetingLocationSelectField
            id="new-room-reservation-room"
            locations={ROOM_NAMES}
            value={room}
            onChange={setRoom}
          />
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            4. 予約する日付<span className={requestFormStyles.required}>*</span>
          </span>
          <MeetingDatePicker selectedDate={reservationDate} onSelect={setReservationDate} />
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            5. 予約する時間<span className={requestFormStyles.required}>*</span>
          </span>
          <div className={styles.timeRangeRow}>
            <input
              type="time"
              aria-label="開始時刻"
              value={startTime}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              className={clsx(requestFormStyles.input, styles.timeInput)}
            />
            <span className={styles.timeSeparator}>〜</span>
            <input
              type="time"
              aria-label="終了時刻"
              value={endTime}
              onChange={(event) => handleEndTimeChange(event.target.value)}
              aria-invalid={Boolean(showTimeError)}
              className={clsx(
                requestFormStyles.input,
                styles.timeInput,
                showTimeError && requestFormStyles.inputError,
              )}
            />
          </div>
          {showTimeError && <p className={requestFormStyles.error}>{timeError}</p>}
        </div>

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            申請する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "予約する個人･組織", value: selectedRequester?.label ?? "" },
            { label: "予約の名目", value: trimmedTitle },
            { label: "予約する部屋", value: room },
            { label: "日付", value: formatDate(reservationDate) },
            { label: "時間", value: `${startTime} 〜 ${endTime}` },
          ]}
          heading="この内容で申請しますか?"
          confirmLabel="申請する"
          onEdit={closeConfirm}
          onConfirm={handleConfirmedSubmit}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmDialog onDiscard={handleDiscard} onKeepEditing={closeDiscardConfirm} />
      )}
    </div>
  );
}

export { NewRoomReservationSection };
