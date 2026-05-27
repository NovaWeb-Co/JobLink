import { useState } from "react";
import { useServices, useRequests, useMessages, useCreateService, useUpdateService, useDeleteService, useCreateMessage, useRatings } from "../api/queries";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", ACCEPTED: "Aceptado", COMPLETED: "Completado", CANCELED: "Cancelado"
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-amber", ACCEPTED: "badge-blue", COMPLETED: "badge-green", CANCELED: "badge-red"
};
const CATS = ["Plomería", "Electricidad", "Carpintería", "Pintura", "Limpieza", "Jardinería", "Tecnología", "Transporte"];

export default function MyProfilePage() {
  const { user } = useAuth();
  const { data: services = [] } = useServices();
  const { data: requests = [] } = useRequests();
  const { data: messages = [] } = useMessages();
  const { data: ratings = [] } = useRatings();
  const createSvc = useCreateService();
  const updateSvc = useUpdateService();
  const deleteSvc = useDeleteService();
  const createMsg = useCreateMessage();

  const [tab, setTab] = useState<"services" | "requests" | "messages">("services");

  // Formulario de servicio
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [avail, setAvail] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Formulario de mensaje
  const [msgTo, setMsgTo] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgDone, setMsgDone] = useState(false);

  if (!user) return null;

  const myServices = services.filter(s => s.userId === user.id);
  const myRequests = requests.filter(r => r.userId === user.id);
  const myMessages = messages.filter(m => m.senderId === user.id || m.receiverId === user.id);

  function resetForm() {
    setEditingId(null); setTitle(""); setDesc(""); setCategory(CATS[0]);
    setPrice(""); setLocation(""); setAvail(true); setShowForm(false);
  }

  async function onSubmitService(e: React.FormEvent) {
    e.preventDefault();
    const dto = { title, description: desc, category, price: Number(price), location, availability: avail, userId: user.id };
    if (editingId !== null) await updateSvc.mutateAsync({ id: editingId, dto });
    else await createSvc.mutateAsync(dto);
    resetForm();
  }

  async function onSendMessage(e: React.FormEvent) {
    e.preventDefault();
    await createMsg.mutateAsync({ content: msgContent, senderId: user.id, receiverId: Number(msgTo) });
    setMsgContent(""); setMsgTo(""); setMsgDone(true);
    setTimeout(() => setMsgDone(false), 3000);
  }

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      {/* Header del perfil */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--navy)", flexShrink: 0 }}>
            {user.name[0]}{user.lastname[0]}
          </div>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", margin: "0 0 4px" }}>
              {user.name} {user.lastname}
            </h1>
            <p style={{ color: "var(--slate)", margin: 0, fontSize: "0.875rem" }}>{user.email}</p>
            <span className={`badge ${user.role === "ADMIN" ? "badge-blue" : "badge-green"}`} style={{ marginTop: 6, display: "inline-block" }}>
              {user.role === "ADMIN" ? "👑 Administrador" : "👤 Usuario"}
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            <div style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 10, padding: "0.6rem 1rem" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: 0, fontSize: "1.25rem" }}>{myServices.length}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--slate)", margin: 0 }}>Servicios</p>
            </div>
            <div style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 10, padding: "0.6rem 1rem" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: 0, fontSize: "1.25rem" }}>{myRequests.length}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--slate)", margin: 0 }}>Solicitudes</p>
            </div>
            <div style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 10, padding: "0.6rem 1rem" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: 0, fontSize: "1.25rem" }}>{myMessages.length}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--slate)", margin: 0 }}>Mensajes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
        <button className={`tab-btn ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>🔧 Mis servicios</button>
        <button className={`tab-btn ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>📋 Mis solicitudes</button>
        <button className={`tab-btn ${tab === "messages" ? "active" : ""}`} onClick={() => setTab("messages")}>💬 Mensajes</button>
      </div>

      {/* ─── TAB SERVICIOS ─────────────────────────────────────────────────── */}
      {tab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              + Publicar servicio
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", marginBottom: "1.25rem" }}>
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </h3>
              <form onSubmit={onSubmitService} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="label">Título</label>
                    <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Plomería residencial" required />
                  </div>
                  <div>
                    <label className="label">Categoría</label>
                    <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Precio (COP)</label>
                    <input type="number" min="0" className="input" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej: 80000" required />
                  </div>
                  <div>
                    <label className="label">Ubicación</label>
                    <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Bogotá, Kennedy" />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="label">Descripción</label>
                    <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                      placeholder="Describe tu servicio con detalle. Ej: Reparación de tuberías, filtraciones y mantenimiento preventivo."
                      style={{ minHeight: 80, resize: "vertical" }} required />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                  <input type="checkbox" checked={avail} onChange={e => setAvail(e.target.checked)} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
                  Disponible para contratación
                </label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="submit" className="btn-primary" disabled={createSvc.isPending || updateSvc.isPending}>
                    {editingId ? "Guardar cambios" : "Publicar"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {myServices.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔧</div>
              <p>No has publicado servicios aún.</p>
              <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>Publicar mi primer servicio</button>
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="tbl">
                <thead>
                  <tr><th>Servicio</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {myServices.map(s => (
                    <tr key={s.id}>
                      <td><strong style={{ fontSize: "0.875rem" }}>{s.title}</strong></td>
                      <td><span className="badge badge-gold">{s.category}</span></td>
                      <td style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>${s.price.toLocaleString()}</td>
                      <td>{s.availability ? <span className="badge badge-green">Disponible</span> : <span className="badge badge-gray">No disponible</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                            onClick={() => {
                              setEditingId(s.id); setTitle(s.title); setDesc(s.description);
                              setCategory(s.category); setPrice(String(s.price));
                              setLocation(s.location ?? ""); setAvail(s.availability); setShowForm(true);
                            }}>
                            ✏️ Editar
                          </button>
                          <button className="btn-danger"
                            onClick={() => { if (!confirm("¿Eliminar servicio?")) return; deleteSvc.mutate(s.id); }}>
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB SOLICITUDES ───────────────────────────────────────────────── */}
      {tab === "requests" && (
        myRequests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <p>No tienes solicitudes aún.</p>
            <p style={{ fontSize: "0.85rem" }}>Ve al catálogo y solicita un servicio.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr><th>Servicio</th><th>Descripción</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {myRequests.map(r => {
                  // El servicio viene incluido en el request (include: { service: true })
                  const svc = r.service;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{svc ? svc.title : `Servicio #${r.serviceId}`}</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description ?? "-"}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                        {new Date(r.createdAt).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ─── TAB MENSAJES ──────────────────────────────────────────────────── */}
      {tab === "messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", marginBottom: "1rem" }}>Enviar mensaje</h3>
            {msgDone && <div className="alert alert-success">✅ Mensaje enviado.</div>}
            <form onSubmit={onSendMessage} style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
              <div>
                <label className="label">ID del destinatario</label>
                <input type="number" className="input" value={msgTo} onChange={e => setMsgTo(e.target.value)} placeholder="Ej: 2" required />
              </div>
              <div>
                <label className="label">Mensaje</label>
                <input className="input" value={msgContent} onChange={e => setMsgContent(e.target.value)} placeholder="Escribe tu mensaje..." required />
              </div>
              <button type="submit" className="btn-primary" disabled={createMsg.isPending}>
                {createMsg.isPending ? "..." : "Enviar"}
              </button>
            </form>
          </div>

          {myMessages.length === 0 ? (
            <div className="empty"><div className="empty-icon">💬</div><p>No tienes mensajes aún.</p></div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="tbl">
                <thead>
                  <tr><th>Dirección</th><th>Contenido</th><th>Leído</th><th>Fecha</th></tr>
                </thead>
                <tbody>
                  {myMessages.map(m => {
                    // sender y receiver vienen incluidos en el mensaje
                    const other = m.senderId === user.id ? m.receiver : m.sender;
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className={`badge ${m.senderId === user.id ? "badge-blue" : "badge-teal"}`}>
                            {m.senderId === user.id ? "↑ Enviado" : "↓ Recibido"}
                          </span>
                          {other && (
                            <span style={{ marginLeft: 8, fontSize: "0.78rem", color: "var(--slate)" }}>
                              {other.name} {other.lastname}
                            </span>
                          )}
                        </td>
                        <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.content}</td>
                        <td>{m.isRead ? <span className="badge badge-green">Leído</span> : <span className="badge badge-gray">No leído</span>}</td>
                        <td style={{ fontSize: "0.78rem", color: "var(--slate)" }}>{new Date(m.createdAt).toLocaleDateString("es-CO")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
