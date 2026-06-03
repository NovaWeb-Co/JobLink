import { useState } from "react";
import {
  useUsers, useDeleteUser,
  useServices, useDeleteService, useUpdateService,
  useRequests, useUpdateRequest, useDeleteRequest,
  useRatings, useDeleteRating,
  useMessages, useDeleteMessage,
} from "../api/queries";
import { useAuth } from "../context/AuthContext";
import type { RequestStatus } from "../api/index";

const STATUS_OPTIONS: RequestStatus[] = ["PENDING", "ACCEPTED", "COMPLETED", "CANCELED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", ACCEPTED: "Aceptado",
  COMPLETED: "Completado", CANCELED: "Cancelado",
};

// Modal de confirmación para eliminaciones críticas
function ConfirmModal({
  title, message, onConfirm, onCancel, danger = true,
}: {
  title: string; message: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: danger ? "#FEF2F2" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
            {danger ? "⚠️" : "ℹ️"}
          </div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", margin: 0, color: "var(--navy)" }}>{title}</h3>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--slate)", margin: "0 0 1.5rem", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              background: danger ? "var(--danger)" : "#1565C0",
              color: "white", border: "none", padding: "8px 16px",
              borderRadius: 8, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
              fontWeight: 600, fontSize: "0.875rem",
            }}
          >
            {danger ? "Sí, eliminar" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user: adminUser, logout } = useAuth();
  const [tab, setTab] = useState<"users" | "services" | "requests" | "ratings" | "messages">("users");

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState<{
    title: string; message: string; onConfirm: () => void;
  } | null>(null);

  const { data: allUsers = [], isLoading: loadU } = useUsers();
  const { data: services = [], isLoading: loadS } = useServices();
  const { data: requests = [], isLoading: loadR } = useRequests();
  const { data: ratings = [], isLoading: loadRa } = useRatings();
  const { data: messages = [], isLoading: loadM } = useMessages();

  const deleteUser = useDeleteUser();
  const deleteService = useDeleteService();
  const updateService = useUpdateService();
  const updateRequest = useUpdateRequest();
  const deleteRequest = useDeleteRequest();
  const deleteRating = useDeleteRating();
  const deleteMessage = useDeleteMessage();

  // ── REGLA: ocultar el admin de la lista de usuarios ──────────────────────
  const users = allUsers.filter(u => u.role !== "ADMIN");

  // ── Helper: eliminar usuario + sus servicios en cascada ──────────────────
  async function handleDeleteUser(userId: number) {
    // 1. Eliminar todos los servicios del usuario
    const userServices = services.filter(s => s.userId === userId);
    for (const svc of userServices) {
      await deleteService.mutateAsync(svc.id);
    }
    // 2. Eliminar el usuario
    await deleteUser.mutateAsync(userId);
  }

  function confirmDeleteUser(userId: number, userName: string) {
    const userServices = services.filter(s => s.userId === userId);
    const serviceCount = userServices.length;

    setConfirmModal({
      title: "Eliminar usuario",
      message: `¿Estás seguro de eliminar a ${userName}?${serviceCount > 0
        ? ` Esto también eliminará sus ${serviceCount} servicio${serviceCount > 1 ? "s" : ""} asociado${serviceCount > 1 ? "s" : ""}.`
        : ""
        } Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmModal(null);
        await handleDeleteUser(userId);
      },
    });
  }

  function confirmDeleteService(serviceId: number, title: string) {
    setConfirmModal({
      title: "Eliminar servicio",
      message: `¿Eliminar el servicio "${title}"? Esta acción no se puede deshacer.`,
      onConfirm: () => { setConfirmModal(null); deleteService.mutate(serviceId); },
    });
  }

  function confirmDeleteOther(label: string, onConfirm: () => void) {
    setConfirmModal({
      title: `Eliminar ${label}`,
      message: `¿Estás seguro de eliminar este ${label}? Esta acción no se puede deshacer.`,
      onConfirm: () => { setConfirmModal(null); onConfirm(); },
    });
  }

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="section-title">Panel de administración</h1>
        <p className="section-sub">Gestión completa de todas las entidades</p>
      </div>

      {/* Stats — excluye el admin del conteo de usuarios */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Usuarios", count: users.length, icon: "👤", color: "#EFF6FF", border: "#BFDBFE" },
          { label: "Servicios", count: services.length, icon: "🔧", color: "#FEF3C7", border: "#FDE68A" },
          { label: "Solicitudes", count: requests.length, icon: "📋", color: "#ECFDF5", border: "#A7F3D0" },
          { label: "Reseñas", count: ratings.length, icon: "⭐", color: "#FFF7ED", border: "#FED7AA" },
          { label: "Mensajes", count: messages.length, icon: "💬", color: "#F5F3FF", border: "#DDD6FE" },
        ].map(s => (
          <div key={s.label} style={{ background: s.color, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: "0.875rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", margin: "0 0 4px" }}>{s.icon}</p>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", margin: 0, color: "var(--navy)" }}>{s.count}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--slate)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "1.25rem" }}>
        <button className={`tab-btn ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>👤 Usuarios</button>
        <button className={`tab-btn ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>🔧 Servicios</button>
        <button className={`tab-btn ${tab === "ratings" ? "active" : ""}`} onClick={() => setTab("ratings")}>⭐ Reseñas</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>

        {/* ── USUARIOS ── */}
        {tab === "users" && (
          loadU ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Email</th>
                  <th>Teléfono</th><th>Dirección</th><th>Rol</th><th>Servicios</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const userServiceCount = services.filter(s => s.userId === u.id).length;
                  return (
                    <tr key={u.id}>
                      <td style={{ color: "var(--slate)", fontSize: "0.8rem" }}>#{u.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "var(--navy)", flexShrink: 0 }}>
                            {u.name[0]}{u.lastname[0]}
                          </div>
                          <strong style={{ fontSize: "0.875rem" }}>{u.name} {u.lastname}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{u.email}</td>
                      <td>{u.phone ?? "-"}</td>
                      <td>{u.address ?? "-"}</td>
                      <td>
                        <span className={`badge ${u.role === "ADMIN" ? "badge-blue" : "badge-green"}`}>
                          {u.role === "ADMIN" ? "👑 Admin" : "👤 Usuario"}
                        </span>
                      </td>
                      <td>
                        {userServiceCount > 0 ? (
                          <span className="badge badge-amber">{userServiceCount} servicio{userServiceCount > 1 ? "s" : ""}</span>
                        ) : (
                          <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>
                      <td>
                        {/* REGLA: el admin no puede eliminarse a sí mismo */}
                        {u.id === adminUser?.id ? (
                          <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontStyle: "italic" }}>
                            Tu cuenta
                          </span>
                        ) : (
                          <button
                            className="btn-danger"
                            disabled={deleteUser.isPending || deleteService.isPending}
                            onClick={() => confirmDeleteUser(u.id, `${u.name} ${u.lastname}`)}
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}

        {/* ── SERVICIOS ── */}
        {tab === "services" && (
          loadS ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Título</th><th>Categoría</th>
                  <th>Precio</th><th>Ubicación</th><th>Disponible</th><th>Proveedor</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => {
                  const owner = allUsers.find(u => u.id === s.userId);
                  return (
                    <tr key={s.id}>
                      <td style={{ color: "var(--slate)", fontSize: "0.8rem" }}>#{s.id}</td>
                      <td><strong style={{ fontSize: "0.875rem" }}>{s.title}</strong></td>
                      <td><span className="badge badge-gold">{s.category}</span></td>
                      <td style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>${Number(s.price ?? 0).toLocaleString()}</td>
                      <td>{s.location ?? "-"}</td>
                      <td>
                        {/* Toggle disponibilidad */}
                        <button
                          title={s.availability ? "Marcar como no disponible" : "Marcar como disponible"}
                          onClick={() => updateService.mutateAsync({ id: s.id, dto: { availability: !s.availability } })}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                        >
                          {s.availability ? "✅" : "❌"}
                        </button>
                      </td>
                      <td>
                        {owner ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>
                            {owner.name} {owner.lastname}
                          </span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>#{s.userId}</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          disabled={deleteService.isPending}
                          onClick={() => confirmDeleteService(s.id, s.title)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                      No hay servicios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}

        {/* ── RESEÑAS ── */}
        {tab === "ratings" && (
          loadRa ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Puntuación</th><th>Comentario</th>
                  <th>Usuario</th><th>Servicio</th><th>Fecha</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(r => {
                  const owner = allUsers.find(u => u.id === r.userId);
                  const svc = services.find(s => s.id === r.serviceId);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: "var(--slate)", fontSize: "0.8rem" }}>#{r.id}</td>
                      <td>
                        <span className="stars" style={{ fontSize: "0.9rem" }}>
                          {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.comment ?? "-"}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        {owner ? `${owner.name} ${owner.lastname}` : `#${r.userId}`}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        {svc ? svc.title : `#${r.serviceId}`}
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                        {new Date(r.createdAt).toLocaleDateString("es-CO")}
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => confirmDeleteOther("reseña", () => deleteRating.mutate(r.id))}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {ratings.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                      No hay reseñas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}

        {/* ── MENSAJES ── */}
        {tab === "messages" && (
          loadM ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Contenido</th><th>Leído</th>
                  <th>Remitente</th><th>Destinatario</th><th>Fecha</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(m => {
                  const sender = allUsers.find(u => u.id === m.senderId);
                  const receiver = allUsers.find(u => u.id === m.receiverId);
                  return (
                    <tr key={m.id}>
                      <td style={{ color: "var(--slate)", fontSize: "0.8rem" }}>#{m.id}</td>
                      <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.content}
                      </td>
                      <td>
                        {m.isRead
                          ? <span className="badge badge-green">Leído</span>
                          : <span className="badge badge-gray">No leído</span>}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        {sender ? `${sender.name} ${sender.lastname}` : `#${m.senderId}`}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        {receiver ? `${receiver.name} ${receiver.lastname}` : `#${m.receiverId}`}
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                        {new Date(m.createdAt).toLocaleDateString("es-CO")}
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => confirmDeleteOther("mensaje", () => deleteMessage.mutate(m.id))}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--slate)" }}>
                      No hay mensajes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}