import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "../api/auth";

interface AuthUser {
  email: string;
  accessToken: string;
  tokenType: string;
  userRole: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    token: { accessToken: string; tokenType: string; userRole: UserRole },
  ) => void;
  logout: () => void;
}

const STORAGE_KEY = "spig:auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (
    email: string,
    token: { accessToken: string; tokenType: string; userRole: UserRole },
  ) => {
    setUser({
      email,
      accessToken: token.accessToken,
      tokenType: token.tokenType,
      userRole: token.userRole,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isAdmin: user?.userRole === "ADMIN",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }

  return context;
}
