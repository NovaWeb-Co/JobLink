import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

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

    async remove(
        targetId: number,
        currentUserId: number,
        currentRole: Role,
    ) {
        const targetUser =
            await this.prisma.user.findUnique({
                where: {
                    id: targetId,
                },
            });

        if (!targetUser) {
            throw new NotFoundException(
                'Usuario no encontrado',
            );
        }

        // USER
        if (currentRole === Role.USER) {
            if (currentUserId !== targetId) {
                throw new ForbiddenException(
                    'Solo puedes eliminar tu propia cuenta',
                );
            }
        }

        // ADMIN
        if (currentRole === Role.ADMIN) {
            // Puede eliminar su propia cuenta
            if (currentUserId !== targetId) {
                // Puede eliminar USER
                if (targetUser.role !== Role.USER) {
                    throw new ForbiddenException(
                        'Solo puedes eliminar usuarios normales',
                    );
                }
            }
        }

        // ROOT
        if (currentRole === Role.ROOT) {
            // No puede eliminarse a sí mismo
            if (currentUserId === targetId) {
                throw new ForbiddenException(
                    'El usuario ROOT no puede eliminar su propia cuenta',
                );
            }

            // No puede eliminar otro ROOT
            if (targetUser.role === Role.ROOT) {
                throw new ForbiddenException(
                    'No se puede eliminar un usuario ROOT',
                );
            }
        }

        return this.prisma.user.update({
            where: {
                id: targetId,
            },
            data: {
                isActive: false,
            },
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

    async reactivate(
  targetId: number,
  currentRole: Role,
) {
  const user =
    await this.prisma.user.findUnique({
      where: { id: targetId },
    });

  if (!user) {
    throw new NotFoundException(
      'Usuario no encontrado',
    );
  }

  if (
    currentRole === Role.ADMIN &&
    user.role !== Role.USER
  ) {
    throw new ForbiddenException(
      'Solo puedes reactivar usuarios normales',
    );
  }

  if (
    currentRole === Role.ROOT &&
    user.role === Role.ROOT
  ) {
    throw new ForbiddenException(
      'No puedes modificar otro ROOT',
    );
  }

  return this.prisma.user.update({
    where: {
      id: targetId,
    },
    data: {
      isActive: true,
    },
  });
}
}