import clsx from "clsx";
import type { KeyboardEventHandler, MouseEventHandler } from "react";
import { Link, useNavigate } from "react-router";

import styles from "./UserNameLink.module.css";

type UserNameLinkProps = {
  // resolveMemberId (features/organization/) 等で名前から逆引きした userId.
  // 逆引きできない場合 (組織名など, そもそも個人を指さない文字列) は undefined
  // を渡し, リンクにせずそのまま名前だけ表示する
  userId?: string;
  name: string;
  className?: string;
  // 呼び出し側がクリックのより外側の要素 (行全体のリンク/ボタンなど) に別の
  // ナビゲーション/選択操作を持たせている場合, event.stopPropagation() で
  // それらへのバブリングを止めるために使う (DocumentVersionTimeline など)
  onClick?: MouseEventHandler;
  // true のとき, <a> ではなく role="link" の <span> + useNavigate で同等の
  // 挙動を実現する. 行全体が既に <Link> になっている一覧行 (IssueListRow/
  // PullRequestListRow) で使う — <a> の中に <a> を入れ子にすると無効な DOM
  // になり, React が実際に開発コンソールへ警告を出す (a cannot be a
  // descendant of a) ため, そちらでは通常の <Link> を使えない
  nested?: boolean;
};

// ユーザー名の表示箇所すべてをプロフィールページ (/users/:userId) へのリンクに
// するための共通部品. 「表示は変化させず, ホバーすると下線が現れるように
// してほしい」という依頼のため, 色/太さなど呼び出し側の見た目 (className) は
// 一切変えず, hover 時の下線だけをここで追加する
function UserNameLink({ userId, name, className, onClick, nested }: UserNameLinkProps) {
  const navigate = useNavigate();

  // 呼び出し側の className が省略記号 (text-overflow: ellipsis) を適用して
  // いる場合に, ホバーで全体を見せられるよう常に name をそのまま title に
  // 渡す — 「表示は変化させず」の方針どおり, 見た目には影響しない
  if (!userId) return <span title={name}>{name}</span>;

  if (nested) {
    const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {
      // stopPropagation だけでは, 親の <a> のクリック時デフォルト動作
      // (href への遷移) を止められない (デフォルト動作の抑制には
      // preventDefault が必要) ため, 両方呼ぶ
      event.preventDefault();
      event.stopPropagation();
      onClick?.(event);
      navigate(`/users/${userId}`);
    };
    const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      navigate(`/users/${userId}`);
    };

    return (
      // biome-ignore lint/a11y/useSemanticElements: 親要素が既に <a> のため, <a> を入れ子にできない (無効な DOM になる)
      <span
        role="link"
        tabIndex={0}
        title={name}
        className={clsx(styles.root, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {name}
      </span>
    );
  }

  return (
    <Link
      to={`/users/${userId}`}
      title={name}
      className={clsx(styles.root, className)}
      onClick={onClick}
    >
      {name}
    </Link>
  );
}

export { UserNameLink };
