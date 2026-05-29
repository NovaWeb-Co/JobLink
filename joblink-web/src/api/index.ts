import { http } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────
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
  services?: Service[];
  requests?: Request[];
  ratings?: Rating[];
};

export type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string | null;
  availability: boolean;
  imageUrl?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, "id" | "name" | "lastname" | "profilePhoto">;
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
  user?: Pick<User, "id" | "name" | "lastname" | "profilePhoto">;
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

// ─── Auth (pública, sin token) ───────────────────────────────────────────────
export type AuthResponse = {
  access_token: string;
  message?: string;
  user: Omit<User, "password">;
};

export const authApi = {
  register: (dto: {
    name: string; lastname: string; email: string; password: string;
    phone?: string; address?: string;
  }) => http<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(dto) }),

  login: (dto: { identifier: string; password: string }) =>
    http<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(dto) }),
};

// ─── Users (GET /users solo ADMIN, GET /users/:id público) ───────────────────
export const usersApi = {
  list: () => http<User[]>("/users"),
  get: (id: number) => http<User>(`/users/${id}`),
  update: (id: number, dto: Partial<User>) =>
    http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/users/${id}`, { method: "DELETE" }),
};

// ─── Services ────────────────────────────────────────────────────────────────
export const servicesApi = {
  list: () => http<Service[]>("/services"),
  get: (id: number) => http<Service>(`/services/${id}`),
  create: (dto: {
    title: string; description: string; category: string;
    price: number; location?: string; availability?: boolean; userId: number;
  }) => http<Service>("/services", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Service>) =>
    http<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) =>
    http<void>(`/services/${id}`, { method: "DELETE" }),
  removeFromUser: (userId: number, serviceId: number) =>
    http<void>(`/services/${userId}/remove-service/${serviceId}`, { method: "DELETE" }),
};

// ─── Requests (GET y POST requieren token) ────────────────────────────────────
export const requestsApi = {
  list: () => http<Request[]>("/requests"),
  create: (dto: { description?: string; status?: RequestStatus; userId: number; serviceId: number }) =>
    http<Request>("/requests", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Request>) =>
    http<Request>(`/requests/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/requests/${id}`, { method: "DELETE" }),
};

// ─── Ratings (GET y POST requieren token) ─────────────────────────────────────
export const ratingsApi = {
  list: () => http<Rating[]>("/ratings"),
  create: (dto: { score: number; comment?: string; userId: number; serviceId: number }) =>
    http<Rating>("/ratings", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Rating>) =>
    http<Rating>(`/ratings/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/ratings/${id}`, { method: "DELETE" }),
};

// ─── Messages (GET y POST requieren token) ────────────────────────────────────
export const messagesApi = {
  list: () => http<Message[]>("/messages"),
  create: (dto: { content: string; isRead?: boolean; senderId: number; receiverId: number }) =>
    http<Message>("/messages", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Message>) =>
    http<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/messages/${id}`, { method: "DELETE" }),
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function toFullUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}