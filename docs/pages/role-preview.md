# 役職プレビュー切り替え (`RolePreviewToggle`/`RolePreviewContext`)

> 索引: [`../README.md`](../README.md) / 関連: [`../ui-common-patterns.md`](../ui-common-patterns.md), [`settings.md`](settings.md)

「ユーザーの役職によって表示する UI を変更したいので, ダミーの種類を増やし,
それぞれの目線から確認できるようにしたい」という相談への回答として, 実データ
(構成員一覧などの実際の `MOCK_MEMBERS`) を増やす方式ではなく,
**「今表示している画面を, 別の役職で見たらどう見えるか」をその場で切り替えられる
プレビュー用スイッチ**を提案し, 実装しました. ユーザーメニュー (`UserMenuButton`,
アバター押下で開くパネル) の中に配置しています.

## なぜ実データ (ダミーの役職違いユーザー) を増やす方式にしなかったか

「役職ごとにダミーユーザーを増やし, それぞれのアカウントとしてログインし直して
確認する」という方式も考えられますが, このアプリには認証/ログインの概念自体が
存在せず (`currentUser.ts` に固定の1ユーザーがあるだけ), 「アカウント切り替え」を
一から作るのは今回の目的 (役職によって出し分けるUIを素早く確認したい) に対して
大掛かりすぎると判断しました. 代わりに, **currentUser 自身はそのままに, 「表示上の
役職」だけをその場で切り替えられるプレビュー機能**を提案し, 採用されています.

## `RolePreviewContext`

`previewRole`/`setPreviewRole` を保持するグローバルな Context です.
`features/organization/memberRole.ts` の `MEMBER_ROLES` (`委員長`/`副委員長`/`委員`) を
既定の切り替え先とし, 初期値は `DEFAULT_MEMBER_ROLE` (`委員` — 特別な権限を持たない
既定の役職) です.

**`ThemeContext`/`UserProfileContext` (実際のユーザー設定, `settings.md` を参照) とは
異なり, あえて localStorage へ永続化していません** — こちらは「今この場で違う目線から
確認したい」という開発/QA 用の一時的な切り替えであり, リロードするたびに既定の
`委員` へ戻るのが自然だと判断したためです.

**`CURRENT_USER_AS_MEMBER.role` (`features/organization/mockData.ts`) とはあえて
連動させていません** — `CURRENT_USER_AS_MEMBER` は文書の編集者一覧や会議の出席者
一覧など, 複数のモックデータ配列にモジュール読み込み時に静的に埋め込まれる値のため,
Context の変更に反応して差し替わることができません. **今後, 役職によって出し分ける
UI を新しく実装する際は, 必ず `useRolePreview()` (この Context) を直接参照してください
— `CURRENT_USER_AS_MEMBER.role` を参照しても, プレビュー切り替えに反応しません.**

## `RolePreviewToggle`

`ThemePreferenceToggle` ([`theme-preference.md`](theme-preference.md)) と同じ
「選択中の側にボタン型のオーバーレイがスライドする」トグルの構造 (メニュー幅いっぱいに
引き延ばす, パーセンテージベースの variant) を, 2値 (ライト/ダーク) 3値
(ライト/デバイスに連動/ダーク) ではなく `MEMBER_ROLES` の3値 (委員長/副委員長/委員) に
差し替えた, 独立した並行コンポーネントです (「機能ごとに似た構成でも別コンポーネントとして
持つ」既存の方針のため, `ThemePreferenceToggle` 自体は変更していません). アイコンでは
文字が長い役職名を表現しづらいため, `ThemePreferenceToggle` のアイコンとは異なり
テキストラベルをそのままボタンに表示しています.

- **`box-sizing: border-box` の必要性**: `.indicator` の幅を `calc((100% - 6px) / 3)`
  のようなパーセンテージ計算で求める variant では, `.indicator` 自身がボーダーを
  持つ場合 `box-sizing: border-box` を明示しないと, ボーダー幅の分だけ実際の要素幅が
  `calc()` の計算値からずれます. 結果として `translateX(200%)` (自分自身の幅の2倍)
  が本来の位置よりわずかに右へ超過し, 3つ目の選択肢を選んだときだけ右端の余白が
  不揃いに見える不具合になります — `ThemePreferenceToggle.module.css` で先に発見・
  修正されていたのと全く同じ原因のため, こちらの `.module.css` にも同じ修正
  (`box-sizing: border-box` を `.indicator` へ追加) を適用しています.

## `UserMenuButton` での表示

- **プレビュー切り替え本体**: プロフィール行の下, 「設定」リンク+外観トグルの下に,
  区切り線を挟んで「表示する役職 (プレビュー用)」というラベル+`RolePreviewToggle`
  を配置しています — 「プレビュー用」という注記により, これが実際のユーザー設定
  ではないことを明示しています.
- **プロフィール行への反映**: プロフィール行 (アバター+名前+メールアドレス) に
  「役職: {previewRole}」を追加表示し, `isAdminRole(previewRole)`
  (`memberRole.ts`, 委員長/副委員長のような特別な役職の判定) が真なら
  「(管理者)」を付記します — `DocumentOverviewSection` の「編集者(管理者は)」
  と同じ判定ロジックを, 切り替え結果の確認用にここでも使っています.

## `isAdminRole` の共通化

元々 `DocumentOverviewSection.tsx` にだけローカルで定義されていた `isAdminRole` を,
このプレビュー機能でも同じ判定が必要になったため `features/organization/memberRole.ts`
へ切り出しています (`MEMBER_ROLES`/`DEFAULT_MEMBER_ROLE` もあわせて集約). 詳細は
[`settings.md`](settings.md) の該当節も参照してください (両方の機能から参照される
ため, どちらのページのドキュメントにも同じ説明を残しています).
