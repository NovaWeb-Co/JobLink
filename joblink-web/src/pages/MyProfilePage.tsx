import { useState } from "react";
import {
  useServices, useRequests, useMessages,
  useCreateService, useUpdateService, useDeleteService,
  useCreateMessage, useRatings, useUpdateUser,
} from "../api/queries";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", ACCEPTED: "Aceptado", COMPLETED: "Completado", CANCELED: "Cancelado"
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-amber", ACCEPTED: "badge-blue", COMPLETED: "badge-green", CANCELED: "badge-red"
};
const CATS = ["Plomería", "Electricidad", "Carpintería", "Pintura", "Limpieza", "Jardinería", "Tecnología", "Transporte"];
const CAT_EMOJI: Record<string, string> = {
  "Plomería": "🔧", "Electricidad": "⚡", "Carpintería": "🪚", "Pintura": "🎨",
  "Limpieza": "🧹", "Jardinería": "🌿", "Tecnología": "💻", "Transporte": "🚚",
};
const CAT_BG: Record<string, string> = {
  "Plomería": "#E0F2FE", "Electricidad": "#FEF3C7", "Carpintería": "#FEF9C3",
  "Pintura": "#FCE7F3", "Limpieza": "#DCFCE7", "Jardinería": "#DCFCE7",
  "Tecnología": "#E0E7FF", "Transporte": "#FFF7ED",
};

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
  const updateUser = useUpdateUser();

  const [tab, setTab] = useState<"services" | "requests" | "messages" | "profile">("profile");

  // ── Formulario de edición de perfil ──────────────────────────────────────
  const [editProfile, setEditProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── Formulario de servicio ────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [avail, setAvail] = useState(true);
  const [imageUrl, setImageUrl] = useState(""); // URL de imagen — se guarda en description como [img:URL]

  // ── Formulario de mensaje ─────────────────────────────────────────────────
  const [msgTo, setMsgTo] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgDone, setMsgDone] = useState(false);

  if (!user) return null;

  const myServices = services.filter(s => s.userId === user.id);
  const myRequests = requests.filter(r => r.userId === user.id);
  const myMessages = messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
  const myRatings = ratings.filter(r => myServices.some(s => s.id === r.serviceId));
  const avgScore = myRatings.length ? myRatings.reduce((a, r) => a + r.score, 0) / myRatings.length : null;

  function resetForm() {
    setEditingId(null); setTitle(""); setDesc(""); setCategory(CATS[0]);
    setPrice(""); setLocation(""); setAvail(true); setImageUrl(""); setShowForm(false);
  }

  // Extrae URL de imagen del description si fue guardada con el patrón [img:URL]
  function extractImageUrl(description: string) {
    const match = description.match(/\[img:(.*?)\]/);
    return match ? match[1] : null;
  }
  function cleanDescription(description: string) {
    return description.replace(/\[img:.*?\]\s*/g, "").trim();
  }
  // Construye description con URL embebida
  function buildDescription(desc: string, imgUrl: string) {
    return imgUrl.trim() ? `[img:${imgUrl.trim()}] ${desc}` : desc;
  }

  async function onSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    await updateUser.mutateAsync({
      id: user.id,
      dto: {
        profilePhoto: profilePhoto || undefined,
        phone: phone || undefined,
        address: address || undefined,
      }
    });
    setSavingProfile(false);
    setProfileSaved(true);
    setEditProfile(false);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  async function onSubmitService(e: React.FormEvent) {
    e.preventDefault();
    const fullDesc = buildDescription(desc, imageUrl);
    const dto = { title, description: fullDesc, category, price: Number(price), location, availability: avail, userId: user.id };
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

      {/* ─── HEADER DEL PERFIL ──────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem", overflow: "hidden" }}>
        {/* Banner */}
        <div style={{ height: 100, background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)" }} />
        <div style={{ padding: "0 1.75rem 1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
            <div style={{ marginTop: -48 }}>
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--gold)", border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--navy)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  {user.name[0]}{user.lastname[0]}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {avgScore !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--navy)", lineHeight: 1 }}>{avgScore.toFixed(1)}</div>
                  <div className="stars" style={{ fontSize: "0.9rem" }}>{"★".repeat(Math.round(avgScore))}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--slate)" }}>{myRatings.length} reseñas</div>
                </div>
              )}
              <button className="btn-secondary" onClick={() => { setEditProfile(!editProfile); setTab("profile"); }}>
                ✏️ Editar perfil
              </button>
            </div>
          </div>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", margin: "0 0 4px" }}>
            {user.name} {user.lastname}
          </h1>
          <p style={{ color: "var(--slate)", margin: "0 0 8px", fontSize: "0.875rem" }}>{user.email}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className={`badge ${user.role === "ADMIN" ? "badge-blue" : "badge-green"}`}>
              {user.role === "ADMIN" ? "👑 Administrador" : "👤 Usuario"}
            </span>
            {user.address && <span className="badge badge-gray">📍 {user.address}</span>}
            {user.phone && <span className="badge badge-gray">📱 {user.phone}</span>}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { val: myServices.length, lbl: "Servicios" },
              { val: myRequests.length, lbl: "Solicitudes" },
              { val: myMessages.length, lbl: "Mensajes" },
              { val: myRatings.length, lbl: "Reseñas" },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 10, padding: "0.5rem 1rem" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: 0, fontSize: "1.1rem", color: "var(--navy)" }}>{s.val}</p>
                <p style={{ fontSize: "0.65rem", color: "var(--slate)", margin: 0 }}>{s.lbl}</p>
              </div>
            ))}
          </div>

          {/* Formulario de edición de perfil */}
          {editProfile && (
            <form onSubmit={onSubmitProfile} style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", margin: 0 }}>Editar información</h3>
              {profileSaved && <div className="alert alert-success">✅ Perfil actualizado.</div>}
              <div>
                <label className="label">Foto de perfil (URL de imagen)</label>
                <input
                  className="input"
                  value={profilePhoto}
                  onChange={e => setProfilePhoto(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                />
                <p style={{ fontSize: "0.72rem", color: "var(--slate)", marginTop: 4 }}>
                  💡 Sube tu foto a <a href="https://imgur.com" target="_blank" rel="noreferrer" style={{ color: "#1565C0" }}>imgur.com</a> o Google Fotos y pega el enlace directo.
                </p>
                {profilePhoto && (
                  <div style={{ marginTop: 8 }}>
                    <img src={profilePhoto} alt="preview" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #E2E8F0" }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567" />
                </div>
                <div>
                  <label className="label">Dirección / Zona de trabajo</label>
                  <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Bogotá, Kennedy" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn-primary" disabled={savingProfile}>
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditProfile(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ─── TABS ───────────────────────────────────────────────────────── */}
      <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
        <button className={`tab-btn ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>🔧 Mis servicios</button>
        <button className={`tab-btn ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>📋 Solicitudes</button>
        <button className={`tab-btn ${tab === "messages" ? "active" : ""}`} onClick={() => setTab("messages")}>💬 Mensajes</button>
      </div>

      {/* ─── TAB SERVICIOS ──────────────────────────────────────────────── */}
      {tab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Publicar servicio</button>
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
                    <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Ej: Instalaciones eléctricas residenciales" required />
                  </div>
                  <div>
                    <label className="label">Categoría</label>
                    <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Precio (COP)</label>
                    <input type="number" min="0" className="input" value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="Ej: 80000" required />
                    <p style={{ fontSize: "0.7rem", color: "var(--slate)", marginTop: 2 }}>💡 Precio por servicio o por hora</p>
                  </div>
                  <div>
                    <label className="label">Zona de trabajo</label>
                    <input className="input" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="Ej: Bogotá, Kennedy y Bosa" />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="label">Descripción</label>
                    <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                      placeholder="Describe tu servicio con detalle. ¿Qué incluye? ¿Cuánto demora? ¿Qué herramientas usas? Ej: Instalación completa de tomas, interruptores y tableros eléctricos. Incluye materiales. Garantía 6 meses."
                      style={{ minHeight: 90, resize: "vertical" }} required />
                    <p style={{ fontSize: "0.7rem", color: "var(--slate)", marginTop: 2 }}>💡 Una buena descripción genera más confianza y más contratos</p>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="label">Foto del servicio (URL de imagen)</label>
                    <input className="input" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://ejemplo.com/mi-trabajo.jpg" />
                    <p style={{ fontSize: "0.7rem", color: "var(--slate)", marginTop: 2 }}>
                      💡 Sube una foto de tu trabajo a <a href="https://imgur.com" target="_blank" rel="noreferrer" style={{ color: "#1565C0" }}>imgur.com</a> y pega el enlace.
                    </p>
                    {imageUrl && (
                      <img src={imageUrl} alt="preview" style={{ marginTop: 8, width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 10, border: "1px solid #E2E8F0" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                  <input type="checkbox" checked={avail} onChange={e => setAvail(e.target.checked)} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
                  Disponible para contratación inmediata
                </label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="submit" className="btn-primary" disabled={createSvc.isPending || updateSvc.isPending}>
                    {editingId ? "Guardar cambios" : "Publicar servicio"}
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
            <div className="services-grid">
              {myServices.map(s => {
                const imgUrl = extractImageUrl(s.description);
                const cleanDesc = cleanDescription(s.description);
                const sRatings = ratings.filter(r => r.serviceId === s.id);
                const avg = sRatings.length ? sRatings.reduce((a, r) => a + r.score, 0) / sRatings.length : null;
                return (
                  <div key={s.id} className="service-card">
                    {/* Imagen real o emoji */}
                    {imgUrl ? (
                      <div style={{ height: 140, overflow: "hidden" }}>
                        <img src={imgUrl} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => {
                            const parent = (e.target as HTMLImageElement).parentElement!;
                            parent.style.background = CAT_BG[s.category] ?? "#F1F5F9";
                            parent.innerHTML = `<span style="font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%">${CAT_EMOJI[s.category] ?? "🛠️"}</span>`;
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
                      <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {cleanDesc}
                      </p>
                      {avg !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                          <span className="stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(Math.round(avg))}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>({sRatings.length})</span>
                        </div>
                      )}
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: "auto 0 0", color: "var(--navy)", fontSize: "1rem" }}>
                        ${s.price.toLocaleString()} <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, fontSize: "0.7rem", color: "var(--slate)" }}>COP</span>
                      </p>
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        <button className="btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 10px", flex: 1 }}
                          onClick={() => {
                            const imgU = extractImageUrl(s.description);
                            const cleanD = cleanDescription(s.description);
                            setEditingId(s.id); setTitle(s.title); setDesc(cleanD);
                            setCategory(s.category); setPrice(String(s.price));
                            setLocation(s.location ?? ""); setAvail(s.availability);
                            setImageUrl(imgU ?? ""); setShowForm(true);
                          }}>
                          ✏️ Editar
                        </button>
                        <button className="btn-danger" style={{ flex: 1 }}
                          onClick={() => { if (!confirm("¿Eliminar servicio?")) return; deleteSvc.mutate(s.id); }}>
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB SOLICITUDES ────────────────────────────────────────────── */}
      {tab === "requests" && (
        myRequests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <p>No tienes solicitudes aún.</p>
            <p style={{ fontSize: "0.85rem" }}>Ve al catálogo, encuentra un servicio y solicítalo.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr><th>Servicio</th><th>Descripción</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {myRequests.map(r => {
                  const svc = r.service;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{svc ? svc.title : `#${r.serviceId}`}</td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--slate)", fontSize: "0.85rem" }}>
                        {r.description ?? "-"}
                      </td>
                      <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span></td>
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

      {/* ─── TAB MENSAJES ───────────────────────────────────────────────── */}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myMessages.map(m => {
                const other = m.senderId === user.id ? m.receiver : m.sender;
                const isMine = m.senderId === user.id;
                return (
                  <div key={m.id} className="card" style={{ padding: "1rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: isMine ? "var(--gold)" : "var(--slate-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: isMine ? "var(--navy)" : "var(--slate)", flexShrink: 0 }}>
                      {other ? `${other.name[0]}${other.lastname[0]}` : "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                            {other ? `${other.name} ${other.lastname}` : "Usuario"}
                          </span>
                          <span className={`badge ${isMine ? "badge-blue" : "badge-teal"}`} style={{ fontSize: "0.65rem" }}>
                            {isMine ? "↑ Enviado" : "↓ Recibido"}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>
                          {new Date(m.createdAt).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0 }}>{m.content}</p>
                    </div>
                    <span>{m.isRead ? <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>Leído</span> : <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>No leído</span>}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
