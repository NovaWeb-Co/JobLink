import { http } from "./http";

export type Rating = {
  id: number;
  score: number;
  comment?: string | null;
  userId: number;
  serviceId: number;
  createdAt: string;
};

export type CreateRatingDto = {
  score: number;
  comment?: string;
  userId: number;
  serviceId: number;
};

export type UpdateRatingDto = Partial<CreateRatingDto>;

export const ratingsApi = {
  list: () => http<Rating[]>("/ratings"),
  create: (dto: CreateRatingDto) =>
    http<Rating>("/ratings", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateRatingDto) =>
    http<Rating>(`/ratings/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/ratings/${id}`, { method: "DELETE" }),
};
