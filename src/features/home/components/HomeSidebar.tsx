import { Divider } from "@src/components/ui/Divider";

import { MY_EDITED_DOCUMENTS, MY_IN_PROGRESS_TRANSACTIONS } from "../mockData";
import { HomeEditedDocumentItem } from "./HomeEditedDocumentItem";
import { HomeInProgressTransactionItem } from "./HomeInProgressTransactionItem";

import styles from "./HomeSidebar.module.css";

// ホーム画面 (~) 左サイドバー. 自身が起案した進行中の会計処理, 分割線を挟んで
// 自身が編集に関わった文書, の順に並べる
function HomeSidebar() {
  return (
    <aside className={styles.root}>
      {MY_IN_PROGRESS_TRANSACTIONS.length > 0 && (
        <>
          <h2 className={styles.heading}>進行中の会計処理</h2>
          <ul className={styles.list}>
            {MY_IN_PROGRESS_TRANSACTIONS.map((transaction) => (
              <li key={transaction.id}>
                <HomeInProgressTransactionItem transaction={transaction} />
              </li>
            ))}
          </ul>
          <Divider />
        </>
      )}

      <h2 className={styles.heading}>編集した文書</h2>
      {MY_EDITED_DOCUMENTS.length > 0 ? (
        <ul className={styles.list}>
          {MY_EDITED_DOCUMENTS.map((document) => (
            <li key={document.id}>
              <HomeEditedDocumentItem document={document} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>編集に関わった文書はまだありません.</p>
      )}
    </aside>
  );
}

export { HomeSidebar };
