import {
  IconBuildingPlus,
  IconCalendarPlus,
  IconDoor,
  IconFileAlert,
  IconFilePlus,
  IconFileUpload,
  IconPackage,
  IconPlus,
  IconPrinter,
  IconReceiptYen,
} from "@tabler/icons-react";

import { Divider } from "@src/components/ui/Divider";
import { Icon } from "@src/components/ui/Icon";
import { IconButton } from "@src/components/ui/IconButton";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MenuLink } from "@src/components/ui/MenuLink";

import styles from "./CreateButton.module.css";

function CreateButton() {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <IconButton
        icon={IconPlus}
        label="作成"
        dropdown
        hideTooltip={open}
        onClick={toggle}
      />

      {open && (
        <div className={styles.menu}>
          <MenuLink
            to="/book/new"
            icon={IconReceiptYen}
            label="会計申請を作成"
            onClick={close}
          />
          <MenuLink
            to="/issues/new"
            icon={IconFileAlert}
            label="改善点を指摘"
            onClick={close}
          />
          <MenuLink
            to="/documents/new"
            icon={IconFilePlus}
            label="文書を作成"
            onClick={close}
          />
          <MenuLink
            to="/documents/new/upload"
            icon={IconFileUpload}
            label="文書をアップロード"
            onClick={close}
          />
          <MenuLink
            to="/meetings/new"
            icon={IconCalendarPlus}
            label="会議を作成"
            onClick={close}
          />

          <Divider />

          {/* 動作はのちほど実装するため, 対応するルートがまだ無い他のボタンと
              同じく MenuLink ではなく素の button にしている */}
          <button type="button" className={menuItemBase.root} onClick={close}>
            <Icon icon={IconPrinter} aria-hidden="true" />
            <span>印刷を依頼</span>
          </button>
          <button type="button" className={menuItemBase.root} onClick={close}>
            <Icon icon={IconPackage} aria-hidden="true" />
            <span>備品貸出を申請</span>
          </button>
          <button type="button" className={menuItemBase.root} onClick={close}>
            <Icon icon={IconDoor} aria-hidden="true" />
            <span>新館の使用を申請</span>
          </button>

          <Divider />

          <MenuLink
            to="/organizations/new"
            icon={IconBuildingPlus}
            label="組織を作成"
            onClick={close}
          />
        </div>
      )}
    </div>
  );
}

export { CreateButton };
