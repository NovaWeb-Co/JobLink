import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/index";
import { toFullUrl } from "../api/index";
import type { Role } from "../api/index";

type AuthUser = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: Role;
  token: string;
  profilePhoto?: string | null; // ← NUEVO
  phone?: string | null;        // ← NUEVO
  address?: string | null;      // ← NUEVO
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
  // ← NUEVO: actualiza campos del usuario en el contexto y localStorage
  updateProfile: (fields: Partial<Pick<NonNullable<AuthUser>, "profilePhoto" | "phone" | "address">>) => void;
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

  // Actualiza campos del perfil en el contexto y en localStorage
  // sin necesidad de hacer login de nuevo.
  // Normaliza profilePhoto a URL completa automáticamente.
  function updateProfile(fields: Partial<Pick<NonNullable<AuthUser>, "profilePhoto" | "phone" | "address">>) {
    if (!user) return;
    const normalized = {
      ...fields,
      // Siempre guardar URL completa para que funcione al recargar la página
      ...(fields.profilePhoto !== undefined
        ? { profilePhoto: toFullUrl(fields.profilePhoto) }
        : {}),
    };
    const updated = { ...user, ...normalized };
    localStorage.setItem("jl_user", JSON.stringify(updated));
    setUser(updated);
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
      profilePhoto: toFullUrl(res.user.profilePhoto) ?? null,
      phone: res.user.phone ?? null,
      address: res.user.address ?? null,
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
      profilePhoto: toFullUrl(res.user.profilePhoto) ?? null,
      phone: res.user.phone ?? null,
      address: res.user.address ?? null,
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
      updateProfile,
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
