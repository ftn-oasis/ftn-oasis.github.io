import { Emblem } from "@src/components/ui/Emblem";
import { IconButton } from "@src/components/ui/IconButton";
import { IconLink } from "@src/components/ui/IconLink";
import { useTooltipAlign } from "@src/components/ui/useTooltipAlign";
import { CreateButton } from "@src/features/navigation/CreateButton";
import { MenuButton } from "@src/features/navigation/MenuButton";
import { UserMenuButton } from "@src/features/navigation/UserMenuButton";
import { IconBell, IconSearch } from "@tabler/icons-react";
import { Link, useLocation } from "react-router";

import { Breadcrumb } from "./Breadcrumb";
import { getBreadcrumb } from "./getBreadcrumb";
import { useHeaderBottomSlot } from "./HeaderBottomSlotContext";
import styles from "./Header.module.css";
import { PrimaryNavLinks } from "./PrimaryNavLinks";
import { useHeaderResponsiveLayout } from "./useHeaderResponsiveLayout";

function Header() {
  // 「下部ヘッダー」(ProfileTabs など) を HeaderBottomPortal 経由で描画するための
  // スロット. Header 自身はここに何が入るか関知しない
  const { setSlot } = useHeaderBottomSlot();

  const {
    ref: homeRef,
    align: homeAlign,
    onMouseEnter: onHomeMouseEnter,
    onFocus: onHomeFocus,
  } = useTooltipAlign<HTMLAnchorElement>("ホーム");

  const pathname = useLocation().pathname;
  const breadcrumb = getBreadcrumb(pathname);
  const {
    breadcrumbRef,
    searchWrapperRef,
    rightRef,
    searchCollapsed,
    navCollapsed,
  } = useHeaderResponsiveLayout(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.left}>
          <MenuButton />
          <Link
            ref={homeRef}
            to="/"
            aria-label="ホーム"
            onMouseEnter={onHomeMouseEnter}
            onFocus={onHomeFocus}
            data-tooltip-align={homeAlign}
            className={styles.homeLink}
          >
            <Emblem name="fth-oasis-icon" height={40} />
          </Link>
          <Breadcrumb ref={breadcrumbRef} segments={breadcrumb} />
        </div>

        <div ref={searchWrapperRef} className={styles.center}>
          {searchCollapsed
            ? <IconButton icon={IconSearch} label="検索" />
            : <IconButton icon={IconSearch} label="検索" text="検索…" stretch />}
        </div>

        <div ref={rightRef} className={styles.right}>
          <CreateButton />
          {!navCollapsed && <PrimaryNavLinks />}
          <IconLink to="/notifications" icon={IconBell} label="全ての通知" />
          <UserMenuButton />
        </div>
      </div>

      <div ref={setSlot} />
    </header>
  );
}

export { Header };
