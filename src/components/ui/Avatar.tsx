import { clsx } from "clsx";
import styles from "./Avater.module.css";

type Props = {
  // よく使う大きさは preset (small/medium/large) を使い, 一度しか使わない
  // ような大きさはピクセル数を直接指定する
  size?: "small" | "medium" | "large" | number;
  shape?: "circle" | "square";
  // 既定は固定のテストアイコン (/test-user-icon.webp) — このコンポーネント自体は
  // 「誰の」アバターかを区別しない (currentUser かどうかの判定を持たない) ため,
  // ここでは単に「渡されればそれを使う」だけに留めている. 実際に自分自身の
  // アバターだと確定している呼び出し元 (UserMenuButton/ProfileSidebar/
  // 設定ページなど) だけが useUserProfile() の avatarDataUrl をここへ渡す —
  // それ以外の (他の構成員/文書編集者などを表示する) 呼び出し元でこれを
  // 渡すと, 実際には他人のはずのアバターが自分の画像に置き換わってしまうため
  // 渡さないこと
  src?: string;
};

function Avater({ size = "medium", shape = "circle", src }: Props) {
  const presetClass = typeof size === "string" ? styles[size] : undefined;

  return (
    <img
      src={src ?? "/test-user-icon.webp"}
      alt="test-user-icon"
      className={clsx(styles.avatar, presetClass, styles[shape])}
      style={typeof size === "number" ? { width: size } : undefined}
    />
  );
}

export { Avater };
