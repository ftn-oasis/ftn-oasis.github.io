import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";

import { Icon } from "./Icon";
import { useTooltipAlign } from "./useTooltipAlign";

import base from "./controlBase.module.css";
import styles from "./IconLink.module.css";

type IconLinkProps = {
  to: string;
  label: string;
  icon: TablerIcon;
  className?: string;
};

function IconLink({ to, label, icon, className }: IconLinkProps) {
  const { ref, align, onMouseEnter, onFocus } = useTooltipAlign<HTMLAnchorElement>(label);

  return (
    <Link
      ref={ref}
      to={to}
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      data-tooltip-align={align}
      className={clsx(base.root, styles.root, className)}
    >
      <Icon icon={icon} aria-hidden="true" />
    </Link>
  );
}

export { IconLink };
