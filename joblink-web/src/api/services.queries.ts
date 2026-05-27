import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi, type CreateServiceDto, type UpdateServiceDto } from "./services";

const keys = { all: ["services"] as const };

export function useServices() {
  return useQuery({ queryKey: keys.all, queryFn: servicesApi.list });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateServiceDto) => servicesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateServiceDto }) =>
      servicesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
