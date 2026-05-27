import { http } from "./http";

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
};

export type CreateServiceDto = {
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string;
  availability?: boolean;
  userId: number;
};

export type UpdateServiceDto = Partial<CreateServiceDto>;

export const servicesApi = {
  list: () => http<Service[]>("/services"),
  create: (dto: CreateServiceDto) =>
    http<Service>("/services", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateServiceDto) =>
    http<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/services/${id}`, { method: "DELETE" }),
};
