import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";

import styles from "./OrganizationSelectField.module.css";

type Organization = {
  id: string;
  name: string;
};

type OrganizationSelectFieldProps = {
  id?: string;
  organizations: Organization[];
  value: string;
  onChange: (organizationId: string) => void;
};

// 会計申請作成フォーム (~/book/new) の組織選択. ヘッダーの「作成」ボタン
// (CreateButton) と同じ useDismissablePopover + menuItemBase の構成のパネルを,
// フォームの選択欄 (トリガー) の下に開く形式にしている. 組織名の左には
// アバターを表示する (トリガー/パネル内の各項目どちらも)
function OrganizationSelectField({
  id,
  organizations,
  value,
  onChange,
}: OrganizationSelectFieldProps) {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();
  const selected = organizations.find((organization) => organization.id === value);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button type="button" id={id} onClick={toggle} className={styles.trigger}>
        <span className={styles.triggerContent}>
          <Avater shape="square" size={20} />
          <span className={styles.triggerLabel} title={selected?.name ?? ""}>
            {selected?.name ?? ""}
          </span>
        </span>
        <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu}>
          {organizations.map((organization) => (
            <button
              key={organization.id}
              type="button"
              onClick={() => {
                onChange(organization.id);
                close();
              }}
              className={clsx(
                menuItemBase.root,
                organization.id === value && menuItemBase.active,
              )}
            >
              <Avater shape="square" size={20} />
              <span>{organization.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { OrganizationSelectField };
