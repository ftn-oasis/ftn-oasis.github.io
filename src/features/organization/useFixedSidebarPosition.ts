import { type RefObject, useEffect, useState } from "react";

type FixedSidebarPosition = {
  top: number;
  left: number;
  width: number;
};

// 「サイドバーのボタンはサイドバー上部に配置された要素か window 上端の
// どちらか近い方から24pxの位置に配置してほしい」という依頼による間隔.
// 各ページの .root (または .body) は, サイドバーの直前に何が来るか
// (グローバルヘッダーだけの場合と, 会計タブのように TransactionSummaryBox +
// Divider が追加で挟まる場合の両方) に関わらず, 常に padding-top: 24px を
// 持つよう統一されている — つまりサイドバーの「fixed 化する前の, 通常の
// フロー上での自然な位置 (= 直前の要素の下端 + 24px)」は, どのページでも
// 常にこの値と一致する. スクロールするとこの自然な位置は画面上端に近づいて
// いく (viewport 相対の座標が小さくなる) ため, それが 24px を下回った
// 時点で 24px に固定すれば, 「直前の要素かwindow上端のどちらか近い方から
// 24px」がそのまま実現できる
const SIDEBAR_TOP_GAP = 24;

// 文書/会計/構成員/会議それぞれのサイドバー (*FilterSidebar) が使う,
// position: fixed でサイドバーを画面に固定表示するための位置計算.
//
// 当初は position: sticky (+ align-self: start) で実装していましたが,
// 「サイドバーの上部が, スクロールして一覧の末尾に近づくと画面外へ
// フェードアウトしてしまう (会議一覧のミニカレンダーの下端の位置も一緒に
// ずれてしまう)」という不具合がありました — position: sticky は
// 自身の containing block (グリッドのセル, ここではメイン側の内容量で
// 決まる) の下端を超えて留まり続けることができないため, 一覧が短い/
// ページの残りスクロール量に対してサイドバー自身の高さが大きい場合に,
// 末尾付近でサイドバーが押し出されて上端が見えなくなる, という
// sticky 特有の弱点が原因でした. position: fixed はスクロール量や
// 祖先要素の高さに一切影響されないため, この不具合が構造的に起こり
// 得ません.
//
// ただし fixed にすると要素は通常のレイアウト (このグリッドのセル幅) から
// 外れてしまうため, 呼び出し側は「幅だけを保持するプレースホルダー」
// (placeholderRef, 実際には何も描画しない空の <div> で構いません) を
// 元のグリッドセルの位置に残し, このフックがその位置を実測して
// 返した top/left/width を, 実際に見た目を持つ fixed 要素側の
// inline style として適用してください.
function useFixedSidebarPosition(
  placeholderRef: RefObject<HTMLElement | null>,
): FixedSidebarPosition | undefined {
  const [position, setPosition] = useState<FixedSidebarPosition>();

  useEffect(() => {
    function updatePosition() {
      const placeholder = placeholderRef.current;
      if (!placeholder) return;
      // プレースホルダーは (実際の中身とは違い) fixed 化せず通常のフローに
      // 置いたままなので, その getBoundingClientRect().top が「もし fixed で
      // なかったら今どこにあるか」= 直前の要素の下端 + 24px をそのまま表す.
      // これを 24px 未満に縮めないようにするだけで, 「直前の要素か window
      // 上端のどちらか近い方から24px」が実現できる (ページごとに直前の
      // 要素が違っても, 各ページの padding-top が 24px に揃っているため
      // 個別の要素を探して測る必要が無い)
      const rect = placeholder.getBoundingClientRect();
      setPosition({
        top: Math.max(rect.top, SIDEBAR_TOP_GAP),
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }

    let pendingFrame: number | null = null;
    function scheduleUpdate() {
      if (pendingFrame !== null) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null;
        updatePosition();
      });
    }

    updatePosition();
    // マウント直後の1回だけだと, 初回ペイント時点でまだ window の実際の
    // ビューポートが確定しきっておらず, わずかにずれた位置で測ってしまう
    // ことがあった (MeetingFilterSidebar の高さ計測で確認済みの不具合と同種) —
    // 次のフレームでもう一度測り直すことで補正する
    const initialFrame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", scheduleUpdate);
    // プレースホルダーの自然な位置 (rect.top) は scroll するたびに (24px に
    // クランプされるところまで) 変わるため, top を追従させるには scroll
    // イベントでも再計算が必要 — 1回のスクロール操作で連続して大量に発火
    // するため, requestAnimationFrame で1フレームにつき最大1回の再計算に
    // なるよう間引いている (scheduleUpdate)
    window.addEventListener("scroll", scheduleUpdate);
    return () => {
      cancelAnimationFrame(initialFrame);
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, [placeholderRef]);

  return position;
}

export { useFixedSidebarPosition };
