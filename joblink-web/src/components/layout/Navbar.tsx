import { useAuth } from "../../context/AuthContext";

type Page = "home" | "services" | "profile" | "admin";
type Props = { page: Page; setPage: (p: Page) => void; };

export default function Navbar({ page, setPage }: Props) {
  const { user, isAdmin, logout, setShowLoginModal } = useAuth();

  return (
    <nav className="navbar">
      <div className="layout-main" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--gold)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--navy)" }}>JL</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>JobLink</span>
        </button>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { id: "home", label: "Inicio" },
            { id: "services", label: "Servicios" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              style={{
                background: page === item.id ? "rgba(255,184,0,0.12)" : "none",
                border: "none", cursor: "pointer", padding: "8px 14px",
                borderRadius: 8, color: page === item.id ? "var(--gold)" : "#94A3B8",
                fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: "0.875rem",
                transition: "all 0.15s",
              }}
            >{item.label}</button>
          ))}

          {/* Panel solo para ADMIN */}
          {isAdmin && (
            <button
              onClick={() => setPage("admin")}
              style={{
                background: page === "admin" ? "rgba(255,184,0,0.12)" : "none",
                border: "none", cursor: "pointer", padding: "8px 14px",
                borderRadius: 8, color: page === "admin" ? "var(--gold)" : "#94A3B8",
                fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: "0.875rem",
              }}
            >
              Admin
            </button>
          )}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              <button
                onClick={() => setPage("profile")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "var(--navy)" }}>
                  {user.name[0]}{user.lastname[0]}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ color: "white", fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", lineHeight: 1.2 }}>{user.name}</span>
                  {isAdmin && (
                    <span style={{ fontSize: "0.65rem", color: "var(--gold)", fontWeight: 700, letterSpacing: "0.05em" }}>ADMIN</span>
                  )}
                </div>
              </button>
              <button onClick={logout} className="btn-ghost" style={{ color: "#94A3B8", fontSize: "0.8rem" }}>Salir</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="btn-ghost" style={{ color: "white" }}>Ingresar</button>
              <button onClick={() => setShowLoginModal(true)} className="btn-primary" style={{ fontSize: "0.8rem" }}>Registrarse</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
