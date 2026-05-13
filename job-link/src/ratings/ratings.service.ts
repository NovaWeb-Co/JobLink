import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateRatingDto) {
        return this.prisma.rating.create({
            data: {
                score: dto.score,
                comment: dto.comment,
                userId: dto.userId,
                serviceId: dto.serviceId,
            },
            include: {
                user: true,
                service: true,
            },
        });
    }

    async findAll() {
        return this.prisma.rating.findMany({
            orderBy: {
                id: 'asc',
            },
            include: {
                user: true,
                service: true,
            },
        });
    }

    async findOne(id: number) {
        const rating = await this.prisma.rating.findUnique({
            where: { id },
            include: {
                user: true,
                service: true,
            },
        });

        if (!rating) {
            throw new NotFoundException(
                `Rating ${id} no existe`,
            );
        }
        return rating;
    }

    async update(id: number, dto: UpdateRatingDto) {
        await this.findOne(id);
        return this.prisma.rating.update({
            where: { id },
            data: dto,
            include: {
                user: true,
                service: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.rating.delete({
            where: { id },
        });
    }
}