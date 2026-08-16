import {
  IconBuildingPlus,
  IconFileAlert,
  IconFilePlus,
  IconFileUpload,
  IconPlus,
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
          <button type="button" className={menuItemBase.root} onClick={close}>
            <Icon icon={IconReceiptYen} aria-hidden="true" />
            <span>新たに会計申請を作成</span>
          </button>
          <MenuLink
            to="/issues/new"
            icon={IconFileAlert}
            label="新たに改善点を指摘"
            onClick={close}
          />
          <MenuLink
            to="/documents/new"
            icon={IconFilePlus}
            label="新たに文書を作成"
            onClick={close}
          />
          <MenuLink
            to="/documents/new/upload"
            icon={IconFileUpload}
            label="文書をアップロード"
            onClick={close}
          />

          <Divider />

          <MenuLink
            to="/organizations/new"
            icon={IconBuildingPlus}
            label="新たな組織を作成"
            onClick={close}
          />
        </div>
      )}
    </div>
  );
}

export { CreateButton };
