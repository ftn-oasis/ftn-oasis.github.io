import {
  IconBuildingPlus,
  IconCalendarPlus,
  IconDoor,
  IconFilePlus,
  IconFileUpload,
  IconMessageReport,
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
import { useReportIssueModal } from "@src/contexts/ReportIssueModalContext";

import styles from "./CreateButton.module.css";

function CreateButton() {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();
  const { openReportIssueModal } = useReportIssueModal();

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

          <MenuLink
            to="/print-queue/new"
            icon={IconPrinter}
            label="印刷を依頼"
            onClick={close}
          />
          <MenuLink
            to="/equipment-loans/new"
            icon={IconPackage}
            label="備品貸出を申請"
            onClick={close}
          />
          <MenuLink
            to="/room-reservations/new"
            icon={IconDoor}
            label="新館の使用を申請"
            onClick={close}
          />

          <Divider />

          <MenuLink
            to="/orgs/new"
            icon={IconBuildingPlus}
            label="組織を作成"
            onClick={close}
          />

          <Divider />

          <button
            type="button"
            className={menuItemBase.root}
            onClick={() => {
              close();
              openReportIssueModal();
            }}
          >
            <Icon icon={IconMessageReport} aria-hidden="true" />
            <span>問題を報告</span>
          </button>
        </div>
      )}
    </div>
  );
}

export { CreateButton };
