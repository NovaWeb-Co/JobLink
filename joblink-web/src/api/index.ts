import { http } from "./http";

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = {
  id: number; name: string; lastname: string; email: string;
  password?: string; phone?: string | null; address?: string | null;
  profilePhoto?: string | null; isActive: boolean; createdAt: string;
  services?: Service[]; ratings?: Rating[];
};

export type Service = {
  id: number; title: string; description: string; category: string;
  price: number; location?: string | null; availability: boolean;
  userId: number; createdAt: string; user?: User; ratings?: Rating[];
};

export type RequestStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED";
export type Request = {
  id: number; description?: string | null; status: RequestStatus;
  userId: number; serviceId: number; createdAt: string;
  user?: User; service?: Service;
};

export type Rating = {
  id: number; score: number; comment?: string | null;
  userId: number; serviceId: number; createdAt: string; user?: User;
};

export type Message = {
  id: number; content: string; isRead: boolean;
  senderId: number; receiverId: number; createdAt: string;
  sender?: User; receiver?: User;
};

// ─── APIs ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => http<User[]>("/users"),
  get: (id: number) => http<User>(`/users/${id}`),
  create: (dto: Omit<User, "id"|"isActive"|"createdAt">) =>
    http<User>("/users", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<User>) =>
    http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/users/${id}`, { method: "DELETE" }),
};

export const servicesApi = {
  list: () => http<Service[]>("/services"),
  get: (id: number) => http<Service>(`/services/${id}`),
  create: (dto: Omit<Service, "id"|"createdAt">) =>
    http<Service>("/services", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Service>) =>
    http<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/services/${id}`, { method: "DELETE" }),
};

export const requestsApi = {
  list: () => http<Request[]>("/requests"),
  create: (dto: { description?: string; status?: RequestStatus; userId: number; serviceId: number }) =>
    http<Request>("/requests", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Request>) =>
    http<Request>(`/requests/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/requests/${id}`, { method: "DELETE" }),
};

export const ratingsApi = {
  list: () => http<Rating[]>("/ratings"),
  create: (dto: { score: number; comment?: string; userId: number; serviceId: number }) =>
    http<Rating>("/ratings", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Rating>) =>
    http<Rating>(`/ratings/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/ratings/${id}`, { method: "DELETE" }),
};

export const messagesApi = {
  list: () => http<Message[]>("/messages"),
  create: (dto: { content: string; isRead?: boolean; senderId: number; receiverId: number }) =>
    http<Message>("/messages", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<Message>) =>
    http<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/messages/${id}`, { method: "DELETE" }),
};
