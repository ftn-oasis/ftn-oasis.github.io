import { Icon } from "@src/components/ui/Icon";
import tabStyles from "@src/components/ui/tabBase.module.css";
import {
  IconArrowMoveRight,
  IconCertificate,
  IconListSearch,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";

import type { OrganizationTransaction } from "../types";
import { TransactionHeaderBox } from "./TransactionHeaderBox";
import { TransactionItemsList } from "./TransactionItemsList";
import { TransactionProcedureTimeline } from "./TransactionProcedureTimeline";
import { TransactionReceiptBox } from "./TransactionReceiptBox";

import styles from "./EmbeddedTransactionView.module.css";

const EmbeddedTransactionTab = {
  Breakdown: "breakdown",
  Procedure: "procedure",
  Receipt: "receipt",
} as const;

type EmbeddedTransactionTab =
  (typeof EmbeddedTransactionTab)[keyof typeof EmbeddedTransactionTab];

const TABS: { key: EmbeddedTransactionTab; label: string; icon: typeof IconListSearch }[] =
  [
    { key: EmbeddedTransactionTab.Breakdown, label: "金額内訳", icon: IconListSearch },
    {
      key: EmbeddedTransactionTab.Procedure,
      label: "手続状況",
      icon: IconArrowMoveRight,
    },
    { key: EmbeddedTransactionTab.Receipt, label: "証憑", icon: IconCertificate },
  ];

type EmbeddedTransactionViewProps = {
  transaction: OrganizationTransaction;
};

// 会議の資料タブ (MeetingMaterialViewer) から, 会計処理詳細ページ
// (/orgs/:orgId/book/:transactionId) と同じ内容をリンクではなくその場に
// 埋め込んで表示するための版. OrganizationTransactionLayout/
// TransactionDetailTabs (URL の子ルート + NavLink で切り替える) とは異なり,
// ここには対応する URL が無いため, ProfileTabs と同じ考え方 (tabBase の
// 見た目を <button> + useState の内部状態で切り替える) にしている.
// 上部の TransactionHeaderBox と, 3つの本文コンポーネント
// (TransactionItemsList/TransactionProcedureTimeline/TransactionReceiptBox)
// はページ版とそのまま共有している
function EmbeddedTransactionView({ transaction }: EmbeddedTransactionViewProps) {
  const [tab, setTab] = useState<EmbeddedTransactionTab>(
    EmbeddedTransactionTab.Breakdown,
  );

  return (
    <div className={styles.root}>
      <TransactionHeaderBox transaction={transaction} />

      <div className={tabStyles.root} role="tablist" aria-label="会計処理">
        {TABS.map((item) => {
          const isSelected = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={clsx(tabStyles.tab, isSelected && tabStyles.selected)}
              onClick={() => setTab(item.key)}
            >
              <Icon icon={item.icon} size={16} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className={styles.content}>
        {tab === EmbeddedTransactionTab.Breakdown && (
          <TransactionItemsList items={transaction.items} />
        )}
        {tab === EmbeddedTransactionTab.Procedure && (
          <TransactionProcedureTimeline procedure={transaction.procedure} />
        )}
        {tab === EmbeddedTransactionTab.Receipt && (
          <TransactionReceiptBox receipt={transaction.receipt} />
        )}
      </div>
    </div>
  );
}

export { EmbeddedTransactionView };
