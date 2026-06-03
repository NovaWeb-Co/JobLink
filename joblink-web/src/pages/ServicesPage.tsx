import { useState, useMemo } from "react";
import { useServices, useRatings } from "../api/queries";
import ServiceCard from "../components/ui/ServiceCard";

const CATEGORIES = ["Todas", "Plomería", "Electricidad", "Carpintería", "Pintura", "Limpieza", "Jardinería", "Tecnología", "Transporte", "Educación", "Salud", "Otros"];
const SORTS = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor calificados" },
];

type Props = { initialCategory?: string; onServiceClick: (id: number) => void; };

export default function ServicesPage({ initialCategory, onServiceClick }: Props) {
  const { data: services = [], isLoading } = useServices();
  const { data: ratings = [] } = useRatings();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "Todas");
  const [sort, setSort] = useState("recent");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // avg score per service
  const avgByService = useMemo(() => {
    const map: Record<number, { avg: number; count: number }> = {};
    ratings.forEach(r => {
      if (!map[r.serviceId]) map[r.serviceId] = { avg: 0, count: 0 };
      const cur = map[r.serviceId];
      cur.avg = (cur.avg * cur.count + r.score) / (cur.count + 1);
      cur.count++;
    });
    return map;
  }, [ratings]);

  const filtered = useMemo(() => {
    let res = [...services];
    if (category !== "Todas") res = res.filter(s => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.location ?? "").toLowerCase().includes(q)
      );
    }
    if (onlyAvailable) res = res.filter(s => s.availability);
    switch (sort) {
      case "price_asc": res.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)); break;
      case "price_desc": res.sort((a, b) => (b.price ?? -1) - (a.price ?? -1)); break;
      case "rating": res.sort((a, b) => (avgByService[b.id]?.avg ?? 0) - (avgByService[a.id]?.avg ?? 0)); break;
      default: res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return res;
  }, [services, category, search, sort, onlyAvailable, avgByService]);

  return (
    <div className="layout-main" style={{ padding: "2rem 1.25rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="section-title">Catálogo de servicios</h1>
        <p className="section-sub">{services.length} profesionales disponibles en tu zona</p>
      </div>

      {/* Search + filters */}
      <div style={{ background: "white", borderRadius: 14, padding: "1.25rem", boxShadow: "var(--card-shadow)", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar servicios, categoría o ciudad..."
          style={{ flex: "1 1 220px", minWidth: 180 }}
        />
        <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: "0 1 170px" }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={sort} onChange={e => setSort(e.target.value)} style={{ flex: "0 1 200px" }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--navy)", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
          Solo disponibles
        </label>
        {(search || category !== "Todas" || onlyAvailable) && (
          <button className="btn-ghost" style={{ color: "var(--danger)", fontSize: "0.8rem" }}
            onClick={() => { setSearch(""); setCategory("Todas"); setOnlyAvailable(false); }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{
              padding: "6px 14px", borderRadius: 99, border: "1.5px solid",
              borderColor: category === c ? "var(--gold)" : "#E2E8F0",
              background: category === c ? "var(--gold-pale)" : "white",
              color: category === c ? "#92400E" : "var(--slate)",
              fontSize: "0.8rem", fontWeight: category === c ? 600 : 400,
              cursor: "pointer", transition: "all 0.12s", fontFamily: "DM Sans, sans-serif",
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={{ fontSize: "0.82rem", color: "var(--slate)", marginBottom: "1rem" }}>
        {isLoading ? "Cargando..." : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <p style={{ fontWeight: 600 }}>No se encontraron servicios</p>
          <p style={{ fontSize: "0.85rem" }}>Intenta con otra categoría o quita los filtros</p>
        </div>
      ) : (
        <div className="services-grid">
          {filtered.map(s => (
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
    </div>
  );
}
