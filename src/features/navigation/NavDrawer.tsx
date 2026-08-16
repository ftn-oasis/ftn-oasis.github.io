import {
  IconBook2,
  IconBuilding,
  IconCalendarTime,
  IconFileAlert,
  IconFileDescription,
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

        <MenuLink to="/" icon={IconHome} label="ホーム" />
        <MenuLink to="/issues" icon={IconFileAlert} label="改善点の指摘" />
        <MenuLink to="/pulls" icon={IconFileTextSpark} label="修正の提案" />
        <MenuLink
          to="/documents"
          icon={IconFileDescription}
          label="全ての文書"
        />
        <MenuLink to="/books" icon={IconReceiptYen} label="全ての会計申請" />
        <MenuLink
          to="/meetings"
          icon={IconCalendarTime}
          label="予定されている会議"
        />

        <Divider />

        <MenuLink
          to="https://<subdomain>.io/documents"
          icon={IconBook2}
          label="規則･資料"
        />
        <MenuLink
          to="https://<subdomain>.io/organizations"
          icon={IconBuilding}
          label="組織"
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
