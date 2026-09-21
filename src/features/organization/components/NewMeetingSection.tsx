import { Button } from "@src/components/ui/Button";
import { Icon } from "@src/components/ui/Icon";
import { MOCK_ORGANIZATIONS as MOCK_MY_ORGANIZATIONS } from "@src/features/user/mockData";
import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useRef, useState } from "react";

import { dateKey, formatDate } from "../calendarUtils";
import { CURRENT_USER_AS_MEMBER, MEETING_LOCATIONS, MOCK_MEMBERS } from "../mockData";
import type { OrganizationMember } from "../types";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { CUSTOM_LOCATION_OPTION_VALUE, MeetingLocationSelectField } from "./MeetingLocationSelectField";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { MeetingDatePicker } from "./MeetingDatePicker";
import { MemberSelectField } from "./MemberSelectField";
import { OrganizationSelectField } from "./OrganizationSelectField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./NewMeetingSection.module.css";
import requestFormStyles from "./requestFormBase.module.css";

// 「会議を行う組織」— 自身が所属する組織 (StandardDocumentForm/
// NewOrganizationSection と同じ features/user/mockData.ts の MOCK_ORGANIZATIONS,
// currentUser が実際に所属する3件) から選択する. 特に「最近」を優先する情報が
// 無いため, 先頭の組織を既定値にしている
const DEFAULT_ORGANIZATION_ID = MOCK_MY_ORGANIZATIONS[0]?.id ?? "";

const DEFAULT_LOCATION = MEETING_LOCATIONS[0] ?? "";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";
const DEFAULT_DURATION_MINUTES = 60;

// 参加者に追加できる候補 — 「議事録を作成」モードの参加者追加
// (MeetingMinutesDocumentForm の ADDABLE_MEMBERS) と同じ, 組織の構成員
// (MOCK_MEMBERS) に自分自身を加えたもの
const ADDABLE_MEMBERS: OrganizationMember[] = [...MOCK_MEMBERS, CURRENT_USER_AS_MEMBER];

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

// ~/meetings/new — CreateButton の「会議を作成」が指すページ. ~/orgs/new
// (NewOrganizationSection) と同じ構成 (単一カラムのフォーム, useRequestSubmitFlow
// による確認画面/破棄確認/離脱ガード) で実装しています
function NewMeetingSection() {
  const [organizationId, setOrganizationId] = useState(DEFAULT_ORGANIZATION_ID);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

  const [locationSelection, setLocationSelection] = useState(DEFAULT_LOCATION);
  const [customLocation, setCustomLocation] = useState("");
  const isCustomLocationSelected = locationSelection === CUSTOM_LOCATION_OPTION_VALUE;
  const trimmedCustomLocation = customLocation.trim();

  const [meetingDate, setMeetingDate] = useState(() => new Date());
  // isDirty 判定 (下記) のための, マウント時点の日付 (= 既定値) を保持するだけの
  // state (以後は更新しない) — ref だと react-hooks/refs が「レンダー中の ref
  // アクセス」として誤検知するため, 素の useState にしている
  const [initialDate] = useState(meetingDate);

  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  // 開始時刻の変更時に「会議時間の長さ」を保つために参照する — 終了時刻の
  // 変更が開始時刻より早い (エラー) 場合はここを更新しないため, 直近の
  // 正しい会議時間の長さがそのまま次の開始時刻変更に引き継がれる
  const durationMinutesRef = useRef(DEFAULT_DURATION_MINUTES);

  const [attendees, setAttendees] = useState<OrganizationMember[]>([]);

  // 「開始時刻が変更された場合, 終了時刻も自動的に変更して会議時間の長さが
  // 変わらないようにする」— 開始/終了どちらも変えず, 会議時間の長さ
  // (durationMinutesRef) だけを保ったまま終了時刻を計算し直す
  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setEndTime(minutesToTime(timeToMinutes(nextStart) + durationMinutesRef.current));
  };

  // 「終了時刻を変更しても開始時刻は変化させない」— setStartTime は一切呼ばない.
  // 変更後も開始時刻以降 (会議時間の長さが0以上) であれば, その長さを次回の
  // 開始時刻変更に引き継ぐために記録しておく
  const handleEndTimeChange = (nextEnd: string) => {
    setEndTime(nextEnd);
    const nextDuration = timeToMinutes(nextEnd) - timeToMinutes(startTime);
    if (nextDuration >= 0) {
      durationMinutesRef.current = nextDuration;
    }
  };

  const trimmedTitle = title.trim();
  const nameError = !trimmedTitle ? "会議名を入力してください." : undefined;
  const locationError =
    isCustomLocationSelected && !trimmedCustomLocation
      ? "会議場所を入力してください."
      : undefined;
  // 「開始時刻よりも終了時刻が早く設定された場合はエラーとし, 開始時刻を
  // 変更することはしない」
  const timeError =
    timeToMinutes(endTime) < timeToMinutes(startTime)
      ? "終了時刻は開始時刻より後に設定してください."
      : undefined;

  const isValid = !nameError && !locationError && !timeError;

  // 「どの作成画面でも入力欄にユーザーが入力している場合は, 別のページに
  // 移動しようとした際に破棄確認を挟んでほしい」という依頼のための離脱ガード
  // 判定 (useRequestSubmitFlow.ts を参照) — 初期値 (先頭の組織/先頭の場所/
  // 今日/09:00-10:00/参加者0人) から変わっていない状態を「未入力」とみなす
  const isDirty =
    trimmedTitle !== "" ||
    organizationId !== DEFAULT_ORGANIZATION_ID ||
    locationSelection !== DEFAULT_LOCATION ||
    customLocation !== "" ||
    dateKey(meetingDate) !== dateKey(initialDate) ||
    startTime !== DEFAULT_START_TIME ||
    endTime !== DEFAULT_END_TIME ||
    attendees.length > 0;

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
    pendingMessage: "会議を作成しています…",
    successMessage: "会議の作成が完了しました.",
  });

  const showTitleError = (titleTouched || submitAttempted) && nameError;
  const showLocationError = submitAttempted && locationError;
  const showTimeError = submitAttempted && timeError;

  const selectedOrganization = MOCK_MY_ORGANIZATIONS.find(
    (organization) => organization.id === organizationId,
  );
  const resolvedLocation = isCustomLocationSelected ? trimmedCustomLocation : locationSelection;

  const addableMembers = ADDABLE_MEMBERS.filter(
    (member) => !attendees.some((attendee) => attendee.id === member.id),
  );

  return (
    <div className={requestFormStyles.root}>
      <h1 className={requestFormStyles.heading}>会議を作成</h1>
      <p className={requestFormStyles.subtitle}>新しく会議を作成します.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <label htmlFor="new-meeting-organization" className={requestFormStyles.label}>
            1. 会議を行う組織<span className={requestFormStyles.required}>*</span>
          </label>
          <OrganizationSelectField
            id="new-meeting-organization"
            organizations={MOCK_MY_ORGANIZATIONS}
            value={organizationId}
            onChange={setOrganizationId}
          />
        </div>

        <div className={requestFormStyles.field}>
          <label htmlFor="new-meeting-title" className={requestFormStyles.label}>
            2. 会議名<span className={requestFormStyles.required}>*</span>
          </label>
          <input
            id="new-meeting-title"
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
          <label htmlFor="new-meeting-location" className={requestFormStyles.label}>
            3. 会議場所<span className={requestFormStyles.required}>*</span>
          </label>
          <MeetingLocationSelectField
            id="new-meeting-location"
            locations={MEETING_LOCATIONS}
            value={locationSelection}
            onChange={setLocationSelection}
            allowCustom
          />
          {isCustomLocationSelected && (
            <input
              type="text"
              value={customLocation}
              onChange={(event) => setCustomLocation(event.target.value)}
              placeholder="会議場所を入力"
              aria-invalid={Boolean(showLocationError)}
              className={clsx(
                requestFormStyles.input,
                styles.customLocationInput,
                showLocationError && requestFormStyles.inputError,
              )}
            />
          )}
          {showLocationError && <p className={requestFormStyles.error}>{locationError}</p>}
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            4. 日付<span className={requestFormStyles.required}>*</span>
          </span>
          <MeetingDatePicker selectedDate={meetingDate} onSelect={setMeetingDate} />
        </div>

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>
            5. 時間<span className={requestFormStyles.required}>*</span>
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

        <div className={requestFormStyles.field}>
          <span className={requestFormStyles.label}>6. 参加者</span>
          {attendees.length === 0 && (
            <p className={styles.emptyHint}>参加者はまだ追加されていません.</p>
          )}
          {attendees.length > 0 && (
            <div className={styles.memberList}>
              {attendees.map((member) => (
                <div key={member.id} className={styles.memberChip}>
                  <span className={styles.memberName}>{member.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttendees((prev) => prev.filter((m) => m.id !== member.id))
                    }
                    aria-label={`${member.name}を参加者から削除`}
                    className={styles.removeButton}
                  >
                    <Icon icon={IconX} size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {addableMembers.length > 0 && (
            <MemberSelectField
              id="new-meeting-attendee-add"
              members={addableMembers}
              placeholder="参加者を追加"
              onSelect={(member) => setAttendees((prev) => [...prev, member])}
            />
          )}
        </div>

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit" color="green">
            会議を作成する
          </Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "組織", value: selectedOrganization?.name ?? "" },
            { label: "会議名", value: trimmedTitle },
            { label: "会議場所", value: resolvedLocation },
            { label: "日付", value: formatDate(meetingDate) },
            { label: "時間", value: `${startTime} 〜 ${endTime}` },
            { label: "参加者", value: `${attendees.length}人` },
          ]}
          heading="この内容で作成しますか?"
          confirmLabel="作成する"
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

export { NewMeetingSection };
