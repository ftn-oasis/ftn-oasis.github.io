import { currentUser } from "@src/lib/currentUser";

import type { OrganizationDocument } from "./types";

// 「文書のビューワについて, 閲覧権限のみ・議決されている場合 (管理・編集権限が
// あっても議決されたものはこれを表示): 問題点を指摘・修正提案のボタン, 管理・
// 編集権限があり, 議決されたものでない場合: 編集ボタン」という依頼のため.
// document.editors に currentUser が含まれるかどうかを「管理・編集権限」の
// 判定に使う (このアプリに editors 以外の権限概念は無いため) — 議決済み
// (document.resolution が存在する) の場合は, 編集権限の有無に関わらず
// 常に false (編集不可) を返す
function canCurrentUserEditDocument(document: OrganizationDocument): boolean {
  if (document.resolution) return false;
  return document.editors.some((editor) => editor.id === currentUser.id);
}

export { canCurrentUserEditDocument };
