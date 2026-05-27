import { useState } from "react";
import { useServices, useUsers, useRatings } from "../api/queries";
import ServiceCard from "../components/ui/ServiceCard";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { id: "Plomería",     emoji: "🔧", label: "Plomería"     },
  { id: "Electricidad", emoji: "⚡", label: "Electricidad" },
  { id: "Carpintería",  emoji: "🪚", label: "Carpintería"  },
  { id: "Pintura",      emoji: "🎨", label: "Pintura"      },
  { id: "Limpieza",     emoji: "🧹", label: "Limpieza"     },
  { id: "Jardinería",   emoji: "🌿", label: "Jardinería"   },
  { id: "Tecnología",   emoji: "💻", label: "Tecnología"   },
  { id: "Transporte",   emoji: "🚚", label: "Transporte"   },
];

const STATS = [
  { label: "Proveedores", value: "500+", icon: "👷" },
  { label: "Servicios activos", value: "1.200+", icon: "🛠️" },
  { label: "Solicitudes completadas", value: "8.000+", icon: "✅" },
  { label: "Ciudades", value: "12", icon: "📍" },
];

type Props = { onGoToServices: (cat?: string) => void; onServiceClick: (id: number) => void; };

export default function HomePage({ onGoToServices, onServiceClick }: Props) {
  const { data: services = [] } = useServices();
  const { data: ratings = [] } = useRatings();
  const { requireAuth, setShowLoginModal } = useAuth();
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onGoToServices(search || undefined);
  }

  // Featured: top 6 available services
  const featured = services.filter(s => s.availability).slice(0, 6);

  // avg score per service
  const avgByService: Record<number, { avg: number; count: number }> = {};
  ratings.forEach(r => {
    if (!avgByService[r.serviceId]) avgByService[r.serviceId] = { avg: 0, count: 0 };
    const cur = avgByService[r.serviceId];
    cur.avg = (cur.avg * cur.count + r.score) / (cur.count + 1);
    cur.count++;
  });

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" style={{ padding: "4rem 0 3rem" }}>
        <div className="layout-main">
          <div style={{ maxWidth: 640, position: "relative", zIndex: 1 }}>
            <div className="badge badge-gold" style={{ marginBottom: "1rem" }}>🇨🇴 La plataforma de servicios N°1</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "white", lineHeight: 1.1, margin: "0 0 1rem" }}>
              Encuentra el experto<br /><span style={{ color: "var(--gold)" }}>que necesitas hoy</span>
            </h1>
            <p style={{ fontSize: "1.05rem", color: "#94A3B8", marginBottom: "2rem", lineHeight: 1.6 }}>
              Plomeros, electricistas, carpinteros y más — todos verificados y cerca de ti.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, maxWidth: 540 }}>
              <input
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="¿Qué servicio necesitas?"
                style={{ flex: 1, background: "rgba(255,255,255,0.95)", fontSize: "0.95rem", padding: "0.875rem 1rem" }}
              />
              <button type="submit" className="btn-primary" style={{ padding: "0.875rem 1.5rem", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                🔍 Buscar
              </button>
            </form>

            <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "0.75rem" }}>
              Popular: <span style={{ color: "#94A3B8" }}>Plomería · Electricidad · Limpieza · Carpintería</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--navy-mid)", padding: "1.5rem 0" }}>
        <div className="layout-main" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.75rem" }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--gold)", margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: "0.72rem", color: "#64748B", margin: 0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="layout-main" style={{ padding: "2.5rem 1.25rem" }}>
        {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
        <section style={{ marginBottom: "3rem" }}>
          <p className="section-title">Explora por categoría</p>
          <p className="section-sub">Encuentra exactamente lo que necesitas</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className="cat-chip" onClick={() => onGoToServices(cat.id)}>
                <span>{cat.emoji}</span>
                <p>{cat.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ─── FEATURED SERVICES ────────────────────────────────────────── */}
        <section style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
            <div>
              <p className="section-title">Servicios destacados</p>
              <p className="section-sub" style={{ margin: 0 }}>Profesionales con las mejores calificaciones</p>
            </div>
            <button className="btn-ghost" onClick={() => onGoToServices()} style={{ color: "var(--navy)", fontWeight: 600 }}>
              Ver todos →
            </button>
          </div>

          {featured.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔧</div>
              <p>Aún no hay servicios publicados.</p>
              <button className="btn-primary" onClick={() => requireAuth(() => {})}>Publica el primero</button>
            </div>
          ) : (
            <div className="services-grid">
              {featured.map(s => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  avgScore={avgByService[s.id]?.avg}
                  ratingCount={avgByService[s.id]?.count}
                  onClick={() => onServiceClick(s.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
        <section style={{ background: "var(--navy)", borderRadius: 20, padding: "2.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", color: "white", fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
              ¿Eres un profesional independiente?
            </h2>
            <p style={{ color: "#64748B", margin: 0, fontSize: "0.9rem" }}>
              Publica tus servicios gratis y llega a miles de clientes cerca de ti.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
            onClick={() => requireAuth(() => {})}
          >
            Empezar gratis →
          </button>
        </section>
      </div>
    </div>
  );
}
