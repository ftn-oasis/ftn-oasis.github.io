import { type EmblemName, emblemViewBoxes } from "./emblem-names";
import styles from "./Emblem.module.css";

type Props = {
  name: EmblemName;
  height?: number;
  label?: string;
};

function Emblem({ name, height = 24, label }: Props) {
  const viewBox = emblemViewBoxes[name];
  const [, , vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(Number);

  return (
    <svg
      className={styles.emblem}
      width={(height * vbWidth) / vbHeight}
      height={height}
      role={label ? "img" : "presentation"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <use href={`/emblems.svg#${name}`} />
    </svg>
  );
}

export { Emblem };
