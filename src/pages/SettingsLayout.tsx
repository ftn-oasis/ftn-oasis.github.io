import { Divider } from "@src/components/ui/Divider";
import { SettingsSidebar } from "@src/features/settings/components/SettingsSidebar";
import { Outlet } from "react-router";

import styles from "./SettingsLayout.module.css";

// ~/settings の親ルート. OrganizationDocumentsSection と同じ
// サイドバー/縦の Divider/本文の 1fr auto 3fr グリッドで, 「組織が見つかりません」
// のような存在チェックは不要な (動的な :id を持たない) ページのため,
// OrganizationLayout ほどの役割は無く, サイドバー+Outlet の表示だけを担います
function SettingsLayout() {
  return (
    <div className={styles.root}>
      <SettingsSidebar />
      <Divider orientation="vertical" />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export { SettingsLayout };
