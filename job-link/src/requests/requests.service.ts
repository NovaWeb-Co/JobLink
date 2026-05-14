import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {

  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateRequestDto) {
    return this.prisma.request.create({
      data: {
        description: dto.description,
        status: dto.status,
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
    return this.prisma.request.findMany({
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
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Request ${id} no existe`,
      );
    }
    return request;
  }

  async update(id: number, dto: UpdateRequestDto) {
    await this.findOne(id);
    return this.prisma.request.update({
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
    await this.prisma.request.delete({
      where: { id },
    });
  }

  //Eliminar una solicitud sin afectar a los demas

  async removeRequestFromUser(
    userId: number,
    requestId: number,
  ) {

    const request = await this.prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Request ${requestId} no existe`,
      );
    }

    if (request.userId !== userId) {
      throw new BadRequestException(
        `La solicitud no pertenece al usuario ${userId}`,
      );
    }

    await this.prisma.request.delete({
      where: {
        id: requestId,
      },
    });

    return {
      message: `Solicitud ${requestId} eliminada correctamente`,
    };
  }

}