import { IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";

import { IconButton } from "@src/components/ui/IconButton";

import { NavDrawer } from "./NavDrawer";

function MenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        icon={IconMenu2}
        label="メニューを開く"
        hideTooltip={open}
        onClick={() => setOpen((prev) => !prev)}
      />
      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export { MenuButton };
