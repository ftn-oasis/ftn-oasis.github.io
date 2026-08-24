import { Button } from "@src/components/ui/Button";
import { Icon } from "@src/components/ui/Icon";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

import {
  CURRENT_USER_AS_MEMBER,
  getMeetingsAttendedByCurrentUserToday,
  MEETING_LOCATIONS,
  MOCK_MEMBERS,
} from "../mockData";
import type { OrganizationMember } from "../types";
import { useRequestSubmitFlow } from "../useRequestSubmitFlow";
import { DiscardConfirmDialog } from "./DiscardConfirmDialog";
import { MeetingLocationSelectField } from "./MeetingLocationSelectField";
import { MeetingSelectField, NEW_MEETING_OPTION_VALUE } from "./MeetingSelectField";
import { MemberSelectField } from "./MemberSelectField";
import { RequestConfirmDialog } from "./RequestConfirmDialog";

import styles from "./MeetingMinutesDocumentForm.module.css";
import requestFormStyles from "./requestFormBase.module.css";

// 議題1件分のフォーム下書き — 自由入力のため確定した ID を持たない
// (PurchaseItemsInput の DraftPurchaseItem と同じ考え方). key として使う
// ためだけの id を crypto.randomUUID() で振っている
type DraftAgendaItem = {
  id: string;
  label: string;
};

function createBlankAgendaItem(): DraftAgendaItem {
  return { id: crypto.randomUUID(), label: "" };
}

const TODAYS_MEETINGS = getMeetingsAttendedByCurrentUserToday();
// 参加者に追加できる候補 — 組織の構成員 (MOCK_MEMBERS) に自分自身
// (CURRENT_USER_AS_MEMBER) を加えたもの
const ADDABLE_MEMBERS: OrganizationMember[] = [...MOCK_MEMBERS, CURRENT_USER_AS_MEMBER];

function getInitialMeetingSelection(): string {
  return TODAYS_MEETINGS[0]?.id ?? NEW_MEETING_OPTION_VALUE;
}

// 「議事録を作成」モード — 今日自身が参加することになっている会議を選ぶと,
// 参加者/議題/場所を自動入力する. 「新しい会議」を選んだ場合は会議名を
// 任意入力にし, 参加者/議題/場所の設定項目は「詳細設定」ボタンの奥に折りたたむ.
// 送信/確認/破棄の一連の UX は ExpenseRequestForm などと同じ
// useRequestSubmitFlow/RequestConfirmDialog/DiscardConfirmDialog を再利用している
function MeetingMinutesDocumentForm() {
  const [meetingSelection, setMeetingSelection] = useState(getInitialMeetingSelection);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  // 今日参加予定の会議が無ければ初期選択は「新しい会議」になり, その場合だけ
  // 折りたたんだ状態で始める (既存の会議が選ばれている間は詳細設定は
  // 常に表示するため, この state は「新しい会議」選択時にしか参照しない)
  const [detailsExpanded, setDetailsExpanded] = useState(() => TODAYS_MEETINGS.length > 0);
  const [attendees, setAttendees] = useState<OrganizationMember[]>(
    () => TODAYS_MEETINGS[0]?.attendees ?? [],
  );
  const [agenda, setAgenda] = useState<DraftAgendaItem[]>(() =>
    (TODAYS_MEETINGS[0]?.agenda ?? []).map((item) => ({
      id: crypto.randomUUID(),
      label: item.label,
    })),
  );
  const [location, setLocation] = useState(
    () => TODAYS_MEETINGS[0]?.location ?? MEETING_LOCATIONS[0] ?? "",
  );

  const isNewMeetingSelected = meetingSelection === NEW_MEETING_OPTION_VALUE;
  const selectedMeeting = TODAYS_MEETINGS.find((meeting) => meeting.id === meetingSelection);

  const handleMeetingChange = (value: string) => {
    setMeetingSelection(value);

    if (value === NEW_MEETING_OPTION_VALUE) {
      setNewMeetingTitle("");
      setAttendees([]);
      setAgenda([]);
      setLocation(MEETING_LOCATIONS[0] ?? "");
      setDetailsExpanded(false);
      return;
    }

    const meeting = TODAYS_MEETINGS.find((candidate) => candidate.id === value);
    if (!meeting) return;
    setAttendees(meeting.attendees);
    setAgenda(meeting.agenda.map((item) => ({ id: crypto.randomUUID(), label: item.label })));
    setLocation(meeting.location);
    setDetailsExpanded(true);
  };

  const addableMembers = ADDABLE_MEMBERS.filter(
    (member) => !attendees.some((attendee) => attendee.id === member.id),
  );

  // 会議名は「任意」の入力のため, このモードには送信を弾く必須項目が無い
  const isValid = true;

  const {
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
    pendingMessage: "議事録を作成しています…",
    successMessage: "議事録の作成が完了しました.",
  });

  const meetingTitleForSummary = isNewMeetingSelected
    ? newMeetingTitle.trim() || "新しい会議"
    : (selectedMeeting?.title ?? "");
  const nonBlankAgenda = agenda.filter((item) => item.label.trim() !== "");

  const showConfigurationFields = !isNewMeetingSelected || detailsExpanded;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className={requestFormStyles.field}>
          <label htmlFor="minutes-meeting" className={requestFormStyles.label}>
            1. 会議<span className={requestFormStyles.required}>*</span>
          </label>
          <MeetingSelectField
            id="minutes-meeting"
            meetings={TODAYS_MEETINGS}
            value={meetingSelection}
            onChange={handleMeetingChange}
          />
          {isNewMeetingSelected && (
            <div className={styles.newMeetingNameField}>
              <label htmlFor="minutes-meeting-title" className={requestFormStyles.label}>
                会議名 (任意)
              </label>
              <input
                id="minutes-meeting-title"
                type="text"
                value={newMeetingTitle}
                onChange={(event) => setNewMeetingTitle(event.target.value)}
                placeholder="新しい会議"
                className={requestFormStyles.input}
              />
            </div>
          )}
        </div>

        {showConfigurationFields ? (
          <>
            <div className={requestFormStyles.field}>
              <span className={requestFormStyles.label}>2. 参加者</span>
              {attendees.length === 0 && (
                <p className={styles.emptyHint}>参加者はまだ追加されていません.</p>
              )}
              {attendees.length > 0 && (
                <div className={styles.attendeeList}>
                  {attendees.map((member) => (
                    <div key={member.id} className={styles.attendeeChip}>
                      <span className={styles.attendeeName}>{member.name}</span>
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
                  id="minutes-attendee-add"
                  members={addableMembers}
                  placeholder="参加者を追加"
                  onSelect={(member) => setAttendees((prev) => [...prev, member])}
                />
              )}
            </div>

            <div className={requestFormStyles.field}>
              <span className={requestFormStyles.label}>3. 議題</span>
              {agenda.length > 0 && (
                <div className={styles.agendaList}>
                  {agenda.map((item, index) => (
                    <div key={item.id} className={styles.agendaRow}>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(event) => {
                          const next = [...agenda];
                          next[index] = { ...item, label: event.target.value };
                          setAgenda(next);
                        }}
                        placeholder={`議題 ${index + 1}`}
                        className={requestFormStyles.input}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAgenda((prev) => prev.filter((candidate) => candidate.id !== item.id))
                        }
                        aria-label="この議題を削除"
                        className={styles.removeButton}
                      >
                        <Icon icon={IconX} size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                className={styles.addAgendaButton}
                onClick={() => setAgenda((prev) => [...prev, createBlankAgendaItem()])}
              >
                + 議題を追加
              </Button>
            </div>

            <div className={requestFormStyles.field}>
              <label htmlFor="minutes-location" className={requestFormStyles.label}>
                4. 場所<span className={requestFormStyles.required}>*</span>
              </label>
              <MeetingLocationSelectField
                id="minutes-location"
                locations={MEETING_LOCATIONS}
                value={location}
                onChange={setLocation}
              />
            </div>
          </>
        ) : (
          <div className={requestFormStyles.field}>
            <Button type="button" variant="ghost" onClick={() => setDetailsExpanded(true)}>
              詳細設定
            </Button>
          </div>
        )}

        <div className={requestFormStyles.formActions}>
          <Button type="button" variant="ghost" onClick={handleRequestCancel}>
            入力内容を破棄
          </Button>
          <Button type="submit">議事録を作成する</Button>
        </div>
      </form>

      {confirmOpen && (
        <RequestConfirmDialog
          items={[
            { label: "会議", value: meetingTitleForSummary },
            { label: "参加者", value: `${attendees.length}人` },
            { label: "議題", value: `${nonBlankAgenda.length}件` },
            { label: "場所", value: location },
          ]}
          onEdit={closeConfirm}
          onConfirm={handleConfirmedSubmit}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmDialog onDiscard={handleDiscard} onKeepEditing={closeDiscardConfirm} />
      )}
    </>
  );
}

export { MeetingMinutesDocumentForm };
