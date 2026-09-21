# ユーザープロフィールページ (`/users/:userId`)

> 索引: [`../README.md`](../README.md)

## タブ (`ProfileTabs`)

`src/features/user/components/ProfileTabs.tsx` (`features/user/components/` に配置
— `features/navigation/` のようにフラットではなく `components/` を1段挟みます. 詳細は
[`../architecture.md`](../architecture.md) のディレクトリ構成を参照) は GitHub の
User Profile ページを参考にしたタブバーです.
`src/pages/UserProfilePage.tsx` (`/users/:userId`) がページの唯一の中身として,
`HeaderBottomPortal` (詳細は [`../header.md`](../header.md)) 経由でグローバルヘッダー
(`Header.tsx`) 内部のスロットへ描画しています — アバターやユーザー名などのプロフィール情報は
表示しません. 見た目自体は `tabBase.module.css` (詳細は [`../ui-common-patterns.md`](../ui-common-patterns.md))
を使っており, `ProfileTabs` 自身の CSS Module はありません.

- `documentCount` prop (件数) が 0 または未指定の場合, 「文書」タブ自体を描画しません —
  「概要」タブは常に表示されます. 件数はまだ実データが無いため, 呼び出し側でダミーの数値を
  渡す想定です. **「栞」タブは依頼により削除しました** — 以前は `bookmarkCount` prop
  で同様に出し分けていましたが, `ProfileTabsProps`/`tabs` 配列/呼び出し元
  (`UserProfilePage.tsx` の `DUMMY_BOOKMARK_COUNT`) ごと削除しています.
- 各タブはラベルの左に `Icon` (`size={16}`, `aria-hidden="true"`) を表示します — 概要
  `IconHome`/文書 `IconFileText` (組織側の同名タブと共通), 会計 `IconReceiptYen`/会議
  `IconCalendarTime`/構成員 `IconUsers`/設定 `IconSettings` (いずれも `OrganizationTabs`).
  `tabBase.module.css` の `.tab` は元々 `gap: 6px` を持っていた (アイコン追加を見越した値)
  ため, 追加の CSS 変更は不要でした.
- `role="tablist"`/`role="tab"`/`aria-selected` を持たせた素朴な ARIA Tabs パターンです
  (コンテナは `<nav>` ではなく `<div role="tablist">` — `<nav>` は landmark role のため
  `tablist` role と併用できません). `OrganizationTabs` と違い実際のルーティングは伴わない,
  内部 `useState` だけの状態切り替えのため, `<button role="tab">` を使っています.
- 選択状態自体は内部の `useState` で完結していますが (既定は先頭の `"overview"`), `onChange`
  prop で選択キーを呼び出し元に通知します. `UserProfilePage` はこれを自分の `useState` に
  ミラーし, `selectedTab === "overview"` のときだけ `OverviewSection` を描画する, という形で
  本文の切り替えに使っています — 「文書」タブは対応する本文コンポーネントがまだ無いため,
  選択しても何も表示されません. 今後実装する際は同じパターン (`selectedTab` の分岐を増やす)
  で接続してください.

`src/pages/UserProfilePage.tsx` (`/users/:userId`) は `useParams()` で取った `userId` が
`currentUser.id` と一致しない場合は「ユーザーが見つかりません」を表示します — 他ユーザーの
実データが無いための暫定挙動です. プロフィールページを `/` 直下ではなく `/users` 配下に
切り出しているため, `/issues` のような (まだページの無い) 他機能の予約パスとの衝突は
起きません.

## 概要タブ (`OverviewSection`)

`src/features/user/components/OverviewSection.tsx` は「概要」タブの本文です.
データ層は `features/user/` 直下に `types.ts` (`Organization`/
`DocumentSummary`/`DocumentVisibility`)・`mockData.ts` (`MOCK_ORGANIZATIONS`/
`MOCK_DOCUMENTS`, 実データ取得 API が無いためのダミーデータ. 他のページでも使い回せるよう
`components/` の外, feature 直下に置いています) として置き, 表示側は `features/user/components/`
配下に分割しています (`ProfileSidebar`/`OrganizationListItem`/`PinnedDocuments`/
`DocumentCard`).

- `DocumentVisibility` (公開/非公開) は, `tsconfig.app.json` の `erasableSyntaxOnly` により
  実際の TypeScript `enum` 構文が使えないため, `const オブジェクト + typeof ...
  [keyof typeof ...]` で導出した union 型で enum 相当のものを表現しています —
  `DocumentVisibility.Public` のように値としても, 型としても同じ名前で使えます.
  真偽値ではなくこの形にしているのは, 将来公開範囲が増えても (例: 組織内限定など) 型を壊さず
  選択肢を追加できるようにするためです.
- `OverviewSection.module.css` の `.root` が `max-width: 1280px; padding: 24px 16px;`
  の `display: grid; grid-template-columns: 1fr 3fr;` で, 左をサイドバー
  (`ProfileSidebar`), 右をメイン (`PinnedDocuments` を包む `<main>`) に1:3で分割します.
  上下の `padding: 24px` はタブ直下に本文が詰まって見えないための独自の余白で, 指示された
  値ではありません.
- `ProfileSidebar` の「ユーザーアバター」+「ユーザー名・メールアドレス」の行,
  `OrganizationListItem` の「組織アバター」+「組織名・役職」の行は, いずれも**アバターが先
  (左), その右にテキスト**の順です (最初はユーザー側だけ逆順で実装し, 後で揃える形になった
  経緯があります — 新しく同種の行を追加する際もこの順に揃えてください). ユーザーアバターは
  `Avater` (`src/components/ui/Avatar.tsx`) の `size="large"` (50px), 組織アバターは
  `size="medium"` (40px, `OrganizationListItem` のみ他より一回り小さい) で, どちらも
  `aspect-ratio: 1` の正方形/円形です. 組織アバターのみ `shape="square"`
  (角丸 `--borderRadius-medium`, 既定は `shape="circle"`) を指定しています — `border`
  (色・太さ) 自体は形状によらず共通の `.avatar` ルールにしているため, 「組織アバターの
  ボーダーをユーザーアバターと揃える」という要件は自然に満たされます. `size` は
  `"small"`/`"medium"`/`"large"` (よく使う大きさの preset) に加えて, 数値も直接受け付けます
  (例: `OrganizationHeaderBox` の `size={100}`, `ActivityCard` の `size={40}`,
  `OrganizationSidebar` の `size={35}`) — 1箇所でしか使わないような大きさのたびに新しい
  preset 名を増やすのを避けるための設計です (`xlarge` という preset が一度作られましたが,
  数値指定に置き換えて削除した経緯があります).

  > **試して撤回した設計**: 「隣接するテキストの高さに動的に合わせる」(`flex` の stretch +
  > `aspect-ratio` で幅を追従させる, `size="fill"` という名前で実装していたもの) という案を,
  > ユーザーアバター (2行分の高さ) →組織アバター (同じく2行分) の順で**二度**試しましたが,
  > どちらも最終的に固定サイズへ戻しています — `.avatar` の `flex: none` や flex item 既定の
  > `min-width`/`min-height: auto` を上書きしてもなお, `width`/`height` が両方 `auto` かつ
  > `aspect-ratio` を持つ置換要素 (`<img>` など) は flexbox の仕様上 `align-items: stretch`
  > の対象外になる (画像本来の実サイズで描画される) ため, 単純な `min-width/height: 0`
  > だけでは解決しません. `height: 100%` (`auto` を避けて stretch 対象にする) を試すと,
  > 今度は逆にテキスト側 (`.text`, 同じく高さ `auto`) まで一緒に引き伸ばされて双方が異常に
  > 巨大化する, 別の問題が発生しました. 動的サイジングを再挑戦する場合は ResizeObserver
  > 等での実測ベースのアプローチを検討してください — 純粋な CSS (flex stretch) での
  > アプローチはこれで二度とも実用に至っていません.

- `OrganizationListItem` はアイコン・組織名・役職の行全体が1つのボタンです —
  `menuItemBase.root` を直接 `<Link to={`/orgs/${organization.id}`}>` に適用しています
  (`UserMenuButton` のプロフィール行と同じパターン). `Organization` (`features/user/types.ts`)
  の `id` は `features/organization/mockData.ts` の `MOCK_ORGANIZATION.id` (`test-org`)
  と一致するものだけ実際のページが存在し, それ以外 (`student-council`/`newspaper-club`)
  はダミーのリンク (404) です. `menuItemBase.root` の `padding: 8px 12px` はアイコン1つ分の
  高さ (35px 前後) を想定した値で, 40px のアバターを乗せるこの行には上下が余分だったため,
  `a.root { padding-top: 0; padding-bottom: 0; }` (タグ込みセレクタで `menuItemBase`
  とのカスケード順に依存せず確実に上書き) で打ち消しています.
- `DocumentCard` は `.root` に `padding: 16px` (四方均等) を持たせ, タイトル行/説明文/
  メタ情報 (3行目) の間隔は個別の margin ではなく `.root` の `gap: 16px` で揃えて統一して
  います.
  - タイトル行: `IconFileText` (`size={20}`, リンクにはしない, 独立した要素) + 文書名
    (`<Link>`, 太字・`--color-link` で青くしリンクであることを示す, サイズ `1rem`) + 状態
    ラベル (`DocumentVisibility`, `Label`) を左詰めで並べます (space-between で右に追いやら
    ないよう, `.title` の `flex` は `0 1 auto` — 伸びて後続の要素を右に追いやらないよう
    `flex-grow: 0` のままにしています. 一度 `flex: 1 1 auto` にして省略記号
    (`text-overflow: ellipsis`) を効かせようとしたところ, 状態ラベルが右端に追いやられて
    しまったため元に戻した経緯があります — 長い文書名の省略が必要になったら, ラベル側を
    `flex-shrink: 0` で固定幅化した上で `.title` 側だけ伸縮させるなど, 左揃えを崩さない
    形で対応してください).
  - 3行目 (`.meta`): 「`IconBuilding` (`size={16}`) + 組織名」と「`IconFile` (`size={16}`)
    + ファイル種別」をそれぞれ `.metaGroup` としてまとめ, `.metaGroup` 間の `gap` を通常の
    アイコン-文字間より広くとる (`24px`) ことで別の情報であることを示しています. 組織名は
    ボーダー無しのボタン (`<Link>` にホバー背景だけを付けたもの) として
    `/orgs/${organizationId}` にリンクします.
  - 文書名の `<Link>` 以外の文字・アイコン (タイトル行の `IconFileText`, 状態ラベル, 説明文,
    3行目一式) はすべて `--color-body-subtext` (Catppuccin `subtext1`, `theme.css` に今回
    追加したトークン) で統一しています — 「これは実際にリンクである」という視覚的な合図を
    `--color-link` の青に一本化するためです.
  - リンク先は文書詳細ページ (`/orgs/${organizationId}/documents/${documentId}`, 実装済み.
    詳細は [`document-detail.md`](document-detail.md)) の形にしています. ただし
    `MOCK_DOCUMENTS` (`features/user/mockData.ts`) の `documentId` は組織側の
    `MOCK_ORGANIZATION_DOCUMENTS` とは別の ID 空間のため (詳細は
    [`organization-profile.md`](organization-profile.md) の「データモデリング」),
    `bunkasai-plan` など大半の ID は一致する文書が無く実際には 404 のままです. カード自体の
    `border`/`border-radius` は指定が無かったため `--borderWidth-thin`/`--borderRadius-medium`
    を流用しています.

`DocumentCard` の説明文 (`.description`) が中央揃えに見える不具合の原因は Vite の React
テンプレート由来の `src/App.css` (`#root { text-align: center; ... }`) が, 明示的に
`text-align` を指定していない要素すべてに中央揃えを継承させていたためでした. 個別の
コンポーネント側で上書きするのではなく, 根本原因である `App.css` とその import ごと削除して
います — 同様に「揃えたはずなのに揃わない」ことがあれば, まずこの手のグローバルな残骸が
無いか (`src/index.css`/`src/styles/` 以下) 疑ってください.
