import { Icon } from "@src/components/ui/Icon";
import {
  IconMoneybag,
  IconMoneybagMinus,
  IconMoneybagPlus,
} from "@tabler/icons-react";

import styles from "./TransactionSummaryBox.module.css";

type TransactionSummaryBoxProps = {
  // 収入は正の数の合計, 支出は絶対値の合計 (常に0以上). 残金は収入-支出のため
  // 負の値になり得る (符号付きでそのまま表示する)
  balance: number;
  incomeTotal: number;
  expenseTotal: number;
};

// 入出金一覧の残金/支出合計/収入合計を表示する Box. サイドバー/メインの分割
// (OrganizationBookSection.module.css の .body) より外側に置き2列を跨いで表示する.
// 一覧の絞り込み (フィルター/検索) に関わらず, 全ての入出金を対象にした合計を表示する
function TransactionSummaryBox({
  balance,
  incomeTotal,
  expenseTotal,
}: TransactionSummaryBoxProps) {
  return (
    <div className={styles.root}>
      <span className={styles.balance}>
        <Icon icon={IconMoneybag} size={20} aria-hidden="true" />
        残金: {balance}円
      </span>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon icon={IconMoneybagMinus} size={16} aria-hidden="true" />
          支出合計: {expenseTotal}円
        </span>
        <span className={styles.metaItem}>
          <Icon icon={IconMoneybagPlus} size={16} aria-hidden="true" />
          収入合計: {incomeTotal}円
        </span>
      </div>
    </div>
  );
}

export { TransactionSummaryBox };
