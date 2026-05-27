import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestsApi, type CreateRequestDto, type UpdateRequestDto } from "./requests";

const keys = { all: ["requests"] as const };

export function useRequests() {
  return useQuery({ queryKey: keys.all, queryFn: requestsApi.list });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRequestDto) => requestsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateRequestDto }) =>
      requestsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => requestsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
