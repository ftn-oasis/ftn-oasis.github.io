import styles from "./CurrentContentBar.module.css";

// 現在選択中/表示中の項目を示す, 左脇の太い青線. box-shadow などで親要素に重ねると
// 親の border-radius に沿って角が丸まってしまうため, 独立した要素として重ねている.
// 親要素に position: relative を指定した上で配置してください.
function CurrentContentBar() {
  return <span className={styles.root} aria-hidden="true" />;
}

export { CurrentContentBar };
