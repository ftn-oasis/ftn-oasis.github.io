import { useToast } from "@src/contexts/ToastContext";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router";

import { useNavigateBackPastCreationPages } from "./useNavigateBackPastCreationPages";

// 送信 (ダミー) が完了するまでの時間
const SUBMIT_DELAY_MS = 1500;

type UseRequestSubmitFlowOptions = {
  isValid: boolean;
  // 入力欄に何かしら入力されているか. true の間, 別ページへの遷移
  // (Link クリック/ブラウザの戻る・進むボタンなど, react-router が検知できる
  // ナビゲーション全て) を検知したらブロックし, 「入力内容を破棄」ボタンと
  // 同じ破棄確認ダイアログを表示する — 「どの作成画面でも入力欄にユーザーが
  // 入力している場合は, 別のページに移動しようとした際に入力内容を破棄して
  // 移動するか確認するダイアログを表示してほしい」という依頼のため
  isDirty: boolean;
  // トースト文言 (フォームの種類ごとに変える — 「会計申請」/「予算執行申請」/
  // 「寄付申請」など)
  pendingMessage: string;
  successMessage: string;
};

// 会計申請作成フォーム (支出/予算執行/寄付の3種類) と文書作成フォーム
// (通常の文書/議事録の2種類) すべてで共通の, 送信/確認/キャンセル/破棄の
// 状態遷移をまとめたフック. 「送信ボタンが押下されたら確認画面を表示する.
// 確認画面のキャンセルボタンからは破棄確認を挟む. 破棄されたら送信された
// 場合と同じように画面遷移する」という一連の流れが5フォームで共通のため,
// 重複を避けてここに切り出している (中身のフィールドや確認画面の表示内容は
// 呼び出し側ごとに異なるため, そちらは各フォームコンポーネントの責務のまま
// 残している). isDirty による離脱ガード (useBlocker) もここに統合しており,
// 「入力内容を破棄」ボタン経由と, ブロックされたナビゲーション経由のどちらも
// 同じ discardConfirmOpen/handleDiscard に合流する — 破棄が選ばれた場合の
// 遷移先は (クリックしたリンクの遷移先ではなく) 常に useNavigateBackPastCreationPages
// が返す「元の画面」である点に注意 (「入力内容が破棄された場合は元の画面に
// 戻ってください」という依頼のため)
function useRequestSubmitFlow({
  isValid,
  isDirty,
  pendingMessage,
  successMessage,
}: UseRequestSubmitFlowOptions) {
  const { showToast, resolveToast } = useToast();
  const navigateBackPastCreationPages = useNavigateBackPastCreationPages();

  const [submitAttempted, setSubmitAttempted] = useState(false);
  // 「入力内容を破棄」ボタン (handleRequestCancel) から明示的に開いた分だけを
  // 持つ内部 state. 実際に外へ公開する confirmOpen/discardConfirmOpen は,
  // これとブロッカーの状態 (下記) を合成した派生値にしている — ブロックの
  // 検知そのものは react-router 側の状態遷移であり, それを毎レンダー
  // useEffect で state に同期する (react-hooks/set-state-in-effect
  // が指摘するカスケード再レンダーの原因になる) 必要が無いようにするため
  const [confirmOpenState, setConfirmOpenState] = useState(false);
  const [discardConfirmOpenState, setDiscardConfirmOpenState] = useState(false);

  // 送信/破棄が確定し, これから自分自身で離脱ナビゲーションを行う間だけ
  // ブロッカーを無効化する — でなければ, その離脱ナビゲーション自体も
  // 「別ページへの遷移」としてまたブロックされてしまう
  const leavingRef = useRef(false);

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && !leavingRef.current && currentLocation.pathname !== nextLocation.pathname,
      [isDirty],
    ),
  );
  const navigationBlocked = blocker.state === "blocked";

  // ナビゲーションがブロックされた瞬間は, 「入力内容を破棄」ボタンを押した
  // ときと同じ破棄確認ダイアログを表示する (確認画面は開いたままにしない)
  const confirmOpen = confirmOpenState && !navigationBlocked;
  const discardConfirmOpen = discardConfirmOpenState || navigationBlocked;

  // タブを閉じる/リロードする/直接別 URL を入力する, といった SPA の外側の
  // 離脱は useBlocker では検知できないため, ブラウザ標準の確認ダイアログ
  // (beforeunload) で別途カバーする — こちらは文言をカスタマイズできない
  // ブラウザ既定のプロンプトになる
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;

    // 実際の送信はまだ行わず, 確認画面を表示するだけに留める — 実際の
    // 送信処理は確認後の handleConfirmedSubmit で行う
    setConfirmOpenState(true);
  };

  const handleConfirmedSubmit = () => {
    setConfirmOpenState(false);
    leavingRef.current = true;

    // 実際の送信処理 (API 呼び出し) はのちほど実装する — ここではダミーの
    // 遅延の後にトーストを成功表示へ切り替えるだけの, UX の再現に留めている
    const toastId = showToast(pendingMessage);
    navigateBackPastCreationPages();
    window.setTimeout(() => {
      resolveToast(toastId, successMessage);
    }, SUBMIT_DELAY_MS);
  };

  // 入力画面/確認画面どちらの「キャンセル」からも, まず破棄確認
  // (DiscardConfirmDialog) を挟む — 確認画面は開いたままにせず閉じておく
  // (「入力画面に戻る」を押した際にそのまま入力画面へ戻れるようにするため)
  const handleRequestCancel = () => {
    setConfirmOpenState(false);
    setDiscardConfirmOpenState(true);
  };

  // 「入力内容を破棄する」— 送信が完了した場合と同じく, 元の画面 (作成画面が
  // 連続していればその前まで遡った画面) へ遷移する. ブロックされたナビゲー
  // ション経由で開いた場合は, まずそのナビゲーションを reset() で取り消して
  // から (クリックした先へは進めない — 常に「元の画面」が優先されるため)
  // 改めて自前で遷移する. 何かを待つ非同期処理ではない (即座に完了する) ため,
  // showToast (未完了/スピナー表示) を挟まず resolveToast を即座に呼んで
  // 完了状態のトーストを直接表示している
  const handleDiscard = () => {
    setDiscardConfirmOpenState(false);
    leavingRef.current = true;
    if (navigationBlocked) {
      blocker.reset();
    }

    const toastId = showToast("キャンセルしました");
    resolveToast(toastId, "キャンセルしました");
    navigateBackPastCreationPages();
  };

  // 「入力画面に戻る」— ブロックされたナビゲーション経由で開いていた場合は
  // そのナビゲーションを取り消し, 現在のページに留まる
  const closeDiscardConfirm = () => {
    setDiscardConfirmOpenState(false);
    if (navigationBlocked) {
      blocker.reset();
    }
  };

  return {
    submitAttempted,
    confirmOpen,
    discardConfirmOpen,
    handleSubmit,
    handleConfirmedSubmit,
    handleRequestCancel,
    handleDiscard,
    closeConfirm: () => setConfirmOpenState(false),
    closeDiscardConfirm,
  };
}

export { useRequestSubmitFlow };
