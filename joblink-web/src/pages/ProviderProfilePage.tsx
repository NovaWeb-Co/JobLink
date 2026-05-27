import { useUsers, useServices, useRatings } from "../api/queries";

type Props = { userId: number; onBack: () => void; onServiceClick: (id: number) => void; };

export default function ProviderProfilePage({ userId, onBack, onServiceClick }: Props) {
  const { data: users = [] }    = useUsers();
  const { data: services = [] } = useServices();
  const { data: ratings = [] }  = useRatings();

  const provider = users.find(u => u.id === userId);
  const providerServices = services.filter(s => s.userId === userId);
  const allRatings = ratings.filter(r => providerServices.some(s => s.id === r.serviceId));
  const avgScore = allRatings.length ? allRatings.reduce((a, r) => a + r.score, 0) / allRatings.length : 0;

  if (!provider) return (
    <div className="layout-main" style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
      <p>Proveedor no encontrado.</p>
      <button className="btn-primary" onClick={onBack}>Volver</button>
    </div>
  );

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      <button onClick={onBack} className="btn-ghost" style={{ marginBottom: "1rem", paddingLeft: 0 }}>← Volver</button>

      {/* Profile header */}
      <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--navy)", flexShrink: 0 }}>
            {provider.name[0]}{provider.lastname[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", margin: "0 0 4px" }}>
              {provider.name} {provider.lastname}
            </h1>
            <p style={{ color: "var(--slate)", margin: "0 0 8px", fontSize: "0.875rem" }}>{provider.email}</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {provider.phone    && <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>📞 {provider.phone}</span>}
              {provider.address  && <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>📍 {provider.address}</span>}
              {allRatings.length > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                  <span className="stars" style={{ fontSize: "0.9rem" }}>★</span>
                  <strong>{avgScore.toFixed(1)}</strong>
                  <span style={{ color: "var(--slate)" }}>({allRatings.length} reseñas)</span>
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 12, padding: "0.75rem 1.25rem" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", margin: 0, color: "var(--navy)" }}>{providerServices.length}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Servicios</p>
            </div>
            <div style={{ textAlign: "center", background: "var(--slate-light)", borderRadius: 12, padding: "0.75rem 1.25rem" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", margin: 0, color: "var(--navy)" }}>{allRatings.length}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Reseñas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", marginBottom: "1rem" }}>
        Servicios ofrecidos
      </h2>
      {providerServices.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔧</div><p>No tiene servicios publicados aún.</p></div>
      ) : (
        <div className="services-grid">
          {providerServices.map(s => {
            const sRatings = ratings.filter(r => r.serviceId === s.id);
            const avg = sRatings.length ? sRatings.reduce((a, r) => a + r.score, 0) / sRatings.length : undefined;
            return (
              <div key={s.id} className="service-card" onClick={() => onServiceClick(s.id)}
                style={{ cursor: "pointer" }}>
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{s.category}</span>
                    {s.availability ? <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>● Disponible</span> : <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>No disponible</span>}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: "6px 0 4px" }}>{s.title}</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 8px" }}>{s.description.slice(0, 80)}...</p>
                  {avg !== undefined && <span className="stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(Math.round(avg))}</span>}
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, margin: "8px 0 0", color: "var(--navy)" }}>${s.price.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
