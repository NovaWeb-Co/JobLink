import { http } from "./http";

export type RequestStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED";

export type Request = {
  id: number;
  description?: string | null;
  status: RequestStatus;
  userId: number;
  serviceId: number;
  createdAt: string;
};

export type CreateRequestDto = {
  description?: string;
  status?: RequestStatus;
  userId: number;
  serviceId: number;
};

export type UpdateRequestDto = Partial<CreateRequestDto>;

export const requestsApi = {
  list: () => http<Request[]>("/requests"),
  create: (dto: CreateRequestDto) =>
    http<Request>("/requests", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateRequestDto) =>
    http<Request>(`/requests/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/requests/${id}`, { method: "DELETE" }),
};
