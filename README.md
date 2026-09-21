# FTH OASIS

**F**uzoku **T**enoji **H**igh school OASIS

React + TypeScript + Vite で構築された SPA です. GitHub のような UI (リポジトリブラウザ,
issue, ユーザープロフィールなど) を参考に, 部活動や委員会などの組織運営 (文書管理・会計処理・
会議・構成員管理) を行うためのポータルを目指しています.

> パスは全てプロジェクトルート (`package.json` のある階層) からの相対パスで表します.

## セットアップ

```shell
npm install
npm run dev
```

その他のコマンド (`build`/`lint`/`preview` など) は `package.json` の `scripts` を参照して
ください.

## ドキュメント

- 実装済みのページ・機能, ディレクトリ構成, 各種設計判断の経緯は [`docs/`](docs/README.md)
  にまとめています.
- Claude Code (AI エージェント) がこのリポジトリで作業する際のルールは [`CLAUDE.md`](CLAUDE.md)
  を参照してください.

## アイコン・ロゴ

Emblem (ロゴマーク) は Affinity Designer (`design/emblems/*.af`, git LFS 管理) で作成し,
`npm run emblems` で SVG スプライトへ変換しています. 新しい emblem の書き出し手順は
[`docs/emblem-pipeline.md`](docs/emblem-pipeline.md) を参照してください.

## ライセンス

[MIT](LICENSE)
