import type { TablerIcon } from "@tabler/icons-react";
import type { ComponentPropsWithoutRef } from "react";

type IconProps = {
  icon: TablerIcon;
  size?: number;
} & Omit<ComponentPropsWithoutRef<"svg">, "width" | "height">;

function Icon({ icon: IconComponent, size = 22, ...rest }: IconProps) {
  return <IconComponent stroke={2} size={size} {...rest} />;
}

export { Icon };
