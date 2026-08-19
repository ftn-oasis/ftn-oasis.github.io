// ToastContext.tsx (Provider/フック) と ToastList.tsx (見た目) の両方が使う型.
// ToastContext.tsx 側に置くと ToastList.tsx との相互 import になってしまう
// (ToastContext → ToastList はレンダリングのため, ToastList → ToastContext は
// 型のためで, 実行時の値を含む import 同士が循環してしまう) ため, 依存の無い
// このファイルに独立させている

const ToastStatus = {
  Pending: "pending",
  Success: "success",
} as const;

type ToastStatus = (typeof ToastStatus)[keyof typeof ToastStatus];

type ToastItem = {
  id: string;
  message: string;
  status: ToastStatus;
};

export { type ToastItem, ToastStatus };
