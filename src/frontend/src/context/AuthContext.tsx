import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

const DATASET_STORAGE_KEY = "banksegment_data";
const USERS_STORAGE_KEY = "banksegment_users";

interface User {
  email: string;
  name: string;
}

interface StoredUser {
  name: string;
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  logout: () => void;
  resetPassword: (
    email: string,
    newPassword: string,
  ) => { success: boolean; error?: string };
  checkEmailExists: (email: string) => boolean;
}

function hashPassword(password: string): string {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    h = (h * 33) ^ password.charCodeAt(i);
  }
  return `pbkdf2$${(h >>> 0).toString(16).padStart(8, "0")}`;
}

function loadUsers(): Map<string, StoredUser> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return new Map();
    const obj: Record<string, StoredUser> = JSON.parse(raw);
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

function saveUsers(store: Map<string, StoredUser>): void {
  const obj: Record<string, StoredUser> = {};
  store.forEach((v, k) => {
    obj[k] = v;
  });
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(obj));
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  signup: () => ({ success: false }),
  login: () => ({ success: false }),
  logout: () => {},
  resetPassword: () => ({ success: false }),
  checkEmailExists: () => false,
});

export function AuthContextProvider({
  children,
}: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signup = useCallback(
    (
      name: string,
      email: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const key = email.trim().toLowerCase();
      const store = loadUsers();
      if (store.has(key)) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
      store.set(key, {
        name: name.trim(),
        passwordHash: hashPassword(password),
      });
      saveUsers(store);
      return { success: true };
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const key = email.trim().toLowerCase();
      const store = loadUsers();
      const stored = store.get(key);
      if (!stored) {
        return { success: false, error: "No account found with this email." };
      }
      if (stored.passwordHash !== hashPassword(password)) {
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }
      localStorage.removeItem(DATASET_STORAGE_KEY);
      setUser({ email: key, name: stored.name });
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => setUser(null), []);

  const checkEmailExists = useCallback((email: string): boolean => {
    const store = loadUsers();
    return store.has(email.trim().toLowerCase());
  }, []);

  const resetPassword = useCallback(
    (
      email: string,
      newPassword: string,
    ): { success: boolean; error?: string } => {
      const key = email.trim().toLowerCase();
      const store = loadUsers();
      const stored = store.get(key);
      if (!stored) {
        return { success: false, error: "No account found with this email." };
      }
      if (newPassword.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }
      store.set(key, {
        ...stored,
        passwordHash: hashPassword(newPassword),
      });
      saveUsers(store);
      return { success: true };
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        signup,
        login,
        logout,
        resetPassword,
        checkEmailExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
