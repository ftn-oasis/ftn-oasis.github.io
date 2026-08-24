import { Button } from "@src/components/ui/Button";
import { Dialog } from "@src/components/ui/Dialog";

import styles from "./RequestConfirmDialog.module.css";

type ConfirmSummaryItem = {
  label: string;
  value: string;
};

type RequestConfirmDialogProps = {
  items: ConfirmSummaryItem[];
  // 「修正する」— このモーダルを閉じて入力画面に戻るだけ (入力内容はそのまま).
  // オーバーレイのクリック/Escape もこちらに割り当てている (より軽い,
  // 破壊的ではない閉じ方のため)
  onEdit: () => void;
  onConfirm: () => void;
};

// 会計申請作成フォーム (支出/予算執行/寄付の3種類共通) の送信ボタン押下時に
// 表示する確認画面. 入力内容の要約 (items, ラベル+値の並び) +送信する (緑)/
// 修正する (背景透過) を縦に並べた, 画面中央に浮くパネルです. 元々は会計申請
// (支出) 専用の TransactionConfirmDialog でしたが, 予算執行/寄付の申請でも
// 同じ構造の確認画面が必要になったため, 要約内容を items props として受け取る
// 汎用コンポーネントに切り出しています. 「キャンセル」ボタンは依頼により削除
// 済み — 破棄したい場合は「修正する」(またはオーバーレイ/Escape) で入力画面に
// 戻ってから, 入力画面側の「入力内容を破棄」ボタンを使う想定です
function RequestConfirmDialog({ items, onEdit, onConfirm }: RequestConfirmDialogProps) {
  return (
    <Dialog onClose={onEdit} labelledBy="request-confirm-heading">
      <h2 id="request-confirm-heading" className={styles.heading}>
        この内容で送信しますか?
      </h2>
      <dl className={styles.summaryList}>
        {items.map((item) => (
          <div className={styles.summaryItem} key={item.label}>
            <dt className={styles.summaryLabel}>{item.label}</dt>
            <dd className={styles.summaryValue} title={item.value}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.actions}>
        <Button color="green" className={styles.actionButton} onClick={onConfirm}>
          送信する
        </Button>
        <Button variant="ghost" className={styles.actionButton} onClick={onEdit}>
          修正する
        </Button>
      </div>
    </Dialog>
  );
}

export { RequestConfirmDialog };
