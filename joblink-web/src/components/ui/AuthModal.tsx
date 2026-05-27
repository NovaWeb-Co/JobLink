import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AuthModal() {
  const { login, register, setShowLoginModal } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || password.length < 6) {
      setError("Email obligatorio y contraseña mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim() || !lastname.trim()) {
          setError("Nombre y apellido son obligatorios.");
          return;
        }
        await register({ name, lastname, email, password, phone: phone || undefined });
      } else {
        // identifier acepta email o teléfono
        await login(email, password);
      }
    } catch (err) {
      // Parsear mensaje de error del backend
      const raw = String(err).replace("Error: ", "");
      try {
        const parsed = JSON.parse(raw);
        const msg = parsed.message;
        setError(Array.isArray(msg) ? msg.join(", ") : msg || raw);
      } catch {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}
      onClick={() => setShowLoginModal(false)}
    >
      <div
        style={{ background: "white", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "var(--navy)" }}>
              {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--slate)", margin: "4px 0 0" }}>
              {mode === "login" ? "Ingresa con tu email o teléfono" : "Únete a JobLink hoy"}
            </p>
          </div>
          <button onClick={() => setShowLoginModal(false)}
            style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--slate)", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: "1.5rem" }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1, padding: "0.75rem", border: "none", background: "none", cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", fontWeight: mode === m ? 600 : 400, fontSize: "0.875rem",
                color: mode === m ? "var(--navy)" : "var(--slate)",
                borderBottom: `2px solid ${mode === m ? "var(--gold)" : "transparent"}`, marginBottom: -2,
              }}>
              {m === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B", marginBottom: "1rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {mode === "register" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ana" required />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input className="input" value={lastname} onChange={e => setLastname(e.target.value)} placeholder="García" required />
                </div>
              </div>
              <div>
                <label className="label">Teléfono (opcional)</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567" />
              </div>
            </>
          )}

          <div>
            <label className="label">{mode === "login" ? "Email o teléfono" : "Email"}</label>
            <input
              type={mode === "login" ? "text" : "email"}
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={mode === "login" ? "tu@email.com o 3001234567" : "tu@email.com"}
              required
            />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem", marginTop: 4 }}
          >
            {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
