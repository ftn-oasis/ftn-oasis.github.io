import { IconLogout, IconSettings } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import { Avater } from "@src/components/ui/Avatar";
import { Divider } from "@src/components/ui/Divider";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import { MenuLink } from "@src/components/ui/MenuLink";
import { useRolePreview } from "@src/contexts/RolePreviewContext";
import { useUserProfile } from "@src/contexts/UserProfileContext";
import { isAdminRole } from "@src/features/organization/memberRole";
import { currentUser } from "@src/lib/currentUser";

import { RolePreviewToggle } from "./RolePreviewToggle";
import { ThemePreferenceToggle } from "./ThemePreferenceToggle";

import styles from "./UserMenuButton.module.css";

function UserMenuButton() {
  const { open, wrapperRef, toggle, close } =
    useDismissablePopover<HTMLDivElement>();
  const { previewRole } = useRolePreview();
  const { avatarDataUrl } = useUserProfile();

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
        {/* ヘッダーの他のアイコンボタン (controlBase の --control-size) と
            大きさを揃える依頼のため, プリセットではなく直接 35px を指定 */}
        <Avater src={avatarDataUrl ?? undefined} size={35} />
      </button>

      {open && (
        <div className={styles.menu}>
          <Link
            to={`/users/${currentUser.id}`}
            onClick={close}
            className={clsx(menuItemBase.root, styles.profileRow)}
          >
            <Avater src={avatarDataUrl ?? undefined} size="medium" />
            <span className={styles.profileText}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userEmail}>{currentUser.email}</span>
              <span className={styles.userRole}>
                役職: {previewRole}
                {isAdminRole(previewRole) && " (管理者)"}
              </span>
            </span>
          </Link>

          <Divider />

          <MenuLink
            to="/settings"
            icon={IconSettings}
            label="設定"
            onClick={close}
          />
          <div className={styles.themeRow}>
            <ThemePreferenceToggle />
          </div>

          <Divider />

          {/* 役職によって表示する UI を出し分ける機能を確認するための,
              開発/確認用のプレビュー切り替え (実際のユーザー設定ではないため
              永続化はしない — RolePreviewContext.tsx を参照) */}
          <div className={styles.roleRow}>
            <span className={styles.roleLabel}>表示する役職 (プレビュー用)</span>
            <RolePreviewToggle />
          </div>

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
