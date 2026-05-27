import { useState } from "react";
import { useCreateMessage, useDeleteMessage, useUpdateMessage, useMessages } from "../api/messages.queries";

export default function MessagesPage() {
  const { data = [], isLoading, isError, error, refetch } = useMessages();
  const createMut = useCreateMessage();
  const updateMut = useUpdateMessage();
  const deleteMut = useDeleteMessage();

  const [editingId, setEditingId]   = useState<number | null>(null);
  const [content, setContent]       = useState("");
  const [isRead, setIsRead]         = useState(false);
  const [senderId, setSenderId]     = useState("");
  const [receiverId, setReceiverId] = useState("");

  function resetForm() {
    setEditingId(null); setContent(""); setIsRead(false);
    setSenderId(""); setReceiverId("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto = { content, isRead, senderId: Number(senderId), receiverId: Number(receiverId) };
    if (editingId !== null) {
      await updateMut.mutateAsync({ id: editingId, dto });
    } else {
      await createMut.mutateAsync(dto);
    }
    resetForm();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => refetch()}>
          Reintentar/Refrescar
        </button>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 space-y-3">
        <p className="text-sm text-slate-600">
          <b>Mutation ({editingId !== null ? "PATCH" : "POST"})</b>:{" "}
          {editingId !== null ? "actualiza message y refresca listado." : "crea message y luego invalida cache para refrescar listado."}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Sender ID</label>
            <input type="number" className="w-full rounded-lg border px-3 py-2" value={senderId} onChange={(e) => setSenderId(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Receiver ID</label>
            <input type="number" className="w-full rounded-lg border px-3 py-2" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Contenido</label>
            <input className="w-full rounded-lg border px-3 py-2" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRead" checked={isRead} onChange={(e) => setIsRead(e.target.checked)} />
            <label htmlFor="isRead" className="text-sm font-medium">Leído</label>
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
                <th className="p-3">Contenido</th>
                <th className="p-3">Leído</th>
                <th className="p-3">Sender ID</th>
                <th className="p-3">Receiver ID</th>
                <th className="p-3 w-36">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className={`border-t ${editingId === m.id ? "bg-yellow-50" : ""}`}>
                  <td className="p-3">{m.id}</td>
                  <td className="p-3 max-w-xs truncate">{m.content}</td>
                  <td className="p-3">{m.isRead ? "✅" : "❌"}</td>
                  <td className="p-3">{m.senderId}</td>
                  <td className="p-3">{m.receiverId}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50"
                        onClick={() => { setEditingId(m.id); setContent(m.content); setIsRead(m.isRead); setSenderId(String(m.senderId)); setReceiverId(String(m.receiverId)); }}>
                        Editar
                      </button>
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50 disabled:opacity-50" disabled={deleteMut.isPending}
                        onClick={() => { if (!confirm("¿Borrar este mensaje?")) return; deleteMut.mutate(m.id); }}>
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
