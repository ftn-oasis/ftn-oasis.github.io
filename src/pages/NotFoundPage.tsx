import styles from "./NotFoundPage.module.css";

// どのルートにもマッチしなかった場合の catch-all (App.tsx の path="*")
function NotFoundPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>
        残念ですが, ページが存在しないか, 消されてしまったようです
      </p>
    </div>
  );
}

export { NotFoundPage };
