export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("jl_token");

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 401) {
    const body = await res.text();
    // Intentar parsear el mensaje del backend
    let backendMessage = "";
    try {
      const parsed = JSON.parse(body);
      backendMessage = (parsed.message ?? "").toLowerCase();
    } catch {
      backendMessage = body.toLowerCase();
    }

    // Caso específico: cuenta desactivada — NO cerrar sesión
    if (backendMessage.includes("desactivada") || backendMessage.includes("desactivado")) {
      throw new Error(JSON.stringify({
        type: "ACCOUNT_DISABLED",
        message: "Tu cuenta está desactivada. Comunícate con el administrador para reactivarla.",
      }));
    }

    // Cualquier otro 401: token expirado o inválido — cerrar sesión
    localStorage.removeItem("jl_token");
    localStorage.removeItem("jl_user");
    window.dispatchEvent(new Event("jl:logout"));
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}