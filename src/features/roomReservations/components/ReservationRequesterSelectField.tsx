import { Icon } from "@src/components/ui/Icon";
import menuItemBase from "@src/components/ui/menuItemBase.module.css";
import selectFieldBaseStyles from "@src/components/ui/selectFieldBase.module.css";
import { useDismissablePopover } from "@src/components/ui/useDismissablePopover";
import { IconCaretDownFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { type KeyboardEvent, useState } from "react";

import styles from "./ReservationRequesterSelectField.module.css";

type ReservationRequesterOption = {
  id: string;
  label: string;
};

type ReservationRequesterSelectFieldProps = {
  id?: string;
  options: ReservationRequesterOption[];
  value: string;
  onChange: (id: string) => void;
};

// 新館予約申請フォーム (~/room-reservations/new) の「部屋を予約する個人･組織」—
// 「入力式のドロップダウンで選択してほしい」という依頼のため, 既存の
// selectFieldBase 系ドロップダウン (トリガーが押すだけの <button>) とは異なり,
// トリガー自体が <input type="text"> で, 入力した文字列で選択肢を絞り込める
// 構成にしています (社内初のパターンのため新規実装 — MemberSelectField 等の
// 既存ドロップダウンはいずれも絞り込み無しの単純な一覧です). 「一覧に一致
// しない文字列は自由入力として確定できない」という仕様のため, blur/Escape で
// 閉じたときは必ず選択済みの値のラベルへ表示を戻します
function ReservationRequesterSelectField({
  id,
  options,
  value,
  onChange,
}: ReservationRequesterSelectFieldProps) {
  const { open, wrapperRef, toggle, close } = useDismissablePopover<HTMLDivElement>();
  const selectedOption = options.find((option) => option.id === value);
  const [query, setQuery] = useState(selectedOption?.label ?? "");

  const trimmedQuery = query.trim();
  const filteredOptions =
    trimmedQuery === "" ? options : options.filter((option) => option.label.includes(trimmedQuery));

  const handleFocus = () => {
    // フォーカスした時点で一覧全体を見せるため, 入力欄はいったん空にする —
    // 「選択済みのラベルが入力の邪魔にならないようにしてほしい」という,
    // 一般的な入力式コンボボックスの挙動に合わせている
    setQuery("");
    if (!open) toggle();
  };

  const handleSelect = (option: ReservationRequesterOption) => {
    onChange(option.id);
    setQuery(option.label);
    close();
  };

  const handleBlur = () => {
    // 「一覧からの選択のみ可能」— blur (option のクリック以外の理由で
    // フォーカスが外れた場合) は, 未確定の入力文字列を選択済みのラベルへ
    // 戻す. option のクリックは各 <button> の onMouseDown 側で
    // preventDefault() しており, そもそもこの blur を発生させない
    // (先に onMouseDown → handleSelect が確定させてから, クリック本来の
    // フォーカス移動が起きないようにしている)
    setQuery(selectedOption?.label ?? "");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery(selectedOption?.label ?? "");
      close();
      return;
    }
    // <form> 内の <input> での Enter は既定でフォームを送信してしまうため,
    // 絞り込み中の誤送信を防ぐ (一覧からの選択には使っていない — 選択自体は
    // 各候補のクリックで行う)
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <div ref={wrapperRef} className={selectFieldBaseStyles.wrapper}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) toggle();
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={styles.triggerInput}
      />
      <Icon
        icon={IconCaretDownFilled}
        size={13}
        aria-hidden="true"
        className={styles.triggerIcon}
      />

      {open && (
        <div className={selectFieldBaseStyles.menu}>
          {filteredOptions.length === 0 && (
            <p className={styles.emptyHint}>該当する候補がありません.</p>
          )}
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(event) => {
                // input の blur (=このクリックによる未確定文字列の巻き戻し)
                // より先にこちらの選択を確定させるため, click ではなく
                // mousedown の時点で preventDefault してフォーカス移動
                // 自体を止める
                event.preventDefault();
                handleSelect(option);
              }}
              className={clsx(menuItemBase.root, option.id === value && menuItemBase.active)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ReservationRequesterSelectField };
