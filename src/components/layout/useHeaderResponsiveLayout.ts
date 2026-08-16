import { useEffect, useRef, useState } from "react";

// パスの左端から検索ボタンの右端までがこの幅を切ったら, 検索ボタンを正方形に縮める
const SEARCH_COLLAPSE_THRESHOLD_PX = 500;
// パスの左端から UserAvatar (右端の .right グループ) の右端までがこの幅を切ったら,
// 通知・新規作成・検索以外のナビゲーションアイコンを隠して右詰めにする
const NAV_COLLAPSE_THRESHOLD_PX = 640;

// Header の幅に応じた検索ボタン/ナビアイコンの折り畳み判定. パンくずの文言でパスの表示幅が
// 変わるため, pathname が変わるたびに再計測する
function useHeaderResponsiveLayout(pathname: string) {
  const breadcrumbRef = useRef<HTMLSpanElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname 自体は effect 内で参照しないが, パンくずの表示幅 (breadcrumbRef) が変わるタイミングを検知するために再計測のトリガーとして使っている
  useEffect(() => {
    const updateCollapsedState = () => {
      const breadcrumbEl = breadcrumbRef.current;
      const searchEl = searchWrapperRef.current;
      const rightEl = rightRef.current;
      if (!breadcrumbEl || !searchEl || !rightEl) return;

      const breadcrumbLeft = breadcrumbEl.getBoundingClientRect().left;
      setSearchCollapsed(
        searchEl.getBoundingClientRect().right - breadcrumbLeft
          < SEARCH_COLLAPSE_THRESHOLD_PX,
      );
      setNavCollapsed(
        rightEl.getBoundingClientRect().right - breadcrumbLeft
          < NAV_COLLAPSE_THRESHOLD_PX,
      );
    };

    updateCollapsedState();
    window.addEventListener("resize", updateCollapsedState);
    return () => window.removeEventListener("resize", updateCollapsedState);
  }, [pathname]);

  return {
    breadcrumbRef,
    searchWrapperRef,
    rightRef,
    searchCollapsed,
    navCollapsed,
  };
}

export { useHeaderResponsiveLayout };
