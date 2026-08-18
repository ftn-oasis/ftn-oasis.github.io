import clsx from "clsx";

import styles from "./Divider.module.css";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
};

function Divider({ orientation = "horizontal" }: DividerProps) {
  return (
    <hr
      className={clsx(
        styles.root,
        orientation === "vertical" && styles.vertical,
      )}
    />
  );
}

export { Divider };
