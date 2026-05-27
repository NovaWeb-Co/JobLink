import { http } from "./http";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  profilePhoto?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string | null;
  availability: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  ratings?: Rating[];
  requests?: Request[];
};

export type RequestStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED";

export type Request = {
  id: number;
  description?: string | null;
  status: RequestStatus;
  userId: number;
  serviceId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  service?: Service;
};

export type Rating = {
  id: number;
  score: number;
  comment?: string | null;
  userId: number;
  serviceId: number;
  createdAt: string;
  user?: User;
};

export type Message = {
  id: number;
  content: string;
  isRead: boolean;
  senderId: number;
  receiverId: number;
  createdAt: string;
  sender?: User;
  receiver?: User;
};

// ─── Auth API (públicas, sin token) ───────────────────────────────────────────

export type AuthResponse = {
  access_token: string;
  message?: string;
  user: Omit<User, "password">;
};

export const authApi = {
  register: (dto: {
    name: string; lastname: string; email: string; password: string;
    phone?: string; address?: string; profilePhoto?: string;
  }) => http<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(dto) }),

  login: (dto: { identifier: string; password: string }) =>
    http<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(dto) }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
// GET /users       → solo ADMIN (con token + rol)
// GET /users/:id   → público
// PATCH /users/:id → con token
// DELETE /users/:id → solo ADMIN

export const usersApi = {
  list: () => http<User[]>("/users"),                           // ADMIN only
  get: (id: number) => http<User>(`/users/${id}`),             // público
  update: (id: number, dto: Partial<User>) =>
    http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/users/${id}`, { method: "DELETE" }), // ADMIN only
};

// ─── Services API ─────────────────────────────────────────────────────────────
// GET /services         → público
// POST /services        → con token
// GET /services/:id     → público
// PATCH /services/:id   → público (sin guard según el controller)
// DELETE /services/:id  → solo ADMIN

export const servicesApi = {
  list: () => http<Service[]>("/services"),
  get: (id: number) => http<Service>(`/services/${id}`),
  create: (dto: {
    title: string; description: string; category: string;
    price: number; location?: string; availability?: boolean; userId: number;
  }) => http<Service>("/services", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Service>) =>
    http<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/services/${id}`, { method: "DELETE" }), // ADMIN only
  removeFromUser: (userId: number, serviceId: number) =>
    http<void>(`/services/${userId}/remove-service/${serviceId}`, { method: "DELETE" }),
};

// ─── Requests API ─────────────────────────────────────────────────────────────
// GET /requests     → con token
// POST /requests    → con token
// GET /requests/:id → público
// PATCH /requests/:id → público
// DELETE /requests/:id → público

export const requestsApi = {
  list: () => http<Request[]>("/requests"),
  get: (id: number) => http<Request>(`/requests/${id}`),
  create: (dto: { description?: string; status?: RequestStatus; userId: number; serviceId: number }) =>
    http<Request>("/requests", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Request>) =>
    http<Request>(`/requests/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/requests/${id}`, { method: "DELETE" }),
};

// ─── Ratings API ──────────────────────────────────────────────────────────────
// GET /ratings     → con token
// POST /ratings    → con token
// GET /ratings/:id → público
// PATCH /ratings/:id → público
// DELETE /ratings/:id → solo ADMIN

export const ratingsApi = {
  list: () => http<Rating[]>("/ratings"),
  get: (id: number) => http<Rating>(`/ratings/${id}`),
  create: (dto: { score: number; comment?: string; userId: number; serviceId: number }) =>
    http<Rating>("/ratings", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Rating>) =>
    http<Rating>(`/ratings/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/ratings/${id}`, { method: "DELETE" }), // ADMIN only
};

// ─── Messages API ─────────────────────────────────────────────────────────────
// GET /messages     → con token
// POST /messages    → con token
// GET /messages/:id → público
// PATCH /messages/:id → público
// DELETE /messages/:id → público

export const messagesApi = {
  list: () => http<Message[]>("/messages"),
  get: (id: number) => http<Message>(`/messages/${id}`),
  create: (dto: { content: string; isRead?: boolean; senderId: number; receiverId: number }) =>
    http<Message>("/messages", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Message>) =>
    http<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/messages/${id}`, { method: "DELETE" }),
};
