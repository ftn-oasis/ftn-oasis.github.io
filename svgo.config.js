export default {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false, // viewBox は絶対に消さない
        },
      },
    },
    "removeDimensions", // width/height を消し viewBox だけ残す
    "prefixIds", // id にファイル名の接頭辞を付けて衝突を防ぐ
  ],
};
