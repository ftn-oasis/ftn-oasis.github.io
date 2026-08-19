import { Button } from "@src/components/ui/Button";
import { Dialog } from "@src/components/ui/Dialog";

import styles from "./DiscardConfirmDialog.module.css";

type DiscardConfirmDialogProps = {
  onDiscard: () => void;
  onKeepEditing: () => void;
};

// 会計申請作成フォーム (ExpenseRequestForm/BudgetExecutionRequestForm/
// DonationRequestForm の3種類共通) の「キャンセル」ボタン (入力画面/確認画面
// RequestConfirmDialog のどちらから押されても) 押下時に表示する, 破棄確認の
// モーダルです. 誤操作防止のため, 安全な側の操作 (入力画面に戻る) を右側+青の
// 強調色に, 破壊的な操作 (入力内容を破棄する) を左側+背景透過にしています —
// オーバーレイのクリック/Escape も同じ理由で安全な側 (onKeepEditing) に
// 割り当てています
function DiscardConfirmDialog({ onDiscard, onKeepEditing }: DiscardConfirmDialogProps) {
  return (
    <Dialog onClose={onKeepEditing} labelledBy="transaction-discard-heading">
      <h2 id="transaction-discard-heading" className={styles.heading}>
        本当にキャンセルしますか?
      </h2>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onDiscard}>
          入力内容を破棄する
        </Button>
        <Button color="blue" onClick={onKeepEditing}>
          入力画面に戻る
        </Button>
      </div>
    </Dialog>
  );
}

export { DiscardConfirmDialog };
