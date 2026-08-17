import { clsx } from "clsx";
import styles from "./Avater.module.css";

type Props = {
  // よく使う大きさは preset (small/medium/large) を使い, 一度しか使わない
  // ような大きさはピクセル数を直接指定する
  size?: "small" | "medium" | "large" | number;
  shape?: "circle" | "square";
};

function Avater({ size = "medium", shape = "circle" }: Props) {
  const presetClass = typeof size === "string" ? styles[size] : undefined;

  return (
    <img
      src="/test-user-icon.webp"
      alt="test-user-icon"
      className={clsx(styles.avatar, presetClass, styles[shape])}
      style={typeof size === "number" ? { width: size } : undefined}
    />
  );
}

export { Avater };
