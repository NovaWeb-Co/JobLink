import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('services')
export class ServicesController {

    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll() {
        return this.servicesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateServiceDto,
    ) {
        return this.servicesService.create(dto);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.servicesService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateServiceDto,
    ) {
        return this.servicesService.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.servicesService.remove(id);
    }

    @Delete(':userId/remove-service/:serviceId')
    removeServiceFromUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('serviceId', ParseIntPipe) serviceId: number,
    ) {
        return this.servicesService.removeServiceFromUser(
            userId,
            serviceId,
        );
    }

    // Agregar este método al final de la clase ServicesController:
    @UseGuards(JwtAuthGuard)
    @Post(':id/upload-image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const fileName = `${Date.now()}-${file.originalname}`;
                    callback(null, fileName);
                },
            }),
        }),
    )
    async uploadImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const service = await this.servicesService.uploadImage(id, file.filename);
        return {
            message: 'Imagen subida correctamente',
            imageUrl: `/uploads/${file.filename}`,
            service,
        };
    }
}