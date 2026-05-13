// ratings.controller.ts

import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Controller('ratings')
export class RatingsController {

    constructor(private readonly ratingsService: RatingsService) { }

    @Get()
    async findAll() {
        return this.ratingsService.findAll();
    }

    @Post()
    async create(
        @Body() dto: CreateRatingDto,
    ) {
        return this.ratingsService.create(dto);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.ratingsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRatingDto,
    ) {
        return this.ratingsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.ratingsService.remove(id);
    }
}