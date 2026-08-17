import {
  IconBook2,
  IconBuilding,
  IconCalendarTime,
  IconFileAlert,
  IconFileText,
  IconFileTextSpark,
  IconHome,
  IconMessageReport,
  IconReceiptYen,
  IconX,
} from "@tabler/icons-react";
import clsx from "clsx";

import { Divider } from "@src/components/ui/Divider";
import { Emblem } from "@src/components/ui/Emblem";
import { Icon } from "@src/components/ui/Icon";
import { useEscapeKey } from "@src/components/ui/useEscapeKey";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MenuLink } from "@src/components/ui/MenuLink";

import styles from "./NavDrawer.module.css";

type NavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function NavDrawer({ open, onClose }: NavDrawerProps) {
  useEscapeKey(open, onClose);

  return (
    <>
      <button
        type="button"
        className={clsx(styles.overlay, open && styles.overlayOpen)}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <nav
        className={clsx(styles.drawer, open && styles.drawerOpen)}
        aria-label="メニュー"
        aria-hidden={!open}
      >
        <div className={styles.drawerHeader}>
          <Emblem name="fth-oasis-icon" height={28} label="FTH OASIS" />
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <Icon icon={IconX} aria-hidden="true" />
          </button>
        </div>

        <MenuLink to="/" icon={IconHome} label="ホーム" onClick={onClose} />
        <MenuLink
          to="/issues"
          icon={IconFileAlert}
          label="指摘事項"
          onClick={onClose}
        />
        <MenuLink
          to="/pulls"
          icon={IconFileTextSpark}
          label="修正提案"
          onClick={onClose}
        />
        <MenuLink
          to="/documents"
          icon={IconFileText}
          label="全ての文書"
          onClick={onClose}
        />
        <MenuLink
          to="/books"
          icon={IconReceiptYen}
          label="全ての会計申請"
          onClick={onClose}
        />
        <MenuLink
          to="/meetings"
          icon={IconCalendarTime}
          label="予定されている会議"
          onClick={onClose}
        />

        <Divider />

        <MenuLink
          to="/materials"
          icon={IconBook2}
          label="規則･資料"
          onClick={onClose}
        />
        <MenuLink
          to="/orgs"
          icon={IconBuilding}
          label="組織"
          onClick={onClose}
        />

        <div className={styles.spacer} />

        <button
          type="button"
          className={clsx(menuItemBase.root, styles.reportButton)}
        >
          <Icon icon={IconMessageReport} aria-hidden="true" />
          <span>問題を報告</span>
        </button>
      </nav>
    </>
  );
}

export { NavDrawer };
