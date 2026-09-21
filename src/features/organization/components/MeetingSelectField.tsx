import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled, IconPlus } from "@tabler/icons-react";
import clsx from "clsx";

import { formatTime } from "../calendarUtils";
import type { OrganizationMeeting } from "../types";

// 「議事録を作成」モードの「新しい会議」を表す特別な選択肢の値. 実在する
// 会議の id (test-org-meeting-N の形式) とは絶対に一致しない値にしている
const NEW_MEETING_OPTION_VALUE = "new-meeting";

type MeetingSelectFieldProps = {
  id?: string;
  meetings: OrganizationMeeting[];
  value: string;
  onChange: (value: string) => void;
};

// 文書作成フォーム (~/documents/new) の「議事録を作成」モードの会議選択.
// OrganizationSelectField/BudgetLineItemSelectField (~/book/new) と同じ土台
// (selectFieldBase.module.css) の上に, 一番下を Divider で区切って
// 「新しい会議」という特別な選択肢 (NEW_MEETING_OPTION_VALUE) を追加している
function MeetingSelectField({ id, meetings, value, onChange }: MeetingSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();
  const selectedMeeting = meetings.find((meeting) => meeting.id === value);
  const isNewMeetingSelected = value === NEW_MEETING_OPTION_VALUE;
  const triggerLabel = isNewMeetingSelected
    ? "新しい会議"
    : selectedMeeting
      ? `${formatTime(new Date(selectedMeeting.startsAt))} ${selectedMeeting.title}`
      : "";

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel} title={triggerLabel}>
            {triggerLabel}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => {
                onChange(meeting.id);
                close();
              }}
              className={clsx(menuItemBase.root, meeting.id === value && menuItemBase.active)}
            >
              <span>{`${formatTime(new Date(meeting.startsAt))} ${meeting.title}`}</span>
            </button>
          ))}
          <Divider />
          <button
            type="button"
            onClick={() => {
              onChange(NEW_MEETING_OPTION_VALUE);
              close();
            }}
            className={clsx(menuItemBase.root, isNewMeetingSelected && menuItemBase.active)}
          >
            <Icon icon={IconPlus} size={16} aria-hidden="true" />
            <span>新しい会議</span>
          </button>
        </div>
      )}
    </div>
  );
}

export { MeetingSelectField, NEW_MEETING_OPTION_VALUE };
