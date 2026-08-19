import { useToast } from "@src/contexts/ToastContext";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

// 送信 (ダミー) が完了するまでの時間
const SUBMIT_DELAY_MS = 1500;

type UseRequestSubmitFlowOptions = {
  isValid: boolean;
  // トースト文言 (フォームの種類ごとに変える — 「会計申請」/「予算執行申請」/
  // 「寄付申請」など)
  pendingMessage: string;
  successMessage: string;
};

// 会計申請作成フォーム (支出/予算執行/寄付の3種類) すべてで共通の, 送信/確認/
// キャンセル/破棄の状態遷移をまとめたフック. 「送信ボタンが押下されたら確認
// 画面を表示する. 確認画面のキャンセルボタンからは破棄確認を挟む. 破棄され
// たら送信された場合と同じように画面遷移する」という一連の流れが3フォームで
// 共通のため, 重複を避けてここに切り出している (中身のフィールドや確認画面の
// 表示内容は呼び出し側ごとに異なるため, そちらは各フォームコンポーネントの
// 責務のまま残している)
function useRequestSubmitFlow({
  isValid,
  pendingMessage,
  successMessage,
}: UseRequestSubmitFlowOptions) {
  const navigate = useNavigate();
  const { showToast, resolveToast } = useToast();

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;

    // 実際の送信はまだ行わず, 確認画面を表示するだけに留める — 実際の
    // 送信処理は確認後の handleConfirmedSubmit で行う
    setConfirmOpen(true);
  };

  const handleConfirmedSubmit = () => {
    setConfirmOpen(false);

    // 実際の送信処理 (API 呼び出し) はのちほど実装する — ここではダミーの
    // 遅延の後にトーストを成功表示へ切り替えるだけの, UX の再現に留めている
    const toastId = showToast(pendingMessage);
    navigate(-1);
    window.setTimeout(() => {
      resolveToast(toastId, successMessage);
    }, SUBMIT_DELAY_MS);
  };

  // 入力画面/確認画面どちらの「キャンセル」からも, まず破棄確認
  // (DiscardConfirmDialog) を挟む — 確認画面は開いたままにせず閉じておく
  // (「入力画面に戻る」を押した際にそのまま入力画面へ戻れるようにするため)
  const handleRequestCancel = () => {
    setConfirmOpen(false);
    setDiscardConfirmOpen(true);
  };

  // 「入力内容を破棄する」— 送信が完了した場合と同じく, 入力画面の前に
  // 開いていた画面へ遷移する. 何かを待つ非同期処理ではない (即座に完了する)
  // ため, showToast (未完了/スピナー表示) を挟まず resolveToast を即座に
  // 呼んで完了状態のトーストを直接表示している
  const handleDiscard = () => {
    setDiscardConfirmOpen(false);
    const toastId = showToast("キャンセルしました");
    resolveToast(toastId, "キャンセルしました");
    navigate(-1);
  };

  return {
    submitAttempted,
    confirmOpen,
    discardConfirmOpen,
    handleSubmit,
    handleConfirmedSubmit,
    handleRequestCancel,
    handleDiscard,
    closeConfirm: () => setConfirmOpen(false),
    closeDiscardConfirm: () => setDiscardConfirmOpen(false),
  };
}

export { useRequestSubmitFlow };
