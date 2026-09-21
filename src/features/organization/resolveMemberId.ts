import { currentUser } from "@src/lib/currentUser";

import { MOCK_MEMBERS } from "./mockData";

// actorName/proposerName/authorName/uploaderName/submitterName/posterName など,
// id を持たない名前の文字列表示箇所から, プロフィールページ (/users/:userId) へ
// リンクするための userId を逆引きする (UserNameLink@components/ui/ と組み合わせて
// 使う). currentUser 自身の名前, または MOCK_MEMBERS の名前と完全一致する場合
// だけ解決できる — どちらにも一致しない場合 (組織名など, そもそも個人を指さない
// 文字列を含む) は undefined を返し, 呼び出し側はリンクにせずそのまま表示する
function resolveMemberId(name: string): string | undefined {
  if (name === currentUser.name) return currentUser.id;
  return MOCK_MEMBERS.find((member) => member.name === name)?.id;
}

export { resolveMemberId };
