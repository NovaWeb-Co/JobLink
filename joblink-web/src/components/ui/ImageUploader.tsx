import { useRef } from "react";

type Props = {
    currentUrl?: string | null;
    onUploaded: (file: File) => void;
    uploading?: boolean;
    shape?: "circle" | "rect";
    size?: number;
    placeholder?: string;
    error?: string | null;
};

export default function ImageUploader({
    currentUrl,
    onUploaded,
    uploading = false,
    shape = "circle",
    size = 88,
    placeholder = "Subir foto",
    error = null,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        onUploaded(file);
        e.target.value = "";
    }

    const borderRadius = shape === "circle" ? "50%" : 12;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6
            }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleChange}
                disabled={uploading}
                aria-label="Subir imagen"
            />

            <div
                onClick={() => !uploading && inputRef.current?.click()}
                style={{
                    width: size, height: size, borderRadius,
                    cursor: uploading ? "wait" : "pointer",
                    overflow: "hidden", position: "relative",
                    border: `2px dashed ${uploading ? "var(--gold)" : "#CBD5E1"}`,
                    background: "var(--slate-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold)"; }}
                onMouseLeave={e => { if (!uploading) (e.currentTarget as HTMLDivElement).style.borderColor = "#CBD5E1"; }}
            >
                {/* Foto actual */}
                {currentUrl && !uploading && (
                    <>
                        <img src={currentUrl} alt="foto"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        {/* Overlay cámara al hover */}
                        <div style={{
                            position: "absolute", inset: 0, borderRadius,
                            background: "rgba(0,0,0,0)", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s",
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.45)";
                                const icon = e.currentTarget.querySelector("span") as HTMLElement;
                                if (icon) icon.style.opacity = "1";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)";
                                const icon = e.currentTarget.querySelector("span") as HTMLElement;
                                if (icon) icon.style.opacity = "0";
                            }}
                        >
                            <span style={{ fontSize: "1.5rem", opacity: 0, transition: "opacity 0.15s", color: "white" }}>📷</span>
                        </div>
                    </>
                )}

                {/* Sin foto */}
                {!currentUrl && !uploading && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px", textAlign: "center" }}>
                        <span style={{ fontSize: size > 60 ? "1.75rem" : "1.1rem" }}>📷</span>
                        {size > 60 && <span style={{ fontSize: "0.65rem", color: "var(--slate)", lineHeight: 1.3 }}>{placeholder}</span>}
                    </div>
                )}

                {/* Spinner */}
                {uploading && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius,
                        background: "rgba(255,255,255,0.9)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                        <div className="spinner" />
                        <span style={{ fontSize: "0.65rem", color: "var(--slate)" }}>Subiendo...</span>
                    </div>
                )}
            </div>

            <button type="button" className="btn-ghost"
                onClick={() => !uploading && inputRef.current?.click()}
                disabled={uploading}
                style={{ fontSize: "0.78rem", padding: "4px 10px", color: uploading ? "var(--slate)" : "#1565C0" }}
            >
                {uploading ? "Subiendo..." : currentUrl ? "Cambiar foto" : placeholder}
            </button>

            {error && (
                <p style={{ fontSize: "0.72rem", color: "var(--danger)", margin: 0, textAlign: "center", maxWidth: size + 40 }}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
}
