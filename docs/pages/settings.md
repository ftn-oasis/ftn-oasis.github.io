# 設定ページ (`SettingsLayout`/`SettingsAccountPage`)

> 索引: [`../README.md`](../README.md) / 土台: [`organization-documents.md`](organization-documents.md)

`~/settings` — `UserMenuButton` の「設定」(元は実ページの無いリンクでしたが, 今回このページの
実装にあわせて実際に機能するようになりました) が指すページです. 「サイドバーには
`<IconHome> 利用者` を表示し, 学年とアバターを変更できるような UI としてほしい」という
依頼のため, `OrganizationDocumentsSection` と同じサイドバー/縦の Divider/本文の
`1fr auto 3fr` グリッド構成にしています.

## ルーティング

`SettingsLayout` (`src/pages/`) を親ルートとし, index route `SettingsAccountPage`
(サイドバーの「利用者」に対応する本文) をネストしています. `OrganizationLayout` と違い
`:orgId` のような動的パラメータを持たないため, 「見つかりません」判定は不要で,
サイドバー+`<Outlet />` の表示だけを担う薄いレイアウトです. サイドバー
(`SettingsSidebar`, `features/settings/components/`) は現状「利用者」の1項目のみですが,
NavDrawer と同じ `MenuLink` ベースのナビにしており, 今後設定のセクションが増えた際も
同じ形で追加できます.

## 学年 (`GradeToggle`)

`RolePreviewToggle` ([`../architecture.md`](../architecture.md) や `report-issue-modal.md`
等を参照— ユーザーメニューの役職プレビュー切り替え) と同じ「選択中の側にボタン型の
オーバーレイがスライドする」3択トグルですが, こちらはメニュー幅に合わせて引き延ばす必要が
無いため, `ViewModeToggle` と同じ固定ピクセル幅のまま横に3つ並べています (「機能ごとに
似た構成でも別コンポーネントとして持つ」既存の方針のため, 3つとも独立したコンポーネント
です). 選択すると即座に反映・保存されるため, 他の作成フォームのような送信/確認ボタンは
持ちません.

## アバター (`AvatarUploadField`)

「画像ファイルをアップロードしてその場でプレビュー・反映する」という依頼のため
(ユーザーに確認済み — 代替案として少数のプリセットから選ぶ方式も提示しましたが,
こちらが選ばれました), 画像ファイルを選ぶとその場でプレビュー・反映するアップロード欄を
新規実装しています. `ReceiptUploadField` 等のドラッグ&ドロップ欄とは異なり, こちらは
「既に選択済みの1枚を大きく表示 → 変更/既定に戻す」という, 現在の値を編集する構成のため,
別の形で実装しています.

- **`resizeImageToDataUrl`** (`src/lib/`) — バックエンドが無いため, 選んだ画像は
  `UserProfileContext` (下記) を通じて localStorage にそのまま保持する必要があります.
  元画像をそのまま data URL 化すると数MB単位になり得て容量を圧迫しかねないため,
  canvas で最大256pxに縮小してから data URL (`image/jpeg`, 品質0.85) に変換しています.
  特定のドメインにもコンポーネントにも依存しない汎用処理のため `src/lib/` に置いています.
- **既定に戻す**: `avatarDataUrl` が設定されているときだけ表示されるボタンで,
  押すと `null` に戻し既定のアイコン (`/test-user-icon.webp`) の表示に戻ります.

## `Avatar` コンポーネントの拡張と, 反映範囲を意図的に限定した理由

`Avatar` (`components/ui/Avatar.tsx`) は元々, 誰の (どの構成員/文書編集者/会議出席者等の)
アバターかを一切区別しない, 常に固定の `/test-user-icon.webp` を表示するだけのコンポーネント
でした (アプリ全体のあらゆるアバター表示が同じ画像を指しています). 今回, 任意の
`src?: string` prop を追加し, 渡されればそれを使う (渡さなければ従来どおり既定画像) という
形で拡張しています.

**この `src` は, 実際に currentUser 自身のアバターだと確定している呼び出し元だけが
`UserProfileContext` の `avatarDataUrl` を渡すようにしています** — `UserMenuButton`
(トリガー+プロフィール行の2箇所)/`ProfileSidebar` (`/users/:userId`, 常に currentUser
自身のプロフィールしか実データを表示しない — 「プロジェクトについて」を参照)/この設定
ページ自身の3箇所のみです. 構成員一覧/文書編集者/会議出席者などの `Avatar` 呼び出し元は
意図的に変更していません — `Avatar` 自体が「これは誰のアバターか」を区別できないため,
もしグローバルに (全ての `Avatar` 呼び出しに対して) 上書きしてしまうと, 本来は他人の
はずの構成員一覧などの行までアップロードした自分の画像に置き換わってしまう不具合になります
(Playwright で実際に, 構成員一覧の各行が既定アイコンのまま・ヘッダーのアバターだけが
アップロードした画像に変わることを確認済みです).

## `UserProfileContext`

学年/アバターの2つを保持するグローバルな Context です. `ThemeContext` と同じく実際の
ユーザー設定 (確認用の一時的な切り替えである `RolePreviewContext` とは性質が異なる) の
ため, localStorage (`fth-oasis:user-profile` キー) に永続化しています. 学年の既定値
(`DEFAULT_GRADE = 2`) は `features/organization/mockData.ts` の
`CURRENT_USER_AS_MEMBER.grade` と同じ値ですが, `RolePreviewContext` の `previewRole` と
`CURRENT_USER_AS_MEMBER.role` の関係と同様, 両者はあえて連動させていません —
`CURRENT_USER_AS_MEMBER` は文書の編集者一覧などに静的に埋め込まれるデータ生成専用の値の
ため, ここで学年を変更しても追従しません.

## `isAdminRole` の共通化 (`features/organization/memberRole.ts`)

元々 `DocumentOverviewSection.tsx` にだけローカルで定義されていた `isAdminRole`
(委員長/副委員長のような特別な役職を「(管理者)」と付記する判定) を, `RolePreviewContext`
機能の実装時に `UserMenuButton` のプロフィール行でも同じ判定を使う必要が生じたため,
`features/organization/memberRole.ts` へ切り出しています (`MEMBER_ROLES`/
`DEFAULT_MEMBER_ROLE` もあわせてこちらに集約) — `DocumentOverviewSection.tsx` は
この共通化にあわせてインポート元を変更しただけで, 挙動は変更していません.
