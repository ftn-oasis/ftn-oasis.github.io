// 設定ページのアバターアップロード (AvatarUploadField) 用. バックエンドが
// 無いため, 選んだ画像は localStorage にそのまま持たせる (UserProfileContext
// を参照) 必要があり, 元画像をそのまま data URL 化すると数MB単位になり得て
// localStorage の容量を圧迫しかねないため, canvas で一定の大きさに縮小してから
// data URL に変換する. 特定のドメイン (アバター) にもコンポーネントにも
// 依存しない汎用処理のため src/lib/ に置いている
const MAX_AVATAR_DIMENSION = 256;

function resizeImageToDataUrl(file: File, maxDimension = MAX_AVATAR_DIMENSION): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("ファイルの読み込みに失敗しました"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      image.onload = () => {
        // 縦横どちらかが maxDimension を超える場合だけ縮小する (小さい画像を
        // 無理に拡大はしない — scale の上限を 1 にクランプしている)
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("画像の変換に失敗しました"));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export { resizeImageToDataUrl };
