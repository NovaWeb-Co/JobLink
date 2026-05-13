import { RequestStatus } from "@prisma/client";

export class Request {
    id: number;
    description?: string;
    status: RequestStatus;
    userId: number;
    serviceId: number;
    createdAt: string;
    updatedAt: string;
}

export { RequestStatus };
