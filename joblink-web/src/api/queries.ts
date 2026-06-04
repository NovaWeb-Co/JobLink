import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  usersApi, servicesApi, requestsApi, ratingsApi, messagesApi,
  type Service, type User, type Request, type Rating, type Message, type RequestStatus,
} from "./index";


// ─── Services ────────────────────────────────────────────────────────────────
export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
}
export function useCreateService() {
  return useMutation({
    mutationFn: (dto: Parameters<typeof servicesApi.create>[0]) => servicesApi.create(dto),
    // No invalidar automáticamente — MyProfilePage lo hace manualmente
    // DESPUÉS de subir la foto para que imageUrl ya esté en el servicio
  });
}

// Invalidar servicios manualmente después del upload
export function useInvalidateServices() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["services"] });
}
export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<Service> }) => servicesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
// Para ADMIN: usa DELETE /services/:id (requiere rol ADMIN)
export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

// Para usuario normal: usa DELETE /services/:userId/remove-service/:serviceId
export function useDeleteMyService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, serviceId }: { userId: number; serviceId: number }) =>
      servicesApi.removeFromUser(userId, serviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Partial<User>;
    }) => usersApi.update(id, dto),

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["users"],
      }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      usersApi.remove(id),

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["users"],
      }),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      usersApi.reactivate(id),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}

// ─── Requests ────────────────────────────────────────────────────────────────
export function useRequests() {
  return useQuery({ queryKey: ["requests"], queryFn: requestsApi.list });
}
export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { description?: string; status?: RequestStatus; userId: number; serviceId: number }) =>
      requestsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}
export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<Request> }) => requestsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}
export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => requestsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

// ─── Ratings ─────────────────────────────────────────────────────────────────
export function useRatings() {
  return useQuery({ queryKey: ["ratings"], queryFn: ratingsApi.list });
}
export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { score: number; comment?: string; userId: number; serviceId: number }) =>
      ratingsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ratings"] }),
  });
}
export function useUpdateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<Rating> }) => ratingsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ratings"] }),
  });
}
export function useDeleteRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ratingsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ratings"] }),
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: messagesApi.list,
    refetchInterval: 5000,        // refresca cada 5 segundos automáticamente
    refetchIntervalInBackground: true, // sigue refrescando aunque la pestaña no esté activa
  });
}
export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { content: string; isRead?: boolean; senderId: number; receiverId: number }) =>
      messagesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

// Marca todos los mensajes no leídos de una conversación como leídos
export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageIds: number[]) =>
      Promise.all(messageIds.map(id => messagesApi.update(id, { isRead: true }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<Message> }) => messagesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}
export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => messagesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: number;
      role: "USER" | "ADMIN";
    }) => usersApi.updateRole(id, role),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
