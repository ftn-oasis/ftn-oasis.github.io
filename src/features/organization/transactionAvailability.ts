import {
  type OrganizationTransaction,
  TransactionRequestType,
  TransactionStatus,
} from "./types";

// 承認待 (ApprovalPending) を過ぎ, まだ完了/却下していない会計処理は「購入可」
// (立替)/「仮払可」(仮払) の状態とみなす — ホーム画面 (~) の「進行中の会計処理」
// (features/home/) で, 通常の状態ラベル (TransactionStatusBadge) の代わりに
// この teal のラベルを表示するために使う. どちらの文言になるかは
// requestType (立替/仮払) で決まる
function getTransactionAvailabilityLabel(
  transaction: OrganizationTransaction,
): string | undefined {
  if (transaction.status === TransactionStatus.ApprovalPending) return undefined;
  if (transaction.status === TransactionStatus.Completed) return undefined;
  if (transaction.status === TransactionStatus.Denied) return undefined;

  return transaction.requestType === TransactionRequestType.AdvancePayment
    ? "仮払可"
    : "購入可";
}

export { getTransactionAvailabilityLabel };
