# テーマ設定 (`ThemePreferenceToggle`/`ThemeContext`)

> 索引: [`../README.md`](../README.md) / 関連: [`../architecture.md`](../architecture.md), [`../ui-common-patterns.md`](../ui-common-patterns.md)

ヘッダーのユーザーアバターを押下すると開くユーザーメニュー内の「外観」項目です.
元は `/settings/theme` (実ページの無い) へのリンクでしたが, 依頼により削除し,
代わりにライト/デバイスに連動/ダークの3択トグルをその場に配置しています.

## `ThemePreferenceToggle`

「見た目は `~/meetings` のモード切替ボタン (`ViewModeToggle`,
[`organization-meetings.md`](organization-meetings.md) を参照) としてほしい」
という依頼のため, 選択中の側にボタン型のオーバーレイ (indicator) がスライドする
同じ仕組みを, 2択ではなく3択 (`IconSun`/`IconDeviceImac`/`IconMoon`) に拡張した
並行コンポーネントです (「機能ごとに似た構成でも別コンポーネントとして持つ」
既存の方針のため `ViewModeToggle` 自体は変更していません). ツールチップは
`aria-label` を CSS の `::after` で表示する `ViewModeToggle` と同じ仕組みで,
「ライトモード」/「デバイスに連動」/「ダークモード」をそれぞれ表示します.
`UserMenuButton.tsx` では `menuItemBase` を使う通常のクリック可能な行とは
異なる (トグル自体が既にインタラクティブなため) `.themeRow`/`.themeLabel`
という個別のラベル+右寄せの行として配置しています.

## `ThemeContext` の拡張 (3択+永続化)

元の `ThemeContext` は `theme: "light" | "dark"` の2値のみを持ち, `toggleTheme`
での手動切り替えも「ページを再読み込みするまでの間だけ」有効という, 永続化
未対応の実装でした (`hasManualOverrideRef` — リロードで失われる). 「これらの
情報を永続的に保存するようにしてほしい」という依頼のため, 以下の形に拡張して
います (`useTheme`/`toggleTheme` はこの依頼の直前まで実際にはどこからも
呼ばれていなかったため, 既存の呼び出し元への影響はありません):

- **`ThemePreference`** (`"light" | "dark" | "system"`, `erasableSyntaxOnly`
  対応の const オブジェクト + union 型) — ユーザーが選んだ設定そのものです.
  「システムに連動」なら OS の設定に追従し, 「ライト」/「ダーク」なら明示的に
  固定します.
- **`theme`** (`"light" | "dark"`) — 実際に `data-theme` 属性へ反映する,
  `ThemePreference` から導出した値です. `theme.css` の
  `[data-theme="light"|"dark"]` セレクタは変更していないため, この2値の
  意味自体は従来のままです.
- **`localStorage` への永続化** (`fth-oasis:theme-preference` キー,
  `navigationHistoryStack.ts` の `"fth-oasis:nav-stack"` と同じ命名規則) —
  `setThemePreference` を呼ぶたびに書き込み, `ThemeProvider` のマウント時に
  読み込みます. 「標準で "デバイスに連動" が選択されるようにしてほしい」
  という依頼のため, 保存されていない (未訪問)/壊れている/プライベート
  ブラウジング等で読み取れない場合はすべて `ThemePreference.System`
  にフォールバックします (`isThemePreference` で保存値の妥当性を検証した
  上で判定 — 不正な値が紛れ込んでいても安全側にフォールバックします).
- **OS のテーマ変更への追従は「デバイスに連動」を選んでいる間だけ**:
  `prefers-color-scheme` の `change` イベントを監視する `useEffect` の依存を
  `themePreference` にし, `System` 以外のときはリスナー自体を張りません
  (元の実装は `hasManualOverrideRef` という ref のフラグで判定していましたが,
  「選択した設定 (`themePreference`) そのものが real の状態」という設計に
  なったため, ref による特別扱いは不要になり削除しています).
