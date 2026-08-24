import clsx from "clsx";
import { useState } from "react";

import { MeetingMinutesDocumentForm } from "./MeetingMinutesDocumentForm";
import { StandardDocumentForm } from "./StandardDocumentForm";

import styles from "./requestFormBase.module.css";

// 「上部に2つのラジオボタンを用意し, それぞれ名称を "通常の文書を作成"
// "議事録を作成" "予算を作成" としてほしい」という依頼のうち, 「予算を作成」
// は入力内容 (フィールド構成) が未指定だったため, ユーザーに確認のうえ
// 今回は実装せず, ラジオボタン自体も表示していません (StandardDocumentForm/
// MeetingMinutesDocumentForm の2つのみ). ~/book/new の NewTransactionSection
// と同じパターンで, どちらのモードを作るかをこのコンポーネントが切り替える
const DocumentCreationMode = {
  Standard: "standard",
  MeetingMinutes: "meeting-minutes",
} as const;

type DocumentCreationMode = (typeof DocumentCreationMode)[keyof typeof DocumentCreationMode];

const DOCUMENT_CREATION_MODE_OPTIONS: {
  value: DocumentCreationMode;
  label: string;
  description: string;
}[] = [
  {
    value: DocumentCreationMode.Standard,
    label: "通常の文書を作成",
    description: "組織/文書名/文書概要/公開範囲を入力する, 通常の文書を作成します.",
  },
  {
    value: DocumentCreationMode.MeetingMinutes,
    label: "議事録を作成",
    description: "今日自身が参加する会議を選び, その議事録を作成します.",
  },
];

// ~/documents/new の本文. 「通常の文書を作成」「議事録を作成」の2種類を
// 最上部のラジオボタンで切り替える構成です (~/book/new の
// NewTransactionSection と同じ modeOptions/requestTypeOption パターン).
// 各モードの実際のフォーム/送信 UX は StandardDocumentForm/
// MeetingMinutesDocumentForm (どちらも同じ useRequestSubmitFlow/
// RequestConfirmDialog/DiscardConfirmDialog を使う) にそれぞれ委ねています
function NewDocumentSection() {
  const [mode, setMode] = useState<DocumentCreationMode>(DocumentCreationMode.Standard);

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>文書を作成</h1>
      <p className={styles.subtitle}>作成する文書の種類を選んでください.</p>

      <div className={styles.field}>
        <div className={styles.modeOptions}>
          {DOCUMENT_CREATION_MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={clsx(
                styles.requestTypeOption,
                mode === option.value && styles.requestTypeOptionSelected,
              )}
            >
              <input
                type="radio"
                name="documentCreationMode"
                value={option.value}
                checked={mode === option.value}
                onChange={() => setMode(option.value)}
                className={styles.radio}
              />
              <span className={styles.requestTypeText}>
                <span className={styles.requestTypeLabel}>{option.label}</span>
                <span className={styles.requestTypeDescription}>{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {mode === DocumentCreationMode.Standard && <StandardDocumentForm />}
      {mode === DocumentCreationMode.MeetingMinutes && <MeetingMinutesDocumentForm />}
    </div>
  );
}

export { NewDocumentSection };
