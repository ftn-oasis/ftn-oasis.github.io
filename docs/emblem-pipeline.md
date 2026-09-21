# アイコン・emblem パイプライン

> 索引: [`README.md`](README.md)

関連はしていますが別々の, 2つの SVG の仕組みがあります.

1. **Emblem (ロゴマーク)**: 原本の `.af` (Affinity) ファイルは `design/emblems/` にあり,
   git LFS で管理されています (`.gitattributes` の `*.af`). これらは手作業で
   `emblems/exported/*.svg` に書き出され, `npm run emblems` を実行すると `svgo`
   (設定は `svgo.config.js`) が `emblems/optimized/` (gitignore 対象, ローカルのみ) に
   出力し, `scripts/build-sprite.mjs` がそれらを1つのスプライトとして `public/emblems.svg`
   にまとめ, あわせて `src/components/ui/emblem-names.ts` に `EmblemName` のユニオン型を
   生成します. `emblems/optimized/` と `public/emblems.svg` は自動生成物なので直接編集
   しないでください. emblem を使う際は `<Emblem name="..." />`
   (`src/components/ui/Emblem.tsx`) を使用し, これは内部で `<use href="/emblems.svg#name">`
   を参照します.
2. **UIアイコン**: `@tabler/icons-react` から取得し, `src/components/ui/Icon.tsx`
   でラップして使用します (`<Icon icon={IconXyz} />`).

ファビコン (`public/favicon.svg`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`,
`apple-touch-icon.png`) は `design/favicon/*.af` の原本から手作業で書き出され, そのまま
コミットされています (`npm run emblems` のパイプラインには含まれません).

## Emblem を手作業で書き出す手順

新しい emblem を追加する, または既存のものを更新する際の手順です (`npm run emblems`
より前, `emblems/exported/*.svg` を用意する段階):

1. `design/emblems/` 内の該当ファイルを Affinity Designer で開きます.

   | ファイル名 | 内容 |
   | --- | --- |
   | `fth-oasis-logo.af` | `FTH OASIS` の文字がデザインされた横長のマーク |
   | `fth-oasis-icon.af` | ヤシの木を模した正方形のマーク |
   | `fth-oasis-icon-original.af` | `fth-oasis-icon` と同じだが, パスが展開されていない (テキスト/図形を直接編集したい場合はこちらを使う) |

2. `emblems/exported/` 以下に SVG として書き出します. 書き出し設定:

   | 設定 | 値 |
   | --- | --- |
   | Set viewbox | ON |
   | Flatten transforms | ON |
   | Rasterise | Nothing |

3. `npm run emblems` を実行すると, 上記の自動生成パイプラインが走ります.

ファビコン (`design/favicon/fth-oasis-icon-rounded.af`/`fth-oasis-icon-sqared.af`)
も同じ Affinity ベースのワークフローですが, こちらは書き出し後 `svgo`/`build-sprite.mjs`
を経由せず, `public/favicon.svg`/`favicon.ico`/`favicon-16.png`/`favicon-32.png`/
`apple-touch-icon.png` として手作業でそのままコミットしてください.
