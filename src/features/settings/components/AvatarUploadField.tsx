import { Avater } from "@src/components/ui/Avatar";
import { Button } from "@src/components/ui/Button";
import { useUserProfile } from "@src/contexts/UserProfileContext";
import { resizeImageToDataUrl } from "@src/lib/resizeImageToDataUrl";
import { type ChangeEvent, useRef, useState } from "react";

import styles from "./AvatarUploadField.module.css";

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,image/gif,image/webp";

// ~/settings (利用者) のアバター変更 UI. 画像ファイルを選ぶとその場でプレビュー・
// 反映するアップロード欄です (ReceiptUploadField 等のドラッグ&ドロップ欄とは
// 異なり, ここは既に選択済みの1枚を大きく表示 → 変更/既定に戻す, という
// 「現在の値を編集する」構成のため, 新規にこの形で実装しています). バック
// エンドが無いため, 選んだ画像は resizeImageToDataUrl で縮小した上で
// UserProfileContext (localStorage 永続化) にそのまま保持します
function AvatarUploadField() {
  const { avatarDataUrl, setAvatarDataUrl } = useUserProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarDataUrl(dataUrl);
      setError(undefined);
    } catch {
      setError("画像の読み込みに失敗しました. 別の画像でお試しください.");
    }
  };

  return (
    <div className={styles.root}>
      <Avater src={avatarDataUrl ?? undefined} size={100} />
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
          画像を変更
        </Button>
        {avatarDataUrl && (
          <Button type="button" variant="ghost" onClick={() => setAvatarDataUrl(null)}>
            既定に戻す
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export { AvatarUploadField };
