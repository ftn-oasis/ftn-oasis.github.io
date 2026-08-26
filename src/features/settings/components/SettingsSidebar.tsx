import { MenuLink } from "@src/components/ui/MenuLink";
import { IconHome } from "@tabler/icons-react";

import styles from "./SettingsSidebar.module.css";

// ~/settings のサイドバー. 現状は「利用者」の1項目のみですが, 今後設定の
// セクションが増えることを見込んで NavDrawer と同じ MenuLink ベースのナビ
// (URL に応じて選択中の項目がハイライトされる) にしています. MenuLink は
// 内部で常に end 付きの NavLink を使うため, サブパスが増えても他のセクションで
// 「利用者」がアクティブに見えてしまうことはありません
function SettingsSidebar() {
  return (
    <nav className={styles.root} aria-label="設定">
      <MenuLink to="/settings" icon={IconHome} label="利用者" />
    </nav>
  );
}

export { SettingsSidebar };
