import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateMessageDto) {
        return this.prisma.message.create({
            data: {
                content: dto.content,
                isRead: dto.isRead,
                senderId: dto.senderId,
                receiverId: dto.receiverId,
            },
            include: {
                sender: true,
                receiver: true,
            },
        });
    }

    async findAll() {
        return this.prisma.message.findMany({
            orderBy: {
                id: 'asc',
            },
            include: {
                sender: true,
                receiver: true,
            },
        });
    }

    async findOne(id: number) {
        const message = await this.prisma.message.findUnique({
            where: { id },
            include: {
                sender: true,
                receiver: true,
            },
        });

        if (!message) {
            throw new NotFoundException(
                `Message ${id} no existe`,
            );
        }
        return message;
    }

    async update(id: number, dto: UpdateMessageDto) {
        await this.findOne(id);
        return this.prisma.message.update({
            where: { id },
            data: dto,
            include: {
                sender: true,
                receiver: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.message.delete({
            where: { id },
        });
    }
}