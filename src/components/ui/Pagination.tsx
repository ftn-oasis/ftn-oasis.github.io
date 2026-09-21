import { Icon } from "@src/components/ui/Icon";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDots,
} from "@tabler/icons-react";
import clsx from "clsx";
import type { CSSProperties } from "react";

import styles from "./Pagination.module.css";

// 現在ページの前後に何ページ分番号を並べるかの目安. ページを移動しても表示される
// 要素数がなるべく変わらないよう, 端に寄っているとき以外は常にこの数を保つ
const WINDOW_SIZE = 5;

type PageItem = number | "ellipsis";

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= WINDOW_SIZE + 2) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  // 奇数の WINDOW_SIZE でも前後にできるだけ均等に割り振る (前半分を切り上げ)
  const halfBefore = Math.ceil((WINDOW_SIZE - 1) / 2);
  const halfAfter = Math.floor((WINDOW_SIZE - 1) / 2);
  let start = current - halfBefore;
  let end = current + halfAfter;

  if (start < 2) {
    end += 2 - start;
    start = 2;
  }
  if (end > total - 1) {
    start -= end - (total - 1);
    end = total - 1;
  }
  start = Math.max(2, start);
  end = Math.min(total - 1, end);

  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

// GitHub のリポジトリ一覧などにあるページネーション. 中央の番号は現在ページの
// 前後 WINDOW_SIZE 件 (+ 先頭/末尾) だけを表示し, ページを送っても表示要素数が
// なるべく変わらないようにしている
function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const items = getPageItems(page, pageCount);
  // 全ページ中で最大の桁数 (常に描画される先頭/末尾ページ番号を含む) に
  // 番号ボタンの幅を揃え, 桁数が変わるページ番号を経由してもボタン幅が
  // ばらつかないようにする (「桁数固定幅」を参照)
  const maxDigits = String(pageCount).length;
  const rootStyle = { "--page-digits": maxDigits } as CSSProperties;

  const isFirstPage = page <= 1;
  const isLastPage = page >= pageCount;

  return (
    <nav className={styles.root} aria-label="ページネーション" style={rootStyle}>
      {/* Vimium/Tridactyl 等の "]]"/"[[" (次ページ/前ページへの移動) は
          rel="next"/rel="prev" を持つ <a> を探すため, <button> ではなく
          こちらも実リンクにしている. 無効時は aria-disabled にしつつ
          onClick 側でも実際のページ変更を止めている (<a> には disabled
          属性が無いため) */}
      {/* biome-ignore lint/a11y/useValidAnchor: キーボード拡張の next/prev 検出用に意図的に <a> にしている */}
      <a
        href="#prev"
        rel="prev"
        aria-disabled={isFirstPage}
        className={clsx(styles.step, isFirstPage && styles.stepDisabled)}
        onClick={(event) => {
          event.preventDefault();
          if (isFirstPage) return;
          onChange(page - 1);
        }}
      >
        <Icon icon={IconChevronLeft} size={16} aria-hidden="true" />
        前へ
      </a>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          // ページ番号 (数値) の key と衝突しないよう接頭辞を付ける. 同じ位置に
          // 複数の省略記号は出ないため, index を含めても安全
          // biome-ignore lint/suspicious/noArrayIndexKey: 上記コメントの通り
          <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
            <Icon icon={IconDots} size={16} />
          </span>
        ) : (
          // Vimium 等のキーボード拡張がリンクとして認識・ジャンプできるよう,
          // <button> ではなく # 付きのハッシュリンクにしている (実際のページ
          // 内遷移はまだ実装していないため, クリック時は preventDefault で
          // ハッシュ自体の変化は打ち消し, onChange だけを呼ぶ)
          <a
            key={item}
            href={`#${item}`}
            className={clsx(styles.page, item === page && styles.current)}
            aria-current={item === page ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onChange(item);
            }}
          >
            {item}
          </a>
        ),
      )}

      {/* biome-ignore lint/a11y/useValidAnchor: キーボード拡張の next/prev 検出用に意図的に <a> にしている */}
      <a
        href="#next"
        rel="next"
        aria-disabled={isLastPage}
        className={clsx(styles.step, isLastPage && styles.stepDisabled)}
        onClick={(event) => {
          event.preventDefault();
          if (isLastPage) return;
          onChange(page + 1);
        }}
      >
        次へ
        <Icon icon={IconChevronRight} size={16} aria-hidden="true" />
      </a>
    </nav>
  );
}

export { Pagination };
