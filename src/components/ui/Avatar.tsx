import { clsx } from "clsx";
import styles from "./Avater.module.css";

type Props = {
  size?: "small" | "medium" | "large";
};

function Avater({ size = "medium" }: Props) {
  return (
    <img
      src="/test-user-icon.webp"
      alt="test-user-icon"
      className={clsx(styles.avatar, styles[size])}
    />
  );
}

export { Avater };
