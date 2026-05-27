import type { Service } from "../../api/index";

const CATEGORY_EMOJI: Record<string, string> = {
  "Plomería": "🔧", "Electricidad": "⚡", "Carpintería": "🪚", "Pintura": "🎨",
  "Limpieza": "🧹", "Jardinería": "🌿", "Tecnología": "💻", "Transporte": "🚚",
  "Salud": "🩺", "Educación": "📚",
};
const CAT_BG: Record<string, string> = {
  "Plomería": "#E0F2FE", "Electricidad": "#FEF3C7", "Carpintería": "#FEF9C3",
  "Pintura": "#FCE7F3", "Limpieza": "#DCFCE7", "Jardinería": "#DCFCE7",
  "Tecnología": "#E0E7FF", "Transporte": "#FFF7ED", "Salud": "#F0FDF4", "Educación": "#EFF6FF",
};

function extractImageUrl(description: string) {
  const match = description.match(/\[img:(.*?)\]/);
  return match ? match[1] : null;
}
function cleanDescription(description: string) {
  return description.replace(/\[img:.*?\]\s*/g, "").trim();
}

type Props = {
  service: Service;
  avgScore?: number;
  ratingCount?: number;
  onClick?: () => void;
};

export default function ServiceCard({ service, avgScore, ratingCount, onClick }: Props) {
  const imgUrl = extractImageUrl(service.description);
  const cleanDesc = cleanDescription(service.description);

  return (
    <div className="service-card" onClick={onClick}>
      {/* Imagen: real si hay URL, emoji si no */}
      {imgUrl ? (
        <div style={{ height: 140, overflow: "hidden" }}>
          <img
            src={imgUrl}
            alt={service.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
            onError={e => {
              const parent = (e.target as HTMLImageElement).parentElement!;
              parent.style.background = CAT_BG[service.category] ?? "#F1F5F9";
              parent.style.display = "flex";
              parent.style.alignItems = "center";
              parent.style.justifyContent = "center";
              parent.innerHTML = `<span style="font-size:2.5rem">${CATEGORY_EMOJI[service.category] ?? "🛠️"}</span>`;
            }}
          />
        </div>
      ) : (
        <div className="service-card-img" style={{ background: CAT_BG[service.category] ?? "#F1F5F9" }}>
          <span style={{ fontSize: "2.5rem" }}>{CATEGORY_EMOJI[service.category] ?? "🛠️"}</span>
        </div>
      )}

      <div className="service-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{service.category}</span>
          {service.availability
            ? <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>● Disponible</span>
            : <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>No disponible</span>}
        </div>

        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", margin: "6px 0 4px", color: "var(--navy)", lineHeight: 1.3 }}>
          {service.title}
        </h3>

        <p style={{ fontSize: "0.78rem", color: "var(--slate)", margin: "0 0 8px", lineHeight: 1.4, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {cleanDesc}
        </p>

        {/* Proveedor */}
        {service.user && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            {service.user.profilePhoto ? (
              <img src={service.user.profilePhoto} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 800, color: "var(--navy)", flexShrink: 0 }}>
                {service.user.name[0]}{service.user.lastname[0]}
              </div>
            )}
            <span style={{ fontSize: "0.72rem", color: "var(--slate)" }}>
              {service.user.name} {service.user.lastname}
            </span>
          </div>
        )}

        {service.location && (
          <p style={{ fontSize: "0.72rem", color: "#94A3B8", margin: "0 0 6px" }}>📍 {service.location}</p>
        )}

        {avgScore !== undefined && ratingCount !== undefined && ratingCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <span className="stars" style={{ fontSize: "0.85rem" }}>{"★".repeat(Math.round(avgScore))}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--slate)", fontWeight: 600 }}>{avgScore.toFixed(1)}</span>
            <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>({ratingCount})</span>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--navy)" }}>
            ${service.price.toLocaleString()}
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--slate)" }}>COP / servicio</span>
        </div>
      </div>
    </div>
  );
}
