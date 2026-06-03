import { useState } from "react";
import {
    useUsers,
    useServices,
    useRequests,
    useMessages,
    useRatings,
    useDeleteUser,
    useReactivateUser,
    useUpdateUserRole,
} from "../api/queries";

export default function RootDashboardPage() {
    const { data: users = [] } = useUsers();
    const { data: services = [] } = useServices();
    const { data: requests = [] } = useRequests();
    const { data: messages = [] } = useMessages();
    const { data: ratings = [] } = useRatings();

    const deleteUser = useDeleteUser();
    const reactivateUser = useReactivateUser();
    const updateRole = useUpdateUserRole();

    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((u) =>
        `${u.name} ${u.lastname} ${u.email}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalUsers = users.filter(
        (u) => u.role === "USER"
    ).length;

    const totalAdmins = users.filter(
        (u) => u.role === "ADMIN"
    ).length;

    return (
        <div
            className="layout-main"
            style={{
                padding: "2rem",
            }}
        >
            <h1
                style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                }}
            >
                🛡️ Panel ROOT
            </h1>

            <p
                style={{
                    color: "var(--slate)",
                    marginBottom: "2rem",
                }}
            >
                Control total de JobLink
            </p>

            {/* Estadísticas */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                <StatCard
                    title="Usuarios"
                    value={totalUsers}
                    icon="👥"
                />

                <StatCard
                    title="Administradores"
                    value={totalAdmins}
                    icon="👑"
                />

                <StatCard
                    title="Servicios"
                    value={services.length}
                    icon="🛠️"
                />

                <StatCard
                    title="Solicitudes"
                    value={requests.length}
                    icon="📨"
                />

                <StatCard
                    title="Mensajes"
                    value={messages.length}
                    icon="💬"
                />

                <StatCard
                    title="Calificaciones"
                    value={ratings.length}
                    icon="⭐"
                />
            </div>

            {/* Usuarios */}
            <div className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <h2>👥 Usuarios del sistema</h2>

                    <input
                        className="input"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "300px",
                        }}
                    />
                </div>

                <table className="tbl">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>

                                <td>
                                    {user.name} {user.lastname}
                                </td>

                                <td>{user.email}</td>

                                <td>
                                    {user.role === "ROOT" ? (
                                        <span className="badge badge-red">
                                            ROOT
                                        </span>
                                    ) : (
                                        <select
                                            className="input"
                                            value={user.role}
                                            onChange={(e) => {
                                                console.log("CAMBIANDO ROL");
                                                console.log("ID:", user.id);
                                                console.log("ROL:", e.target.value);

                                                updateRole.mutate({
                                                    id: user.id,
                                                    role: e.target.value as "USER" | "ADMIN",
                                                });
                                            }}
                                            style={{
                                                minWidth: 120,
                                            }}
                                        >
                                            <option value="USER">
                                                USER
                                            </option>

                                            <option value="ADMIN">
                                                ADMIN
                                            </option>
                                        </select>
                                    )}
                                </td>

                                <td>
                                    {user.isActive ? (
                                        <span className="badge badge-green">
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="badge badge-red">
                                            Inactivo
                                        </span>
                                    )}
                                </td>

                                <td>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {!user.isActive && (
                                            <button
                                                className="btn-primary"
                                                onClick={() =>
                                                    reactivateUser.mutate(
                                                        user.id
                                                    )
                                                }
                                            >
                                                ♻️ Reactivar
                                            </button>
                                        )}

                                        {user.role !== "ROOT" && (
                                            <button
                                                className="btn-danger"
                                                onClick={() => {
                                                    if (
                                                        !confirm(
                                                            "¿Desactivar usuario?"
                                                        )
                                                    )
                                                        return;

                                                    deleteUser.mutate(
                                                        user.id
                                                    );
                                                }}
                                            >
                                                🚫 Desactivar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Administradores */}
            <div
                className="card"
                style={{
                    marginTop: "2rem",
                }}
            >
                <h2
                    style={{
                        marginBottom: "1rem",
                    }}
                >
                    👑 Administradores
                </h2>

                <table className="tbl">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users
                            .filter(
                                (u) =>
                                    u.role === "ADMIN"
                            )
                            .map((admin) => (
                                <tr key={admin.id}>
                                    <td>
                                        {admin.name}{" "}
                                        {admin.lastname}
                                    </td>

                                    <td>{admin.email}</td>

                                    <td>
                                        <span className="badge badge-blue">
                                            ADMIN
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: string;
}) {
    return (
        <div
            className="card"
            style={{
                padding: "1.25rem",
            }}
        >
            <div
                style={{
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                }}
            >
                {icon}
            </div>

            <h3
                style={{
                    margin: 0,
                    color: "var(--navy)",
                }}
            >
                {value}
            </h3>

            <p
                style={{
                    margin: 0,
                    color: "var(--slate)",
                }}
            >
                {title}
            </p>
        </div>
    );
}