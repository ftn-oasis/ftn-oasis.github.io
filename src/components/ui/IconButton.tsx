import { IconCaretDownFilled, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

import { Icon } from "./Icon";
import { useTooltipAlign } from "./useTooltipAlign";

import base from "./controlBase.module.css";
import styles from "./IconButton.module.css";

type IconButtonProps = {
  icon: TablerIcon;
  label: string;
  text?: string;
  stretch?: boolean;
  showBadge?: boolean;
  dropdown?: boolean;
  hideTooltip?: boolean;
  onClick?: () => void;
  className?: string;
};

function IconButton({
  icon,
  label,
  text,
  stretch = false,
  showBadge = false,
  dropdown = false,
  hideTooltip = false,
  onClick,
  className,
}: IconButtonProps) {
  const { ref, align, onMouseEnter, onFocus } = useTooltipAlign<HTMLButtonElement>(label);
  // 可視のラベル文言 (text) がある場合, aria-label はそこから導出されるアクセシブルネームと
  // 二重になるため付けず, ツールチップ (::after) も表示しない
  const hasVisibleText = Boolean(text);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={hasVisibleText ? undefined : label}
      onClick={onClick}
      onMouseEnter={hasVisibleText ? undefined : onMouseEnter}
      onFocus={hasVisibleText ? undefined : onFocus}
      data-tooltip-align={align}
      data-tooltip-hidden={hideTooltip || undefined}
      className={clsx(
        base.root,
        styles.root,
        dropdown && styles.dropdown,
        stretch && styles.stretch,
        className,
      )}
    >
      <Icon icon={icon} aria-hidden="true" />
      {text && <span>{text}</span>}
      {dropdown && <Icon icon={IconCaretDownFilled} size={13} aria-hidden="true" />}
      {showBadge && <span className={styles.badge} />}
    </button>
  );
}

export { IconButton };
