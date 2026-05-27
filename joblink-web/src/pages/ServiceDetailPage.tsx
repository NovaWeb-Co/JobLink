import { useState } from "react";
import { useServices, useUsers, useRatings, useRequests, useCreateRequest, useCreateRating } from "../api/queries";
import { useAuth } from "../context/AuthContext";

const CATEGORY_EMOJI: Record<string, string> = {
  "Plomería": "🔧","Electricidad": "⚡","Carpintería": "🪚","Pintura": "🎨",
  "Limpieza": "🧹","Jardinería": "🌿","Tecnología": "💻","Transporte": "🚚",
};

type Props = { serviceId: number; onBack: () => void; onProviderClick: (id: number) => void; };

export default function ServiceDetailPage({ serviceId, onBack, onProviderClick }: Props) {
  const { data: services = [] } = useServices();
  const { data: users = [] }    = useUsers();
  const { data: ratings = [] }  = useRatings();
  const { data: requests = [] } = useRequests();
  const createReq  = useCreateRequest();
  const createRate = useCreateRating();
  const { user, requireAuth } = useAuth();

  const service = services.find(s => s.id === serviceId);
  const provider = service ? users.find(u => u.id === service.userId) : null;
  const svcRatings = ratings.filter(r => r.serviceId === serviceId);
  const avgScore = svcRatings.length ? svcRatings.reduce((a, r) => a + r.score, 0) / svcRatings.length : 0;

  const [reqDesc, setReqDesc]   = useState("");
  const [reqDone, setReqDone]   = useState(false);
  const [score, setScore]       = useState(5);
  const [comment, setComment]   = useState("");
  const [rateDone, setRateDone] = useState(false);

  if (!service) return (
    <div className="layout-main" style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
      <p>Servicio no encontrado.</p>
      <button className="btn-primary" onClick={onBack}>Volver</button>
    </div>
  );

  async function handleRequest() {
    requireAuth(async () => {
      await createReq.mutateAsync({ description: reqDesc, userId: user!.id, serviceId });
      setReqDone(true);
    });
  }

  async function handleRating() {
    requireAuth(async () => {
      await createRate.mutateAsync({ score, comment, userId: user!.id, serviceId });
      setRateDone(true); setComment("");
    });
  }

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      {/* Breadcrumb */}
      <button onClick={onBack} className="btn-ghost" style={{ marginBottom: "1rem", paddingLeft: 0 }}>
        ← Volver a servicios
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
        {/* ─── LEFT ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Header card */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>
                {CATEGORY_EMOJI[service.category] ?? "🛠️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-gold">{service.category}</span>
                  {service.availability
                    ? <span className="badge badge-green">● Disponible</span>
                    : <span className="badge badge-gray">No disponible</span>
                  }
                </div>
                <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", margin: "0 0 8px", color: "var(--navy)" }}>{service.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {svcRatings.length > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="stars">{"★".repeat(Math.round(avgScore))}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{avgScore.toFixed(1)}</span>
                      <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>({svcRatings.length} reseñas)</span>
                    </span>
                  )}
                  {service.location && <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>📍 {service.location}</span>}
                </div>
              </div>
            </div>
            <p style={{ marginTop: "1.25rem", fontSize: "0.92rem", color: "#475569", lineHeight: 1.7, margin: "1.25rem 0 0" }}>{service.description}</p>
          </div>

          {/* Provider card */}
          {provider && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", margin: "0 0 1rem", color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.78rem" }}>Proveedor del servicio</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onProviderClick(provider.id)}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--navy)", flexShrink: 0 }}>
                  {provider.name[0]}{provider.lastname[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, color: "var(--navy)" }}>{provider.name} {provider.lastname}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--slate)", margin: 0 }}>{provider.email}</p>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--slate)", fontSize: "1.1rem" }}>→</span>
              </div>
            </div>
          )}

          {/* Ratings */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", margin: "0 0 1rem", color: "var(--navy)" }}>
              Reseñas {svcRatings.length > 0 && <span style={{ fontSize: "0.8rem", color: "var(--slate)", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>({svcRatings.length})</span>}
            </h3>

            {svcRatings.length === 0 ? (
              <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Aún no hay reseñas para este servicio.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {svcRatings.map(r => {
                  const reviewer = users.find(u => u.id === r.userId);
                  return (
                    <div key={r.id} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{reviewer ? `${reviewer.name} ${reviewer.lastname}` : "Usuario"}</span>
                        <span className="stars" style={{ fontSize: "0.9rem" }}>{"★".repeat(r.score)}{"☆".repeat(5 - r.score)}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: "0.85rem", color: "#475569", margin: 0 }}>{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add rating */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #F1F5F9" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.75rem" }}>Deja tu calificación</h4>
              {rateDone ? (
                <div className="alert alert-success">✅ ¡Gracias por tu reseña!</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => requireAuth(() => setScore(n))}
                        style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer", transition: "transform 0.1s", color: n <= score ? "var(--gold)" : "#CBD5E1" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                        ★
                      </button>
                    ))}
                  </div>
                  <input className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Cuéntanos tu experiencia (opcional)" />
                  <button className="btn-secondary" onClick={handleRating} disabled={createRate.isPending} style={{ alignSelf: "flex-start" }}>
                    {createRate.isPending ? "Enviando..." : "Publicar reseña"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT — Booking card ──────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Precio del servicio</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--navy)", margin: 0 }}>
                ${service.price.toLocaleString()}
                <span style={{ fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", fontWeight: 400, color: "var(--slate)" }}> COP</span>
              </p>
            </div>

            {reqDone ? (
              <div className="alert alert-success">✅ ¡Solicitud enviada! El proveedor te contactará pronto.</div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Describe tu necesidad</label>
                  <textarea className="input" value={reqDesc} onChange={e => setReqDesc(e.target.value)}
                    placeholder="Ej: Necesito reparar una tubería en el baño..."
                    style={{ minHeight: 90, resize: "vertical" }} />
                </div>
                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }}
                  disabled={createReq.isPending || !service.availability}
                  onClick={handleRequest}
                >
                  {!service.availability ? "No disponible" : createReq.isPending ? "Enviando..." : "✅ Solicitar servicio"}
                </button>
              </>
            )}

            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--slate)" }}>
                <span>🔒</span> Pago 100% seguro
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--slate)" }}>
                <span>📞</span> Respuesta en menos de 2h
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--slate)" }}>
                <span>⭐</span> Satisfacción garantizada
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
