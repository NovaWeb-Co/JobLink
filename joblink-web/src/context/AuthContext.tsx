import { createContext, useContext, useState, ReactNode } from "react";
import { authApi, type RegisterDto } from "../api/auth";

type AuthUser = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  token: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  login: (identifier: string, password: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const stored = localStorage.getItem("jl_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  function saveUser(token: string, userData: AuthUser) {
    if (!userData) return;
    localStorage.setItem("jl_token", token);
    localStorage.setItem("jl_user", JSON.stringify(userData));
    setUser(userData);
    setShowLoginModal(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }

  // Login real: POST /auth/login con { identifier, password }
  async function login(identifier: string, password: string) {
    const res = await authApi.login({ identifier, password });
    const authUser: AuthUser = {
      id: res.user.id,
      name: res.user.name,
      lastname: res.user.lastname,
      email: res.user.email,
      token: res.access_token,
    };
    saveUser(res.access_token, authUser);
  }

  // Registro real: POST /auth/register
  async function register(dto: RegisterDto) {
    const res = await authApi.register(dto);
    const authUser: AuthUser = {
      id: res.user.id,
      name: res.user.name,
      lastname: res.user.lastname,
      email: res.user.email,
      token: res.access_token,
    };
    saveUser(res.access_token, authUser);
  }

  function logout() {
    localStorage.removeItem("jl_token");
    localStorage.removeItem("jl_user");
    setUser(null);
  }

  function requireAuth(action: () => void) {
    if (user) { action(); return; }
    setPendingAction(() => action);
    setShowLoginModal(true);
  }

  return (
    <AuthContext.Provider value={{
      user, login, register, logout,
      requireAuth, showLoginModal, setShowLoginModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
