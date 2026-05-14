import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {

    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll() {
        return this.servicesService.findAll();
    }

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
}