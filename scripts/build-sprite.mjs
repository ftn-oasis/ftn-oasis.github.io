// ---
// SVGスプライト生成スクリプト
//
// emblems/optimized/ にある個別のSVGファイルを1つの public/emblems.svg にまとめ,
// 各アイコンを <symbol id="ファイル名"> として登録する.
// あわせて, アイコン名のユニオン型 (EmblemName) も自動生成する.
//
// 使う側: <svg><use href="/emblems.svg#documentation" /></svg> ("documentation" には symbol の id を入力)
// 実行:   npm run emblems  (svgo で最適化した直後に呼ばれる想定)
//
// 前提: 入力SVGは黒 (#000000又は#000) で塗り潰されていることと, svgo で正規化済み (viewBox あり / id は prefixIds 済み)
// ---

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = "emblems/optimized"; // 入力: svgo が出力した個別SVG
const OUT_FILE = "public/emblems.svg"; // 出力: スプライト本体 (ハッシュが付かないpublicに置く)
const TYPE_FILE = "src/components/ui/emblem-names.ts"; // 出力: アイコン名の型定義

// symbol の id を整列し, 順序を固定して差分を安定させる
const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".svg")).sort();

if (files.length === 0) {
  throw new Error(`${SRC_DIR} にSVGがありません`);
}

const symbols = [];
const entries = []; // [id, viewBox] を集め, 縦横比を保存

for (const file of files) {
  const id = path.basename(file, ".svg"); // "documentation.svg" を "documentation" に変換
  const raw = await readFile(path.join(SRC_DIR, file), "utf8");

  // viewBox は <symbol> の拡大縮小に必須. 無いとアイコンが表示されない
  const viewBox = raw.match(/viewBox\s*=\s*"([^"]+)"/i)?.[1];
  if (!viewBox) {
    throw new Error(
      `${file} に viewBox がありません. viewBox を付加して再度ファイルを書き出し直してください. `,
    );
  }

  // 外側の <svg> タグを剥がし, 中身 (path など)だけを取り出す
  const inner = raw
    .replace(/<\?xml[\s\S]*?\?>/g, "") // XML宣言を削除
    .replace(/<!DOCTYPE[\s\S]*?>/g, "") // DOCTYPE を削除
    .replace(/<!--[\s\S]*?-->/g, "") // コメントを削除
    .replace(/[\s\S]*?<svg[^>]*>/, "") // 開始タグまでを削除
    .replace(/<\/svg>[\s\S]*$/, "") // 終了タグ以降を削除
    // 純黒だけを剥がして, CSSの color を継承できるようにする.
    // fill を無条件に全削除すると fill="none" (ドーナツ型の穴)まで消えるため対象を限定する
    .replace(/\s*fill="#000000"/gi, "")
    .replace(/\s*fill="#000"/gi, "")
    .trim();

  entries.push([id, viewBox]);

  // fill="currentColor" を symbol 側に置くことで, 子要素へ継承させる
  symbols.push(
    `  <symbol id="${id}" viewBox="${viewBox}" fill="currentColor">\n    ${inner}\n  </symbol>`,
  );
}

// <symbol> は単体では描画されないので, このファイルを直接開いても何も表示されない (正常)
const sprite = `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`;

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, sprite, "utf8");

// アイコン名を型にしておくと, 存在しない名前を書いた時点でTypeScriptが検出できる
const types = `// このファイルは自動生成されます. 直接編集しないでください. \n`
  + `const emblemViewBoxes = {\n`
  + entries.map(([id, vb]) => `  '${id}': '${vb}',`).join("\n")
  + `\n} as const;\n\n`
  + `type EmblemName = keyof typeof emblemViewBoxes;\n\n`
  + `export { type EmblemName, emblemViewBoxes };\n`;

await mkdir(path.dirname(TYPE_FILE), { recursive: true });
await writeFile(TYPE_FILE, types, "utf8");

console.log(`✓ ${files.length} 個のアイコンを ${OUT_FILE} に出力しました`);
