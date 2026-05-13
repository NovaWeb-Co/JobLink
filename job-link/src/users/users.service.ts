import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                name: dto.name,
                lastname: dto.lastname,
                email: dto.email,
                password: dto.password,
                phone: dto.phone,
                address: dto.address,
                profilePhoto: dto.profilePhoto,
            },
        });
    }

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
        await this.prisma.user.delete({
            where: { id },
        });
    }
}