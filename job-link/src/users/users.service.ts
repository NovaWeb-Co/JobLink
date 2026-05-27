import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            orderBy: {
                id: 'asc',
            },
            include: {
                services: true,
                requests: true,
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                services: true,
                requests: true,
                ratings: true,
            },
        });

        if (!user) {
            throw new NotFoundException(
                `User ${id} no existe`,
            );
        }
        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.service.deleteMany({
            where: { userId: id }
        });

        await this.prisma.user.delete({
            where: { id },
        });
    }

    async uploadPhoto(
        userId: number,
        filename: string,
    ) {

        return this.prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                profilePhoto:
                    `/uploads/${filename}`,
            },
        });
    }
}