// ~/settings (利用者設定) の学年/アバターを保持する Context. ThemeContext と
// 同じく実際のユーザー設定 (確認用の一時的な切り替えである RolePreviewContext
// とは性質が異なる) のため, localStorage に永続化しています.
//
// 学年の既定値 (DEFAULT_GRADE = 2) は features/organization/mockData.ts の
// CURRENT_USER_AS_MEMBER.grade と同じ値ですが, RolePreviewContext の
// previewRole と CURRENT_USER_AS_MEMBER.role の関係と同様, 両者はあえて
// 連動させていません — CURRENT_USER_AS_MEMBER は文書の編集者一覧などに
// 静的に埋め込まれるデータ生成専用の値のため, ここで学年を変更しても
// 追従しません.

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

const STORAGE_KEY = "fth-oasis:user-profile";

const DEFAULT_GRADE = 2;

type StoredUserProfile = {
  grade: number;
  avatarDataUrl: string | null;
};

const DEFAULT_PROFILE: StoredUserProfile = { grade: DEFAULT_GRADE, avatarDataUrl: null };

function isValidGrade(value: unknown): value is number {
  return value === 1 || value === 2 || value === 3;
}

function readStoredProfile(): StoredUserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_PROFILE;

    const candidate = parsed as Partial<StoredUserProfile>;
    return {
      grade: isValidGrade(candidate.grade) ? candidate.grade : DEFAULT_GRADE,
      avatarDataUrl: typeof candidate.avatarDataUrl === "string" ? candidate.avatarDataUrl : null,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeStoredProfile(profile: StoredUserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // 容量超過/プライベートブラウジング等で保存できない場合は永続化自体を諦める
    // (navigationHistoryStack.ts の writeNavigationStack と同じ割り切り)
  }
}

type UserProfileContextType = {
  grade: number;
  setGrade: (grade: number) => void;
  avatarDataUrl: string | null;
  setAvatarDataUrl: (dataUrl: string | null) => void;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile は UserProfileProvider の内部で使用してください");
  }
  return context;
}

function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StoredUserProfile>(readStoredProfile);

  const setGrade = useCallback((grade: number) => {
    setProfile((prev) => {
      const next = { ...prev, grade };
      writeStoredProfile(next);
      return next;
    });
  }, []);

  const setAvatarDataUrl = useCallback((avatarDataUrl: string | null) => {
    setProfile((prev) => {
      const next = { ...prev, avatarDataUrl };
      writeStoredProfile(next);
      return next;
    });
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        grade: profile.grade,
        setGrade,
        avatarDataUrl: profile.avatarDataUrl,
        setAvatarDataUrl,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export { UserProfileProvider, useUserProfile };
