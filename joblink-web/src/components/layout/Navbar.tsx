import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

type Page = "home" | "services" | "profile" | "admin" | "root";
type Props = { page: Page; setPage: (p: Page) => void; onLogout: () => void; };

export default function Navbar({ page, setPage, onLogout }: Props) {
  const { user, isAdmin, setShowLoginModal } = useAuth();
  const isRoot = user?.role === "ROOT";
  const isAdminOrRoot = isAdmin || isRoot;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="layout-main" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 8 }}>

        {/* Logo */}
        <button onClick={() => { setPage("home"); setMenuOpen(false); }}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--gold)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--navy)" }}>JL</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "white" }}>JobLink</span>
        </button>

        {/* Nav links — ocultos en mobile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: 1,
            justifyContent: "center"
          }}
          className="nav-desktop"
        >
          {!isAdminOrRoot &&
            [
              { id: "home", label: "Inicio" },
              { id: "services", label: "Servicios" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id as Page)}
                style={{
                  background:
                    page === item.id
                      ? "rgba(255,184,0,0.12)"
                      : "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color:
                    page === item.id
                      ? "var(--gold)"
                      : "#94A3B8",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                {item.label}
              </button>
            ))}

          {isAdmin && !isRoot && (
            <button
              onClick={() => setPage("admin")}
              style={{
                background:
                  page === "admin"
                    ? "rgba(255,184,0,0.12)"
                    : "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 8,
                color:
                  page === "admin"
                    ? "var(--gold)"
                    : "#94A3B8",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Admin
            </button>
          )}

          {user && isRoot && (
            <button
              onClick={() => setPage("root")}
              style={{
                background:
                  page === "root"
                    ? "rgba(255,184,0,0.12)"
                    : "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 8,
                color:
                  page === "root"
                    ? "var(--gold)"
                    : "#94A3B8",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              👑 Root
            </button>
          )}

        </div>

        {/* Auth + hamburguesa */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {user ? (
            <>
              {!isRoot && (
                <button
                  disabled={isRoot}
                  onClick={() => {
                    setPage("profile");
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.07)",
                    border: "none",
                    borderRadius: 10,
                    padding: "5px 10px",
                    cursor: isRoot ? "not-allowed" : "pointer",
                    opacity: isRoot ? 0.6 : 1,
                  }}
                >
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name}
                      style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--navy)" }}>
                      {user.name[0]}{user.lastname[0]}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ color: "white", fontSize: "0.82rem", fontFamily: "DM Sans, sans-serif", lineHeight: 1.2 }}>{user.name}</span>
                    {isRoot ? (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        ROOT
                      </span>
                    ) : isAdmin ? (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "var(--gold)",
                          fontWeight: 700,
                        }}
                      >
                        ADMIN
                      </span>
                    ) : null}
                  </div>
                </button>
              )}

                < button
                onClick={onLogout}
              className="btn-ghost nav-desktop"
              style={{ color: "#94A3B8", fontSize: "0.8rem" }}
              >
              Salir
            </button>
        </>
        ) : (
        <>
          <button onClick={() => setShowLoginModal(true)} className="btn-ghost nav-desktop"
            style={{ color: "white" }}>Ingresar</button>
          <button onClick={() => setShowLoginModal(true)} className="btn-primary"
            style={{ fontSize: "0.8rem", padding: "7px 12px" }}>Registrarse</button>
        </>
          )}

        {/* Hamburguesa — solo visible en mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile"
          style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1.4rem", lineHeight: 1, padding: "4px 6px" }}
          aria-label="Menú">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </div>

      {/* Menú desplegable mobile */ }
  {
    menuOpen && (
      <div style={{ background: "var(--navy-mid)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "0.75rem 1.25rem 1rem" }}>
        {!isAdminOrRoot &&
          [{ id: "home", label: "🏠 Inicio" }, { id: "services", label: "🔧 Servicios" },].map(item => (
            <button key={item.id} onClick={() => { setPage(item.id as Page); setMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 0", color: page === item.id ? "var(--gold)" : "#94A3B8", fontFamily: "DM Sans, sans-serif", fontSize: "0.95rem", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {item.label}
            </button>
          ))
        }

        {user && isAdmin && (
          <button onClick={() => { setPage("admin"); setMenuOpen(false); }}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 0", color: page === "admin" ? "var(--gold)" : "#94A3B8", fontFamily: "DM Sans, sans-serif", fontSize: "0.95rem", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            👑 Panel Admin
          </button>
        )}

        {user && isRoot && (
          <button
            onClick={() => {
              setPage("root");
              setMenuOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              padding: "10px 0",
              color:
                page === "root"
                  ? "var(--gold)"
                  : "#94A3B8",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "0.95rem",
              cursor: "pointer",
              borderBottom:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            👑 Panel Root
          </button>
        )}

        {user && (
          <button onClick={() => { onLogout(); setMenuOpen(false); }}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 0", color: "#EF4444", fontFamily: "DM Sans, sans-serif", fontSize: "0.95rem", cursor: "pointer" }}>
            🚪 Cerrar sesión
          </button>
        )}
      </div>
    )
  }
    </nav >
  );
}
