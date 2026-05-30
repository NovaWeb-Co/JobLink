import { useState } from "react";
import { useServices, useRatings, useCreateMessage } from "../api/queries";
import { usersApi } from "../api/index";
import { toFullUrl } from "../api/index";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";

const CAT_EMOJI: Record<string, string> = {
  "Plomería": "🔧", "Electricidad": "⚡", "Carpintería": "🪚", "Pintura": "🎨",
  "Limpieza": "🧹", "Jardinería": "🌿", "Tecnología": "💻", "Transporte": "🚚",
  "Salud": "🩺", "Educación": "📚",
};
const CAT_BG: Record<string, string> = {
  "Plomería": "#E0F2FE", "Electricidad": "#FEF3C7", "Carpintería": "#FEF9C3",
  "Pintura": "#FCE7F3", "Limpieza": "#DCFCE7", "Jardinería": "#DCFCE7",
  "Tecnología": "#E0E7FF", "Transporte": "#FFF7ED", "Salud": "#F0FDF4", "Educación": "#EFF6FF",
};

type Props = { userId: number; onBack: () => void; onServiceClick: (id: number) => void; };

export default function ProviderProfilePage({ userId, onBack, onServiceClick }: Props) {
  const { data: services = [] } = useServices();
  const { data: ratings = [] } = useRatings();
  const { user, requireAuth } = useAuth();
  const createMsg = useCreateMessage();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.get(userId),
  });

  const [msgContent, setMsgContent] = useState("");
  const [msgDone, setMsgDone] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const providerServices = services.filter(s => s.userId === userId && s.availability);
  const allServices = services.filter(s => s.userId === userId);
  const allRatings = ratings.filter(r => allServices.some(s => s.id === r.serviceId));
  const avgScore = allRatings.length
    ? allRatings.reduce((a, r) => a + r.score, 0) / allRatings.length : 0;

  // Categorías únicas que ofrece el proveedor
  const categories = [...new Set(allServices.map(s => s.category))];

  async function handleMessage(e: React.FormEvent) {
    e.preventDefault();
    requireAuth(async () => {
      await createMsg.mutateAsync({ content: msgContent, senderId: user!.id, receiverId: userId });
      setMsgDone(true); setMsgContent("");
    });
  }

  if (isLoading) return (
    <div className="layout-main" style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 1rem" }} />
      <p style={{ color: "var(--slate)" }}>Cargando perfil...</p>
    </div>
  );

  if (!provider) return (
    <div className="layout-main" style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
      <p>Proveedor no encontrado.</p>
      <button className="btn-primary" onClick={onBack}>Volver</button>
    </div>
  );

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      <button onClick={onBack} className="btn-ghost" style={{ marginBottom: "1rem", paddingLeft: 0 }}>
        ← Volver
      </button>

      {/* ─── HERO DEL PERFIL ──────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem", overflow: "hidden" }}>
        {/* Banner de color */}
        <div style={{ height: 120, background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)", position: "relative" }}>
          {categories.slice(0, 4).map((cat, i) => (
            <span key={cat} style={{
              position: "absolute", fontSize: "2rem", opacity: 0.15,
              top: `${20 + (i % 2) * 40}%`, left: `${10 + i * 22}%`,
            }}>{CAT_EMOJI[cat] ?? "🛠️"}</span>
          ))}
        </div>

        <div style={{ padding: "0 2rem 2rem" }}>
          {/* Foto de perfil */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
            <div style={{ marginTop: -48 }}>
              {provider.profilePhoto ? (
                <img
                  src={toFullUrl(provider.profilePhoto) ?? ""}
                  alt={provider.name}
                  style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--gold)", border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--navy)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  {provider.name[0]}{provider.lastname[0]}
                </div>
              )}
            </div>
            {/* Calificación destacada */}
            {allRatings.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--navy)", lineHeight: 1 }}>
                  {avgScore.toFixed(1)}
                </div>
                <div className="stars" style={{ fontSize: "1rem" }}>
                  {"★".repeat(Math.round(avgScore))}{"☆".repeat(5 - Math.round(avgScore))}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--slate)" }}>{allRatings.length} reseñas</div>
              </div>
            )}
          </div>

          {/* Nombre y badges */}
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", margin: "0 0 6px", color: "var(--navy)" }}>
            {provider.name} {provider.lastname}
          </h1>

          {/* Categorías como badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
            {categories.map(cat => (
              <span key={cat} className="badge badge-gold">{CAT_EMOJI[cat]} {cat}</span>
            ))}
            {allRatings.length > 0 && (
              <span className="badge badge-green">✓ Verificado</span>
            )}
          </div>

          {/* Stats rápidas */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--slate)" }}>
              <span style={{ fontSize: "1.1rem" }}>🔧</span>
              <span><strong style={{ color: "var(--navy)" }}>{allServices.length}</strong> servicios publicados</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--slate)" }}>
              <span style={{ fontSize: "1.1rem" }}>✅</span>
              <span><strong style={{ color: "var(--navy)" }}>{providerServices.length}</strong> disponibles ahora</span>
            </div>
            {provider.address && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--slate)" }}>
                <span style={{ fontSize: "1.1rem" }}>📍</span>
                <span>{provider.address}</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() => {
                if (!user) { requireAuth(() => setShowContact(true)); return; }
                setShowContact(!showContact);
              }}
            >
              📞 Ver contacto
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                if (!user) { requireAuth(() => { }); return; }
                document.getElementById("msg-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              💬 Enviar mensaje
            </button>
          </div>

          {/* Panel de contacto — aparece al hacer clic */}
          {showContact && user && (
            <div style={{ marginTop: "1.25rem", padding: "1rem", background: "var(--slate-light)", borderRadius: 12 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.75rem" }}>
                Información de contacto
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>✉️</span>
                  <a href={`mailto:${provider.email}`} style={{ color: "var(--navy)", fontWeight: 500 }}>{provider.email}</a>
                </div>
                {provider.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>📱</span>
                    <a href={`tel:${provider.phone}`} style={{ color: "var(--navy)", fontWeight: 500 }}>{provider.phone}</a>
                  </div>
                )}
                {provider.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>📍</span>
                    <span style={{ color: "var(--navy)" }}>{provider.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* ─── Columna izquierda ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Servicios */}
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", marginBottom: "1rem", color: "var(--navy)" }}>
              Servicios ofrecidos
            </h2>
            {allServices.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔧</div><p>No tiene servicios publicados.</p></div>
            ) : (
              <div className="services-grid">
                {allServices.map(s => {
                  const sRatings = ratings.filter(r => r.serviceId === s.id);
                  const avg = sRatings.length
                    ? sRatings.reduce((a, r) => a + r.score, 0) / sRatings.length : null;
                  return (
                    <div key={s.id} className="service-card" onClick={() => onServiceClick(s.id)}>
                      {/* Imagen del servicio: si no hay foto, emoji de categoría con fondo */}
                      {toFullUrl(s.imageUrl) ? (
                        <div style={{ height: 140, overflow: "hidden" }}>
                          <img src={toFullUrl(s.imageUrl)!} alt={s.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => {
                              const p = (e.target as HTMLImageElement).parentElement!;
                              p.style.background = CAT_BG[s.category] ?? "#F1F5F9";
                              p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center";
                              p.innerHTML = `<span style="font-size:2.5rem">${CAT_EMOJI[s.category] ?? "🛠️"}</span>`;
                            }} />
                        </div>
                      ) : (
                        <div className="service-card-img" style={{ background: CAT_BG[s.category] ?? "#F1F5F9" }}>
                          <span style={{ fontSize: "2.5rem" }}>{CAT_EMOJI[s.category] ?? "🛠️"}</span>
                        </div>
                      )}
                      <div className="service-card-body">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{s.category}</span>
                          {s.availability
                            ? <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>● Disponible</span>
                            : <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>No disponible</span>}
                        </div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: "6px 0 4px", color: "var(--navy)" }}>{s.title}</h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {s.description}
                        </p>
                        {s.location && <p style={{ fontSize: "0.72rem", color: "#94A3B8", margin: "0 0 6px" }}>📍 {s.location}</p>}
                        {avg !== null && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                            <span className="stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(Math.round(avg))}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>({sRatings.length})</span>
                          </div>
                        )}
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: "auto 0 0", color: "var(--navy)", fontSize: "1.05rem" }}>
                          {s.price != null
                            ? <>${s.price.toLocaleString()} <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, fontSize: "0.72rem", color: "var(--slate)" }}>COP</span></>
                            : <span style={{ fontSize: "0.82rem", color: "var(--teal)", fontWeight: 600 }}>💬 Precio negociable</span>
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reseñas recibidas */}
          {allRatings.length > 0 && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", margin: "0 0 1rem", color: "var(--navy)" }}>
                Reseñas ({allRatings.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {allRatings.slice(0, 5).map(r => {
                  const reviewer = r.user;
                  const svc = allServices.find(s => s.id === r.serviceId);
                  return (
                    <div key={r.id} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--slate-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--slate)", flexShrink: 0 }}>
                            {reviewer ? `${reviewer.name[0]}${reviewer.lastname[0]}` : "?"}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                              {reviewer ? `${reviewer.name} ${reviewer.lastname}` : "Usuario"}
                            </span>
                            {svc && <span style={{ fontSize: "0.72rem", color: "var(--slate)", marginLeft: 6 }}>· {svc.title}</span>}
                          </div>
                        </div>
                        <span className="stars" style={{ fontSize: "0.9rem" }}>
                          {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                        </span>
                      </div>
                      {r.comment && <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 0 40px" }}>{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Columna derecha ────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: 80 }}>

          {/* Tarjeta de contacto */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", margin: "0 0 1rem", color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Contacto
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>✉️</div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Email</p>
                  {user ? (
                    <a href={`mailto:${provider.email}`} style={{ fontSize: "0.85rem", color: "var(--navy)", fontWeight: 500 }}>{provider.email}</a>
                  ) : (
                    <button className="btn-ghost" style={{ padding: 0, fontSize: "0.85rem", color: "#94A3B8" }} onClick={() => requireAuth(() => { })}>
                      Ingresar para ver
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📱</div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Teléfono</p>
                  {user && provider.phone ? (
                    <a href={`tel:${provider.phone}`} style={{ fontSize: "0.85rem", color: "var(--navy)", fontWeight: 500 }}>{provider.phone}</a>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>{user ? "No registrado" : "Ingresar para ver"}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📍</div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Zona de trabajo</p>
                  <span style={{ fontSize: "0.85rem", color: "var(--navy)", fontWeight: 500 }}>
                    {provider.address ?? "No especificado"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de mensaje */}
          <div className="card" style={{ padding: "1.25rem" }} id="msg-form">
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", margin: "0 0 1rem", color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Enviar mensaje
            </h3>
            {msgDone ? (
              <div className="alert alert-success">✅ Mensaje enviado a {provider.name}.</div>
            ) : (
              <form onSubmit={handleMessage} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <textarea
                  className="input"
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  placeholder={`Hola ${provider.name}, me interesa tu servicio de...`}
                  required
                  style={{ minHeight: 80, resize: "vertical" }}
                />
                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={createMsg.isPending}>
                  {createMsg.isPending ? "Enviando..." : "Enviar mensaje"}
                </button>
                {!user && (
                  <p style={{ fontSize: "0.72rem", color: "var(--slate)", textAlign: "center" }}>
                    Debes <button className="btn-ghost" style={{ padding: 0, fontSize: "0.72rem", color: "#1565C0" }} onClick={() => requireAuth(() => { })}>ingresar</button> para enviar mensajes
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
