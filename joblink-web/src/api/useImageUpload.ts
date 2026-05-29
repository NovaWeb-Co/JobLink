import { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Hook para foto de perfil: POST /users/upload-photo
// Recibe updateProfile del AuthContext para actualizar la foto en el contexto
export function useProfilePhotoUpload(
    updateProfile: (fields: { profilePhoto: string }) => void
) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    function openPicker() { inputRef.current?.click(); }

    async function uploadFile(file: File): Promise<string | null> {
        setUploading(true);
        setError(null);
        try {
            const token = localStorage.getItem("jl_token");
            if (!token) { setError("Debes iniciar sesión."); return null; }
            if (file.size > 5 * 1024 * 1024) { setError("Máximo 5MB."); return null; }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_URL}/users/upload-photo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                // ⚠️ NO incluir Content-Type aquí
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text() || `Error ${res.status}`);

            const data = await res.json();
            // data.imageUrl = "/uploads/filename" → URL completa
            const fullUrl = `${API_URL}${data.imageUrl}`;

            // Actualizar el contexto y localStorage con la nueva foto
            updateProfile({ profilePhoto: fullUrl });

            return fullUrl;
        } catch (err) {
            setError(String(err).replace("Error: ", ""));
            return null;
        } finally {
            setUploading(false);
        }
    }

    return { uploading, error, inputRef, openPicker, uploadFile };
}

// Hook para foto de servicio: POST /services/:id/upload-image
export function useServiceImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function uploadFile(file: File, serviceId: number): Promise<string | null> {
        setUploading(true);
        setError(null);
        try {
            const token = localStorage.getItem("jl_token");
            if (!token) { setError("Debes iniciar sesión."); return null; }
            if (file.size > 5 * 1024 * 1024) { setError("Máximo 5MB."); return null; }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_URL}/services/${serviceId}/upload-image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text() || `Error ${res.status}`);

            const data = await res.json();
            return `${API_URL}${data.imageUrl}`;
        } catch (err) {
            setError(String(err).replace("Error: ", ""));
            return null;
        } finally {
            setUploading(false);
        }
    }

    return { uploading, error, uploadFile };
}
