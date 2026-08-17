import { IconLogout, IconSettings, IconSunMoon } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import { Avater } from "@src/components/ui/Avatar";
import { Divider } from "@src/components/ui/Divider";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MenuLink } from "@src/components/ui/MenuLink";
import { currentUser } from "@src/lib/currentUser";

import styles from "./UserMenuButton.module.css";

function UserMenuButton() {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        aria-label="ユーザーメニュー"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={styles.trigger}
      >
        <Avater size="medium" />
      </button>

      {open && (
        <div className={styles.menu}>
          <Link
            to={`/users/${currentUser.id}`}
            onClick={close}
            className={clsx(menuItemBase.root, styles.profileRow)}
          >
            <Avater size="medium" />
            <span className={styles.profileText}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userEmail}>{currentUser.email}</span>
            </span>
          </Link>

          <Divider />

          <MenuLink
            to="/settings"
            icon={IconSettings}
            label="設定"
            onClick={close}
          />
          <MenuLink
            to="/settings/theme"
            icon={IconSunMoon}
            label="外観"
            onClick={close}
          />

          <Divider />

          <MenuLink
            to="/logout"
            icon={IconLogout}
            label="ログアウト"
            onClick={close}
          />
        </div>
      )}
    </div>
  );
}

export { UserMenuButton };
