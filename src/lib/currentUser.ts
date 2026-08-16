// 認証機能は未実装のため, テスト用アイコン (test-user-icon.webp) に合わせた仮のユーザー情報.
// id はユーザー名とは別の, URL に直接使える英数字の識別子 (例: /test-user)
const currentUser = {
  id: "test-user",
  name: "テストユーザー",
  email: "test-user@example.com",
};

export { currentUser };
