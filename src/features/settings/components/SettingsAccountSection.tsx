import requestFormStyles from "@src/features/organization/components/requestFormBase.module.css";

import { AvatarUploadField } from "./AvatarUploadField";
import { GradeToggle } from "./GradeToggle";

// ~/settings (index route, サイドバーの「利用者」に対応する本文) — アバターと
// 学年を変更できる UI です. 送信/確認ボタンを持つ「作成」フォームとは違い,
// 選ぶと即座に反映・保存される設定画面のため, requestFormBase.module.css は
// フィールドの見た目 (.field/.label) だけを他のフォームと揃える目的で再利用し,
// .root/.formActions 等の送信フォーム向けの部分は使っていません
function SettingsAccountSection() {
  return (
    <div>
      <h1 className={requestFormStyles.heading}>利用者</h1>
      <p className={requestFormStyles.subtitle}>アバターや学年などの情報を変更できます.</p>

      <div className={requestFormStyles.field}>
        <span className={requestFormStyles.label}>アバター</span>
        <AvatarUploadField />
      </div>

      <div className={requestFormStyles.field}>
        <span className={requestFormStyles.label}>学年</span>
        <GradeToggle />
      </div>
    </div>
  );
}

export { SettingsAccountSection };
