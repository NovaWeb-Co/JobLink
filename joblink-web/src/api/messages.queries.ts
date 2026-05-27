import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi, type CreateMessageDto, type UpdateMessageDto } from "./messages";

const keys = { all: ["messages"] as const };

export function useMessages() {
  return useQuery({ queryKey: keys.all, queryFn: messagesApi.list });
}

export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMessageDto) => messagesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateMessageDto }) =>
      messagesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => messagesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
