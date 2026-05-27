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
          setLoading(false);
          return;
        }
        // POST /auth/register
        await register({ name, lastname, email, password, phone: phone || undefined });
      } else {
        // POST /auth/login — identifier acepta email o teléfono
        await login(email, password);
      }
    } catch (err) {
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
      className="modal-overlay"
      onClick={() => setShowLoginModal(false)}
    >
      <div className="modal-box" onClick={e => e.stopPropagation()}>
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
            style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--slate)", lineHeight: 1, padding: 0 }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
          <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(null); }}>
            Ingresar
          </button>
          <button className={`tab-btn ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(null); }}>
            Registrarse
          </button>
        </div>

        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
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
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
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
