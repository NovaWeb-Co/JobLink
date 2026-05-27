import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingsApi, type CreateRatingDto, type UpdateRatingDto } from "./ratings";

const keys = { all: ["ratings"] as const };

export function useRatings() {
  return useQuery({ queryKey: keys.all, queryFn: ratingsApi.list });
}

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRatingDto) => ratingsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateRatingDto }) =>
      ratingsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ratingsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
