import { http } from "./http";

export type Message = {
  id: number;
  content: string;
  isRead: boolean;
  senderId: number;
  receiverId: number;
  createdAt: string;
};

export type CreateMessageDto = {
  content: string;
  isRead?: boolean;
  senderId: number;
  receiverId: number;
};

export type UpdateMessageDto = Partial<CreateMessageDto>;

export const messagesApi = {
  list: () => http<Message[]>("/messages"),
  create: (dto: CreateMessageDto) =>
    http<Message>("/messages", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateMessageDto) =>
    http<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/messages/${id}`, { method: "DELETE" }),
};
