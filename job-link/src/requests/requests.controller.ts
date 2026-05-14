// requests.controller.ts

import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller('requests')
export class RequestsController {

    constructor(private readonly requestsService: RequestsService) { }

    @Get()
    async findAll() {
        return this.requestsService.findAll();
    }

    @Post()
    async create(
        @Body() dto: CreateRequestDto,
    ) {
        return this.requestsService.create(dto);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.requestsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRequestDto,
    ) {
        return this.requestsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.requestsService.remove(id);
    }

    @Delete(':userId/remove-request/:requestId')
    removeRequestFromUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('requestId', ParseIntPipe) requestId: number,
    ) {
        return this.requestsService.removeRequestFromUser(
            userId,
            requestId,
        );
    }
}