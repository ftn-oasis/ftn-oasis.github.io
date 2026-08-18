import { Avater } from "@src/components/ui/Avatar";
import { Icon } from "@src/components/ui/Icon";
import { IconMail, IconUserSquare } from "@tabler/icons-react";
import { Link } from "react-router";

import type { OrganizationMember } from "../types";

import styles from "./MemberListRow.module.css";

type MemberListRowProps = {
  member: OrganizationMember;
};

// 構成員一覧の1行. 行全体が1つのリンク. DocumentListRow と同じ考え方だが,
// 1項目が2行になる — 先頭にアバター, 中央に名前 (太字)/役職, 右詰めで
// メールアドレス/学年学級を2段で表示する. 構成員は組織に紐付く独自のページ
// ではなく実在するユーザープロフィールページ (/users/:userId) へリンクする
// (member.id をそのまま userId として使う — currentUser.id と一致しない
// 構成員は他の未実装リンクと同様「ユーザーが見つかりません」になる)
function MemberListRow({ member }: MemberListRowProps) {
  return (
    <Link to={`/users/${member.id}`} className={styles.root}>
      <Avater size="medium" />
      <div className={styles.info}>
        <span className={styles.title}>{member.name}</span>
        <span className={styles.description}>{member.role}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconMail} size={14} aria-hidden="true" />
          {member.email}
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconUserSquare} size={14} aria-hidden="true" />
          {member.grade}年{member.class}組
        </span>
      </div>
    </Link>
  );
}

export { MemberListRow };
