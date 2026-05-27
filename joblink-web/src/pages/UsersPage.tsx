import { useState } from "react";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../api/users.queries";

export default function UsersPage() {
  const { data = [], isLoading, isError, error, refetch } = useUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName]               = useState("");
  const [lastname, setLastname]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [phone, setPhone]             = useState("");
  const [address, setAddress]         = useState("");

  function resetForm() {
    setEditingId(null); setName(""); setLastname("");
    setEmail(""); setPassword(""); setPhone(""); setAddress("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId !== null) {
      await updateMut.mutateAsync({ id: editingId, dto: { name, lastname, email, phone, address } });
    } else {
      await createMut.mutateAsync({ name, lastname, email, password, phone, address });
    }
    resetForm();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => refetch()}>
          Reintentar/Refrescar
        </button>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 space-y-3">
        <p className="text-sm text-slate-600">
          <b>Mutation ({editingId !== null ? "PATCH" : "POST"})</b>:{" "}
          {editingId !== null ? "actualiza user y refresca listado." : "crea user y luego invalida cache para refrescar listado."}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input className="w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input className="w-full rounded-lg border px-3 py-2" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {editingId === null && (
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input type="password" className="w-full rounded-lg border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input className="w-full rounded-lg border px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input className="w-full rounded-lg border px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} />
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
                <th className="p-3">Nombre</th>
                <th className="p-3">Apellido</th>
                <th className="p-3">Email</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Dirección</th>
                <th className="p-3 w-36">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className={`border-t ${editingId === u.id ? "bg-yellow-50" : ""}`}>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.lastname}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone ?? "-"}</td>
                  <td className="p-3">{u.address ?? "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50"
                        onClick={() => { setEditingId(u.id); setName(u.name); setLastname(u.lastname); setEmail(u.email); setPhone(u.phone ?? ""); setAddress(u.address ?? ""); }}>
                        Editar
                      </button>
                      <button className="rounded-md border px-2 py-1 hover:bg-slate-50 disabled:opacity-50" disabled={deleteMut.isPending}
                        onClick={() => { if (!confirm("¿Borrar este usuario?")) return; deleteMut.mutate(u.id); }}>
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
