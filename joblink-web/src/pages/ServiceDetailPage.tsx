import { useState } from "react";
import { useServices, useRatings, useRequests, useCreateRequest, useCreateRating, useUpdateRequest, useCreateMessage } from "../api/queries";
import { useAuth } from "../context/AuthContext";
import { toFullUrl } from "../api";

const CATEGORY_EMOJI: Record<string, string> = {
  "Plomería": "🔧", "Electricidad": "⚡", "Carpintería": "🪚", "Pintura": "🎨",
  "Limpieza": "🧹", "Jardinería": "🌿", "Tecnología": "💻", "Transporte": "🚚", "Salud": "🩺", "Educación": "📚", "Otros": "📦"
};
const CAT_BG: Record<string, string> = {
  "Plomería": "#E0F2FE", "Electricidad": "#FEF3C7", "Carpintería": "#FEF9C3",
  "Pintura": "#FCE7F3", "Limpieza": "#DCFCE7", "Jardinería": "#DCFCE7",
  "Tecnología": "#E0E7FF", "Transporte": "#FFF7ED", "Salud": "#F0FDF4", "Educación": "#EFF6FF", "Otros": "#F1F5F9"
};

type Props = { serviceId: number; onBack: () => void; onProviderClick: (id: number) => void; };

export default function ServiceDetailPage({ serviceId, onBack, onProviderClick }: Props) {
  const { data: services = [] } = useServices();
  const { data: ratings = [] } = useRatings();
  const { data: requests = [] } = useRequests();
  const createReq = useCreateRequest();
  const createRate = useCreateRating();
  const updateReq = useUpdateRequest();
  const createMsg = useCreateMessage();
  const { user, requireAuth } = useAuth();

  const service = services.find(s => s.id === serviceId);
  const provider = service?.user ?? null;
  const svcRatings = ratings.filter(r => r.serviceId === serviceId);
  const avgScore = svcRatings.length ? svcRatings.reduce((a, r) => a + r.score, 0) / svcRatings.length : 0;
  const imgUrl = toFullUrl(service?.imageUrl);
  const cleanDesc = service?.description ?? "";

  // Solicitud activa del usuario sobre este servicio
  const myRequest = user
    ? requests.find(r => r.serviceId === serviceId && r.userId === user.id)
    : null;

  // Es el proveedor de este servicio?
  const isProvider = user && service ? user.id === service.userId : false;

  const [reqDesc, setReqDesc] = useState("");
  const [reqDone, setReqDone] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [rateDone, setRateDone] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [msgDone, setMsgDone] = useState(false);

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

  async function handleSendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!service) return;
    requireAuth(async () => {
      await createMsg.mutateAsync({ content: msgContent, senderId: user!.id, receiverId: service.userId });
      setMsgDone(true); setMsgContent("");
    });
  }

  function changeStatus(requestId: number, newStatus: string) {
    updateReq.mutate({ id: requestId, dto: { status: newStatus as any } });
  }

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      <button onClick={onBack} className="btn-ghost" style={{ marginBottom: "1rem", paddingLeft: 0 }}>
        ← Volver a servicios
      </button>

      <div className="detail-grid">
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Header */}
          <div className="card" style={{ overflow: "hidden" }}>
            {imgUrl ? (
              <div style={{ height: 260, overflow: "hidden" }}>
                <img src={imgUrl} alt={service.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => {
                    const p = (e.target as HTMLImageElement).parentElement!;
                    p.style.background = CAT_BG[service.category] ?? "#F1F5F9";
                    p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center";
                    p.innerHTML = `<span style="font-size:4rem">${CATEGORY_EMOJI[service.category] ?? "🛠️"}</span>`;
                  }} />
              </div>
            ) : (
              <div style={{ height: 180, background: CAT_BG[service.category] ?? "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {CATEGORY_EMOJI[service.category] ?? "🛠️"}
              </div>
            )}

            <div style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span className="badge badge-gold">{service.category}</span>
                {service.availability
                  ? <span className="badge badge-green">● Disponible</span>
                  : <span className="badge badge-gray">No disponible</span>}
                {service.price == null && (
                  <span className="badge badge-teal">💬 Precio negociable</span>
                )}
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", margin: "0 0 8px", color: "var(--navy)" }}>
                {service.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: "1rem" }}>
                {svcRatings.length > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="stars">{"★".repeat(Math.round(avgScore))}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{avgScore.toFixed(1)}</span>
                    <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>({svcRatings.length} reseñas)</span>
                  </span>
                )}
                {service.location && (
                  <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>📍 {service.location}</span>
                )}
              </div>
              <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{cleanDesc}</p>
            </div>
          </div>

          {/* Proveedor */}
          {provider && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.875rem" }}>
                Proveedor del servicio
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onProviderClick(service.userId)}>
                {provider.profilePhoto ? (
                  <img src={toFullUrl(provider.profilePhoto) ?? ""} alt={provider.name}
                    style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--navy)", flexShrink: 0 }}>
                    {provider.name[0]}{provider.lastname[0]}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: "0 0 2px", color: "var(--navy)" }}>{provider.name} {provider.lastname}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--slate)", margin: 0 }}>Ver perfil y más servicios →</p>
                </div>
              </div>

              {/* Enviar mensaje al proveedor */}
              {user && !isProvider && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #F1F5F9" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--navy)", margin: "0 0 8px" }}>
                    💬 Enviar mensaje a {provider.name}
                  </p>
                  {msgDone ? (
                    <div className="alert alert-success">✅ Mensaje enviado.</div>
                  ) : (
                    <form onSubmit={handleSendMsg} style={{ display: "flex", gap: "0.75rem" }}>
                      <input className="input" value={msgContent} onChange={e => setMsgContent(e.target.value)}
                        placeholder={`Hola ${provider.name}, me interesa tu servicio...`} required style={{ flex: 1 }} />
                      <button type="submit" className="btn-secondary" disabled={createMsg.isPending}>
                        {createMsg.isPending ? "..." : "Enviar"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Estado de MI solicitud (cliente) */}
          {myRequest && !isProvider && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.875rem" }}>
                Tu solicitud activa
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <span className={`badge status-${myRequest.status}`} style={{ display: "inline-block", marginBottom: 6 }}>
                    {myRequest.status === "PENDING" && "⏳ Pendiente de respuesta"}
                    {myRequest.status === "ACCEPTED" && "✅ Aceptado por el proveedor"}
                    {myRequest.status === "COMPLETED" && "🏁 Servicio completado"}
                    {myRequest.status === "CANCELED" && "❌ Cancelado"}
                  </span>
                  {myRequest.description && (
                    <p style={{ fontSize: "0.82rem", color: "var(--slate)", margin: 0 }}>"{myRequest.description}"</p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {myRequest.status === "ACCEPTED" && (
                    <button className="btn-primary" style={{ fontSize: "0.8rem" }}
                      disabled={updateReq.isPending}
                      onClick={() => changeStatus(myRequest.id, "COMPLETED")}>
                      🏁 Marcar como completado
                    </button>
                  )}
                  {(myRequest.status === "PENDING" || myRequest.status === "ACCEPTED") && (
                    <button className="btn-danger" style={{ fontSize: "0.8rem" }}
                      disabled={updateReq.isPending}
                      onClick={() => { if (!confirm("¿Cancelar esta solicitud?")) return; changeStatus(myRequest.id, "CANCELED"); }}>
                      ✕ Cancelar
                    </button>
                  )}
                </div>
              </div>

              {/* Guía de transiciones */}
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--slate-light)", borderRadius: 10 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--navy)", margin: "0 0 6px" }}>¿Quién puede cambiar el estado?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, fontSize: "0.72rem", color: "var(--slate)" }}>
                  <span>⏳ → Aceptar: <b>Proveedor</b></span>
                  <span>⏳ / ✅ → Cancelar: <b>Tú o el proveedor</b></span>
                  <span>✅ → Completar: <b>Tú o el proveedor</b></span>
                </div>
              </div>
            </div>
          )}

          {/* Reseñas */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", margin: "0 0 1rem", color: "var(--navy)" }}>
              Reseñas
              {svcRatings.length > 0 && (
                <span style={{ fontSize: "0.8rem", color: "var(--slate)", fontFamily: "DM Sans, sans-serif", fontWeight: 400, marginLeft: 6 }}>
                  ({svcRatings.length})
                </span>
              )}
            </h3>
            {svcRatings.length === 0 ? (
              <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Sé el primero en dejar una reseña.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                {svcRatings.map(r => {
                  const reviewer = r.user;
                  return (
                    <div key={r.id} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--slate-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--slate)", flexShrink: 0 }}>
                            {reviewer ? `${reviewer.name[0]}${reviewer.lastname[0]}` : "?"}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {reviewer ? `${reviewer.name} ${reviewer.lastname}` : "Usuario"}
                          </span>
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
            )}
            <div style={{ paddingTop: "1.25rem", borderTop: "1px solid #F1F5F9" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.75rem" }}>Deja tu calificación</h4>
              {rateDone ? (
                <div className="alert alert-success">✅ ¡Gracias por tu reseña!</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => requireAuth(() => setScore(n))}
                        style={{ fontSize: "1.75rem", background: "none", border: "none", cursor: "pointer", color: n <= score ? "var(--gold)" : "#CBD5E1", transition: "transform 0.1s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>★</button>
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

        {/* COLUMNA DERECHA */}
        <div className="detail-sticky">
          <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Precio del servicio
            </p>

            {service.price != null ? (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--navy)", margin: 0 }}>
                  ${service.price.toLocaleString()}
                  <span style={{ fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", fontWeight: 400, color: "var(--slate)" }}> COP</span>
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: "4px 0 0" }}>Precio fijo</p>
              </div>
            ) : (
              <div style={{ marginBottom: "1.25rem", padding: "0.875rem", background: "#E0F7FA", borderRadius: 10 }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#006064", margin: 0 }}>
                  💬 Precio negociable
                </p>
                <p style={{ fontSize: "0.75rem", color: "#00838F", margin: "4px 0 0" }}>
                  El proveedor definirá el precio según tu necesidad.
                </p>
              </div>
            )}

            {/* Bloque de acción según contexto */}
            {isProvider ? (
              <div style={{ padding: "1rem", background: "var(--slate-light)", borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--slate)", margin: 0 }}>Este es tu servicio.</p>
                <p style={{ fontSize: "0.75rem", color: "var(--slate)", margin: "4px 0 0" }}>Gestiona las solicitudes desde tu perfil.</p>
              </div>
            ) : myRequest ? (
              <div>
                <div style={{ padding: "1rem", background: "var(--slate-light)", borderRadius: 10, textAlign: "center", marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 6px" }}>Estado de tu solicitud</p>
                  <span className={`badge status-${myRequest.status}`}>
                    {myRequest.status === "PENDING" && "⏳ Esperando respuesta"}
                    {myRequest.status === "ACCEPTED" && "✅ Aceptada"}
                    {myRequest.status === "COMPLETED" && "🏁 Completada"}
                    {myRequest.status === "CANCELED" && "❌ Cancelada"}
                  </span>
                </div>
                {myRequest.status === "ACCEPTED" && (
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}
                    disabled={updateReq.isPending}
                    onClick={() => changeStatus(myRequest.id, "COMPLETED")}>
                    🏁 Marcar como completado
                  </button>
                )}
                {(myRequest.status === "PENDING" || myRequest.status === "ACCEPTED") && (
                  <button className="btn-danger" style={{ width: "100%", justifyContent: "center" }}
                    disabled={updateReq.isPending}
                    onClick={() => { if (!confirm("¿Cancelar esta solicitud?")) return; changeStatus(myRequest.id, "CANCELED"); }}>
                    ✕ Cancelar solicitud
                  </button>
                )}
              </div>
            ) : reqDone ? (
              <div className="alert alert-success">✅ ¡Solicitud enviada! El proveedor te contactará pronto.</div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Describe tu necesidad</label>
                  <textarea className="input" value={reqDesc} onChange={e => setReqDesc(e.target.value)}
                    placeholder="Ej: Necesito reparar una tubería en el baño. Urgencia: esta semana. Horario: mañanas."
                    style={{ minHeight: 90, resize: "vertical" }} />
                  <p style={{ fontSize: "0.7rem", color: "var(--slate)", marginTop: 4 }}>
                    💡 Incluye detalles, urgencia y horario disponible
                  </p>
                </div>
                <button className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }}
                  disabled={createReq.isPending || !service.availability}
                  onClick={handleRequest}>
                  {!service.availability ? "No disponible actualmente" : createReq.isPending ? "Enviando..." : "✅ Solicitar servicio"}
                </button>
              </>
            )}

            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
              {[["🔒", "Pago 100% seguro"], ["📞", "Respuesta en menos de 2h"], ["⭐", "Satisfacción garantizada"],
              ["📍", service.location ?? "Disponible en tu zona"]].map(([icon, txt]) => (
                <div key={txt as string} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--slate)" }}>
                  <span>{icon}</span> {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
