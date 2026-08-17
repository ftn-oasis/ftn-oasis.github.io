import { clsx } from "clsx";
import styles from "./Avater.module.css";

type Props = {
  size?: "small" | "medium" | "large" | "xlarge";
  shape?: "circle" | "square";
};

function Avater({ size = "medium", shape = "circle" }: Props) {
  return (
    <img
      src="/test-user-icon.webp"
      alt="test-user-icon"
      className={clsx(styles.avatar, styles[size], styles[shape])}
    />
  );
}

export { Avater };
