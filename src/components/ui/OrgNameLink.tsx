import clsx from "clsx";
import type { KeyboardEventHandler, MouseEventHandler } from "react";
import { Link, useNavigate } from "react-router";

import styles from "./OrgNameLink.module.css";

type OrgNameLinkProps = {
  // resolveOrganizationId (features/organization/) で名前から逆引きした
  // organizationId. 逆引きできない場合は undefined を渡し, リンクにせず
  // そのまま名前だけ表示する
  organizationId?: string;
  name: string;
  className?: string;
  onClick?: MouseEventHandler;
  // true のとき, <a> ではなく role="link" の <span> + useNavigate で同等の
  // 挙動を実現する. 行全体が既に <Link> になっている一覧行
  // (NotificationListRow など) で使う — UserNameLink の nested と同じ理由
  nested?: boolean;
};

// 組織名の表示箇所すべてを組織プロフィールページ (/orgs/:orgId) へのリンクに
// するための共通部品. UserNameLink (ユーザー名版) と同じ構造 — 「表示は
// 変化させず, ホバーすると下線が現れるように」という依頼を踏襲し, 色/太さは
// 呼び出し側の className に委ねる
function OrgNameLink({
  organizationId,
  name,
  className,
  onClick,
  nested,
}: OrgNameLinkProps) {
  const navigate = useNavigate();

  // 呼び出し側の className が省略記号 (text-overflow: ellipsis) を適用して
  // いる場合に, ホバーで全体を見せられるよう常に name をそのまま title に
  // 渡す — 「表示は変化させず」の方針どおり, 見た目には影響しない
  if (!organizationId) return <span title={name}>{name}</span>;

  if (nested) {
    const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.(event);
      navigate(`/orgs/${organizationId}`);
    };
    const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      navigate(`/orgs/${organizationId}`);
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
      to={`/orgs/${organizationId}`}
      title={name}
      className={clsx(styles.root, className)}
      onClick={onClick}
    >
      {name}
    </Link>
  );
}

export { OrgNameLink };
