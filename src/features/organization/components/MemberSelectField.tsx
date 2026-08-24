import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import styles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";

import type { OrganizationMember } from "../types";

type MemberSelectFieldProps = {
  id?: string;
  members: OrganizationMember[];
  placeholder: string;
  onSelect: (member: OrganizationMember) => void;
};

// 「議事録を作成」モードの参加者追加. OrganizationSelectField と同じ土台
// (selectFieldBase.module.css) を使うが, 「選択済みの値を持つ欄」ではなく
// 「押すたびに1件追加するピッカー」のため, value/onChange ではなく
// members (まだ追加していない候補)/onSelect (選ぶと即座に追加され, トリガー
// のラベルはプレースホルダーのまま変化しない) という形にしている
function MemberSelectField({ id, members, placeholder, onSelect }: MemberSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel}>{placeholder}</span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                onSelect(member);
                close();
              }}
              className={menuItemBase.root}
            >
              <Avater size={20} />
              <span>{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { MemberSelectField };
