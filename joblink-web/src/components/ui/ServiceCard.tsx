import type { Service } from "../../api/index";

const CATEGORY_EMOJI: Record<string, string> = {
  "Plomería": "🔧", "Electricidad": "⚡", "Carpintería": "🪚",
  "Pintura": "🎨", "Limpieza": "🧹", "Jardinería": "🌿",
  "Seguridad": "🔒", "Tecnología": "💻", "Transporte": "🚚",
  "Educación": "📚", "Salud": "🩺", "Cocina": "🍳",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Plomería": "#E0F2FE", "Electricidad": "#FEF3C7", "Carpintería": "#FEF9C3",
  "Pintura": "#FCE7F3", "Limpieza": "#E0FCED", "Jardinería": "#DCFCE7",
  "Seguridad": "#EDE9FE", "Tecnología": "#E0E7FF", "Transporte": "#FFF7ED",
};

function getEmoji(cat: string) {
  return CATEGORY_EMOJI[cat] ?? "🛠️";
}
function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#F1F5F9";
}

type Props = {
  service: Service;
  avgScore?: number;
  ratingCount?: number;
  onClick?: () => void;
};

export default function ServiceCard({ service, avgScore, ratingCount, onClick }: Props) {
  return (
    <div className="service-card" onClick={onClick}>
      {/* Header colorido con emoji */}
      <div className="service-card-img" style={{ background: getColor(service.category) }}>
        {getEmoji(service.category)}
      </div>

      <div className="service-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{service.category}</span>
          {service.availability
            ? <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>● Disponible</span>
            : <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>No disponible</span>
          }
        </div>

        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: "6px 0 4px", color: "var(--navy)", lineHeight: 1.3 }}>
          {service.title}
        </h3>

        <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 8px", lineHeight: 1.4, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {service.description}
        </p>

        {service.location && (
          <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: "0 0 8px" }}>📍 {service.location}</p>
        )}

        {avgScore !== undefined && ratingCount !== undefined && ratingCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <span className="stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(Math.round(avgScore))}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--slate)", fontWeight: 600 }}>{avgScore.toFixed(1)}</span>
            <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>({ratingCount})</span>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--navy)" }}>
            ${service.price.toLocaleString()}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>COP / servicio</span>
        </div>
      </div>
    </div>
  );
}
