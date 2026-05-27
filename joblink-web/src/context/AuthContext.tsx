import { createContext, useContext, useState, ReactNode } from "react";
import { authApi } from "../api/index";
import type { Role } from "../api/index";

// Re-exportamos authApi para que AuthModal lo use desde aquí
export { authApi };

type AuthUser = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: Role;
  token: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (dto: {
    name: string; lastname: string; email: string; password: string;
    phone?: string; address?: string;
  }) => Promise<void>;
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

  const isAdmin = user?.role === "ADMIN";

  function saveSession(token: string, userData: AuthUser) {
    if (!userData) return;
    localStorage.setItem("jl_token", token);
    localStorage.setItem("jl_user", JSON.stringify(userData));
    setUser(userData);
    setShowLoginModal(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }

  async function login(identifier: string, password: string) {
    const res = await authApi.login({ identifier, password });
    saveSession(res.access_token, {
      id: res.user.id,
      name: res.user.name,
      lastname: res.user.lastname,
      email: res.user.email,
      role: res.user.role,
      token: res.access_token,
    });
  }

  async function register(dto: {
    name: string; lastname: string; email: string; password: string;
    phone?: string; address?: string;
  }) {
    const res = await authApi.register(dto);
    saveSession(res.access_token, {
      id: res.user.id,
      name: res.user.name,
      lastname: res.user.lastname,
      email: res.user.email,
      role: res.user.role,
      token: res.access_token,
    });
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
      user, isAdmin, login, register, logout,
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
