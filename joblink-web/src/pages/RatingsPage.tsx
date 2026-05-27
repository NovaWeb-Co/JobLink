import { useState } from "react";
import { useCreateRating, useDeleteRating, useUpdateRating, useRatings } from "../api/ratings.queries";

export default function RatingsPage() {
  const { data = [], isLoading, isError, error, refetch } = useRatings();
  const createMut = useCreateRating();
  const updateMut = useUpdateRating();
  const deleteMut = useDeleteRating();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [score, setScore]         = useState("5");
  const [comment, setComment]     = useState("");
  const [userId, setUserId]       = useState("");
  const [serviceId, setServiceId] = useState("");

  function resetForm() {
    setEditingId(null); setScore("5"); setComment(""); setUserId(""); setServiceId("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto = { score: Number(score), comment, userId: Number(userId), serviceId: Number(serviceId) };
    if (editingId !== null) {
      await updateMut.mutateAsync({ id: editingId, dto });
    } else {
      await createMut.mutateAsync(dto);
    }
    resetForm();
  }

  const stars = (n: number) => "⭐".repeat(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ratings</h2>
        <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => refetch()}>
          Reintentar/Refrescar
        </button>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 space-y-3">
        <p className="text-sm text-slate-600">
          <b>Mutation ({editingId !== null ? "PATCH" : "POST"})</b>:{" "}
          {editingId !== null ? "actualiza rating y refresca listado." : "crea rating y luego invalida cache para refrescar listado."}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input type="number" className="w-full rounded-lg border px-3 py-2" value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service ID</label>
            <input type="number" className="w-full rounded-lg border px-3 py-2" value={serviceId} onChange={(e) => setServiceId(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Puntuación (1–5)</label>
            <select className="w-full rounded-lg border px-3 py-2" value={score} onChange={(e) => setScore(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} — {"⭐".repeat(n)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comentario</label>
            <input className="w-full rounded-lg border px-3 py-2" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50" disabled={createMut.isPending || updateMut.isPending}>
            {editingId !== null ? (updateMut.isPending ? "Actualizando..." : "Actualizar") : (createMut.isPending ? "Creando..." : "Crear")}
          </button>
          {editingId !== null && (
            <button type="button" className="rounded-lg border px-4 py-2" onClick={resetForm}>Cancelar</button>
          )}
        </div>
        {createMut.isError && <p className="text-sm text-red-600">Error: {String(createMut.error)}</p>}
        {updateMut.isError && <p className="text-sm text-red-600">Error: {String(updateMut.error)}</p>}
      </form>

      <div className="rounded-xl border bg-white">
        <div className="p-4 border-b">
          {isLoading && <p className="text-sm text-slate-600">Cargando…</p>}
          {isError && <p className="text-sm text-red-600">Error: {String(error)}</p>}
          {!isLoading && !isError && <p className="text-sm text-slate-600">{data.length} registro(s)</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Puntuación</th>
                <th className="p-3">Comentario</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Service ID</th>
                <th className="p-3 w-36">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className={`border-t ${editingId === r.id ? "bg-yellow-50" : ""}`}>
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{stars(r.score)}</td>
                  <td className="p-3">{r.comment ?? "-"}</td>
                  <td className="p-3">{r.userId}</td>
                  <td className="p-3">{r.serviceId}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50"
                        onClick={() => { setEditingId(r.id); setScore(String(r.score)); setComment(r.comment ?? ""); setUserId(String(r.userId)); setServiceId(String(r.serviceId)); }}>
                        Editar
                      </button>
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50 disabled:opacity-50" disabled={deleteMut.isPending}
                        onClick={() => { if (!confirm("¿Borrar esta calificación?")) return; deleteMut.mutate(r.id); }}>
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !isError && data.length === 0 && (
                <tr><td className="p-6 text-center text-slate-500" colSpan={6}>No hay registros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {deleteMut.isError && <div className="p-4"><p className="text-sm text-red-600">Error borrando: {String(deleteMut.error)}</p></div>}
      </div>
    </div>
  );
}
