import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateServiceDto) {
        return this.prisma.service.create({
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                price: dto.price,
                location: dto.location,
                availability: dto.availability,
                userId: dto.userId,
            },
            include: {
                user: true,
            },
        });
    }

    async findAll() {
        return this.prisma.service.findMany({
            orderBy: {
                id: 'asc',
            },
            include: {
                user: true,
                requests: true,
                ratings: true,
            },
        });
    }

    async findOne(id: number) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                user: true,
                requests: true,
                ratings: true,
            },
        });

        if (!service) {
            throw new NotFoundException(
                `Service ${id} no existe`,
            );
        }

        return service;
    }

    async update(id: number, dto: UpdateServiceDto) {
        await this.findOne(id);
        return this.prisma.service.update({
            where: { id },
            data: dto,
            include: {
                user: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.service.delete({
            where: { id },
        });
    }

    //Eliminar un servicio sin afectar a los demas
    async removeServiceFromUser(userId: number, serviceId: number) {

        // Buscar el servicio
        const service = await this.prisma.service.findUnique({
            where: {
                id: serviceId,
            },
        });

        // Validar existencia
        if (!service) {
            throw new NotFoundException(
                `Service ${serviceId} no existe`,
            );
        }

        // Validar propietario
        if (service.userId !== userId) {
            throw new BadRequestException(
                `El servicio no pertenece al usuario ${userId}`,
            );
        }

        // Eliminar SOLO ese servicio
        await this.prisma.service.delete({
            where: {
                id: serviceId,
            },
        });

        return {
            message: `Servicio ${serviceId} eliminado correctamente`,
        };
    }
}