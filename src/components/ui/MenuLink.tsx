import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { NavLink } from "react-router";

import { CurrentContentBar } from "./CurrentContentBar";
import { Icon } from "./Icon";

import styles from "./menuItemBase.module.css";

type MenuLinkProps = {
  to: string;
  label: string;
  icon: TablerIcon;
  onClick?: () => void;
  className?: string;
};

function MenuLink({ to, label, icon, onClick, className }: MenuLinkProps) {
  const content = (
    <>
      <Icon icon={icon} aria-hidden="true" />
      <span>{label}</span>
    </>
  );

  if (/^https?:\/\//.test(to)) {
    return (
      <a
        href={to}
        onClick={onClick}
        className={clsx(styles.root, className)}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        clsx(styles.root, isActive && styles.active, className)
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <CurrentContentBar />}
          {content}
        </>
      )}
    </NavLink>
  );
}

export { MenuLink };
